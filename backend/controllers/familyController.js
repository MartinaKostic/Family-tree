import { getSession } from "../config/db.js";

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
  const { name, parent1, parent2, siblingOf, spouseOf } = req.body;

  let createPersonQuery = `
    MERGE (c:Person {name: $name})
  `;

  let parameters = { name };

  if (parent1) {
    createPersonQuery += `
    MERGE (p1:Person {name: $parent1})
    MERGE (p1)-[:PARENT_OF]->(c)
  `;
    parameters.parent1 = parent1;
  }

  if (parent2) {
    createPersonQuery += `
    MERGE (p2:Person {name: $parent2})
    MERGE (p2)-[:PARENT_OF]->(c)
  `;
    parameters.parent2 = parent2;
  }

  // Ensure spouses are linked if both parents are specified
  if (parent1 && parent2) {
    createPersonQuery += `
    MERGE (p1)-[:SPOUSE_OF]->(p2)
  `;
  }

  if (siblingOf) {
    createPersonQuery += `
      MATCH (s:Person {name: $siblingOf})
      MATCH (s)-[:PARENT_OF]->(p)<-[:PARENT_OF]-(c)
    `;
    parameters.siblingOf = siblingOf;
  }

  if (spouseOf) {
    createPersonQuery += `
      MERGE (s:Person {name: $spouseOf})
      MERGE (s)-[:SPOUSE_OF]->(c)
    `;
    parameters.spouseOf = spouseOf;
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
