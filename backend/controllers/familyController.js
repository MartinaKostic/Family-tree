import { getSession } from "../config/db.js";

export const updatePersonInDatabase = async (personId, updateData) => {
  const session = getSession();
  // Building the SET part of the query dynamically based on the properties provided
  const sets = Object.keys(updateData)
    .map((key) => `p.${key} = $${key}`)
    .join(", ");

  const query = `
    MATCH (p:Person)
    WHERE id(p) = $personId
    SET ${sets}
    RETURN p `;

  try {
    const result = await session.run(query, { personId, ...updateData });
    console.log(result.records);
    if (result.records.length > 0) {
      // Assuming the first record is the person updated
      return {
        ...result.records[0].get("p").properties,
        id: result.records[0].get("p").identity.toInt(), // or .toNumber()
      };
    } else {
      // throw new Error("No person found with the given ID.");
    }
  } catch (error) {
    console.error("Error updating person in database:", error);
    throw error; // Re-throw the error for further handling
  } finally {
    await session.close();
  }
};

const fetchFamilyTree = async (session) => {
  const result = await session.run(`
  MATCH (p:Person)
  OPTIONAL MATCH (p)-[:PARENT_OF]->(c:Person)
  OPTIONAL MATCH (p)-[:SPOUSE_OF]-(s:Person)  
  RETURN p, id(p) AS personId,
    collect(DISTINCT {child: c, childId: id(c)}) AS children,
    collect(DISTINCT {spouse: s, spouseId: id(s)}) AS spouses
    `);

  return result.records.map((record) => ({
    person: {
      ...(record.get("p").properties || []),
      id: record.get("personId").toNumber(),
    },
    children: record.get("children")
      ? record.get("children")?.map((childRecord) => ({
          ...(childRecord?.child?.properties || []),
          id: childRecord?.childId?.toNumber(),
        }))
      : [],
    spouses: record.get("spouses")
      ? record.get("spouses").map((spouseRecord) => ({
          ...(spouseRecord?.spouse?.properties || []),
          id: spouseRecord?.spouseId?.toNumber(),
        }))
      : [],
  }));
};

export const getFamilyTree = async (_req, res) => {
  const session = getSession();
  try {
    const records = await fetchFamilyTree(session);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

export const addPerson = async (req, res) => {
  const session = getSession();
  console.log("data", req.body);
  const { firstname, birthdate, id, type } = req.body;

  let createPersonQuery = `
    CREATE (c:Person {name: $firstname, birthDate: $birthdate})
    WITH c
  `;

  let parameters = { firstname, birthdate, id };

  if (type === "spouse") {
    createPersonQuery += `
      MATCH (p:Person)
      WHERE id(p) = $id
      MERGE (p)-[:SPOUSE_OF]->(c)
    `;
  } else if (type === "child") {
    createPersonQuery += `
      MATCH (p:Person)
      WHERE id(p) = $id
      MERGE (p)-[:PARENT_OF]->(c)
    `;
  }

  try {
    await session.run(createPersonQuery, parameters);
    const records = await fetchFamilyTree(session); // Fetch the updated family tree
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

export const deletePersonByName = async (req, res) => {
  const personName = req.params.name; // Get the name from request parameters
  const session = getSession();

  try {
    const result = await session.run(
      `MATCH (p:Person {name: $personName})
      DETACH DELETE p
      RETURN COUNT(p) as count
    `,
      { personName }
    );

    const count = result.records[0].get("count").toInt();

    if (count === 0) {
      res.status(404).json({ message: "No person found with that name" });
    } else {
      res.status(200).json({ message: "Person(s) deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting person by name:", error);
    res
      .status(500)
      .json({ error: "Failed to delete person: " + error.message });
  } finally {
    await session.close();
  }
};

export const editPersonDetails = async (req, res) => {
  const { personId } = req.params;
  const updateData = req.body;
  console.log(personId, updateData);
  try {
    const updatedPerson = await updatePersonInDatabase(+personId, updateData);
    console.log("UPDATED PERSONA", updatedPerson);
    res.json(updatedPerson);
  } catch (error) {
    console.error("Failed to update person:", error);
    res.status(500).send("Failed to update person.");
  }
};
