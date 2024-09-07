import { getSession } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createRootNode = async (req, res) => {
  const session = getSession();

  const { userId, name, birthDate, deathDate, profession, description } =
    req.body;

  let newFileName = req.file?.originalname
    ? `http://localhost:5000/uploads/${req.file.originalname}`
    : null;

  const query = `
    CREATE (n:Person {name: $name, birthDate: $birthDate, deathDate: $deathDate, profession: $profession, description: $description,  imageUrl: $newFileName, isRoot: true})
    WITH n
    MATCH (u:User)
    WHERE ID(u) = toInteger($userId)
    CREATE (u)-[:HAS_ROOT]->(n)
    RETURN n
  `;
  let parameters = {
    userId: +userId,
    name,
    birthDate,
    deathDate,
    profession,
    description,
    newFileName,
  };

  try {
    await session.run(query, parameters);
    res.status(201).send("Root node created successfully");
  } catch (error) {
    console.error("Error creating root node:", error);
    res.status(500).send("Error creating root node");
  } finally {
    session.close();
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
  const {
    firstname,
    birthdate,
    id,
    deathdate,
    profession,
    description,
    type,
    userId,
    parentName,
    parentId,
    otherParentName,
  } = req.body;

  let newFileName = req.file?.originalname
    ? `http://localhost:5000/uploads/${req.file.originalname}`
    : null;

  let createPersonQuery = `
    CREATE (c:Person {name: $firstname, birthDate: $birthdate, deathDate: $deathdate, description: $description, profession: $profession, isRoot: false, imageUrl: $newFileName, parentName: $parentName, parentId:$parentId, otherParentName: $otherParentName})
    WITH c
  `;

  const parent1 = type === "child" ? parentName : null;

  let parameters = {
    firstname,
    birthdate,
    id: +id,
    deathdate,
    description,
    profession,
    newFileName,
    parentName: parent1,
    parentId: parentId || null,
    otherParentName: otherParentName || null,
  };

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
  } else if (type === "parent") {
    createPersonQuery += `
      MATCH (p:Person)
      WHERE id(p) = $id
      MERGE (c)-[:PARENT_OF]->(p)
      RETURN id(c) AS newRootId
    `;
  }
  const result = await session.run(createPersonQuery, parameters);

  if (type === "parent") {
    const currentRootId = +id;
    const newRootId = result.records[0].get("newRootId").low;
    const user = +userId;
    const parameters2 = { currentRootId, newRootId, user };
    const updateRootQuery = `
      MATCH (u:User WHERE id(u) = $user)-[r:HAS_ROOT]->(currentRoot:Person WHERE id(currentRoot) = $currentRootId)
      DELETE r
      SET currentRoot.isRoot = false
      WITH u
      MATCH (newRoot:Person WHERE id(newRoot) = $newRootId)
      MERGE (u)-[:HAS_ROOT]->(newRoot)
      SET newRoot.isRoot = true
      RETURN newRoot`;

    await session.run(updateRootQuery, parameters2);
  }
  const records = await fetchFamilyTree(session); // Fetch the updated family tree
  await session.close();

  res.status(200).json(records);
};

