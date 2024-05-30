import { getSession } from "../config/db.js";

export const getFamilyTree = async (_req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (p:Person)-[:PARENT_OF]->(c:Person)
      OPTIONAL MATCH (p)-[:SPOUSE_OF]-(s:Person)
      RETURN p, id(p) AS parentId, collect(DISTINCT {child: c, childId: id(c)}) AS children, collect(DISTINCT {spouse: s, spouseId: id(s)}) AS spouses
    `);

    const records = result.records.map((record) => ({
      parent: {
        ...record.get("p").properties,
        id: record.get("parentId").toNumber(),
      },
      children: record.get("children").map((childRecord) => ({
        ...childRecord.child.properties,
        id: childRecord.childId.toNumber(),
      })),
      spouses: record.get("spouses").map((spouseRecord) => ({
        ...spouseRecord.spouse.properties,
        id: spouseRecord.spouseId.toNumber(),
      })),
    }));

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

export const addPerson = async (req, res) => {
  const session = getSession();
  const { name, parent1, parent2 } = req.body;

  const createPersonQuery = `
    MERGE (p1:Person {name: $parent1})
    MERGE (p2:Person {name: $parent2})
    CREATE (c:Person {name: $name})
    MERGE (p1)-[:PARENT_OF]->(c)
    MERGE (p2)-[:PARENT_OF]->(c)
  `;

  try {
    await session.run(createPersonQuery, { name, parent1, parent2 });
    res.status(200).json({ message: "Person added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};