export const deletePerson = async (req, res) => {
  const personId = req.params.id; // Get the name from request parameters
  const session = getSession();

  try {
    const result = await session.run(
      `MATCH (p:Person) WHERE id(p) = toInteger($personId) DETACH DELETE p RETURN COUNT(p) AS count`,
      { personId }
    );

    const count = result.records[0].get("count").toInt();
    if (count === 0) {
      res.status(404).json({ message: "No person found with that ID" });
    } else {
      res.status(200).json({ message: "Person deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ error: "Failed to delete person" });
  } finally {
    session.close();
  }
};

export const updatePersonInDatabase = async (personId, updateData) => {
  const session = getSession();
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
    if (result.records.length > 0) {
      // the first record is the person updated
      return {
        ...result.records[0].get("p").properties,
        id: result.records[0].get("p").identity.toInt(),
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

export const editPersonDetails = async (req, res) => {
  const { personId } = req.params;
  let updateData = { ...req.body };
  if (req.file?.originalname) {
    const imageUrl = `http://localhost:5000/uploads/${req.file.originalname}`;
    updateData = { ...updateData, imageUrl: imageUrl };
  }

  try {
    const updatedPerson = await updatePersonInDatabase(+personId, updateData);
    res.json(updatedPerson);
  } catch (error) {
    console.error("Failed to update person:", error);
    res.status(500).send("Failed to update person.");
  }
};

export const getRootNode = async (req, res) => {
  const userId = +req.query.userId;
  const session = getSession();
  try {
    const result = await session.run(
      `
        MATCH (u:User)-[:HAS_ROOT]->(root:Person)
        WHERE id(u) = $userId
        RETURN root LIMIT 1
        `,
      { userId }
    );

    if (result.records.length > 0) {
      const rootNode = result.records[0].get("root");
      const properties = rootNode.properties;
      const returnObject = {
        ...properties,
        id: rootNode.identity.low,
      };

      res.status(200).json(returnObject);
    } else {
      res.status(404).json({ message: "Root node not found." });
    }
  } catch (error) {
    console.error("Failed to fetch root node:", error);
    res.status(500).json({ error: "Failed to fetch root node." });
  } finally {
    session.close();
  }
};

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export const signUp = async (req, res) => {
  const { name, username, email, password, familyName } = req.body;
  const session = getSession();
  try {
    // Hashiranje lozinke
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const info = {
      name: name,
      username: username,
      email: email,
      hashedPassword: hashedPassword,
      familyName: familyName,
    };

    const query = `
      CREATE (u:User {name: $name, username: $username, password: $hashedPassword, email: $email, familyName: $familyName})
      RETURN u.username AS username, u.email AS email, id(u) AS userId, u.familyName AS familyName`;

    const result = await session.run(query, info);

    if (result.records.length === 0) {
      throw new Error("User not created");
    }

    const userRecord = result.records[0];
    const userId = userRecord.get("userId");
    const usernameReturned = userRecord.get("username");
    const emailReturned = userRecord.get("email");

    // Generiranje JWT
    const token = jwt.sign(
      {
        userId: userId,
        username: usernameReturned,
        email: emailReturned,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User successfully created",
      token,
      user: {
        id: userId,
        username: usernameReturned,
        email: emailReturned,
        familyName: familyName,
      },
    });
  } catch (error) {
    if (error.code === "Neo.ClientError.Schema.ConstraintValidationFailed") {
      if (error.message.includes("username")) {
        res
          .status(409)
          .send({ error: "User with that username already exists" });
      } else if (error.message.includes("email")) {
        res.status(409).send({ error: "User with that e-mail already exists" });
      }
    } else {
      res.status(500).send({ error: "Failed to create user" });
    }
  } finally {
    await session.close();
  }
};

export const signIn = async (req, res) => {
  const { username, password } = req.body;
  const session = getSession();
  const query = `
    MATCH (u:User {username: $username})
    RETURN u.password AS hashedPassword, id(u) AS userId, u.username AS username, u.email AS email, u.familyName AS familyName`;
  try {
    const result = await session.run(query, { username });
    if (result.records.length === 0) {
      res.status(404).json({ message: "Invalid credentials" });
      return;
    }
    const userRecord = result.records[0];
    const hashedPassword = userRecord.get("hashedPassword");
    const passwordIsValid = await bcrypt.compare(password, hashedPassword);
    if (!passwordIsValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      {
        userId: userRecord.get("userId"),
        username: userRecord.get("username"),
        email: userRecord.get("email"),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Successfully signed in",
      token,
      user: {
        id: userRecord.get("userId"),
        username: userRecord.get("username"),
        email: userRecord.get("email"),
        familyName: userRecord.get("familyName"),
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ error: "Failed to sign in: " + error.message });
  } finally {
    await session.close();
  }
};
export const getPossibleParents = async (req, res) => {
  const parentId = req.params.personId;
  const session = getSession();

  try {
    console.log("Fetching possible parents for parentId:", parentId); // Debugg
    const query = `
      MATCH (p:Person)-[:SPOUSE_OF]-(s:Person)
      WHERE id(p) = $parentId
      RETURN s
    `;

    const result = await session.run(query, { parentId: +parentId });
    const spouses = result.records.map((record) => {
      const spouseNode = record.get("s");
      return {
        id: spouseNode.identity.low,
        name: spouseNode.properties.name,
      };
    });

    res.status(200).json(spouses);
  } catch (error) {
    console.error("Failed to fetch possible parents:", error);
    res.status(500).json({ error: "Failed to fetch possible parents." });
  } finally {
    await session.close();
  }
};
