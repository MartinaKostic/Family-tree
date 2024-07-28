import { getSession } from "../config/db.js";
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");

export const createRootNode = async (req, res) => {
  const session = getSession();
  const { userId, name, birthDate, deathDate, job, description } = req.body;

  const query = `
    CREATE (n:Person {name: $name, birthDate: $birthDate, deathDate: $deathDate, job: $job, description: $description, isRoot: true})
    WITH n
    MATCH (u:User {id: $userId})
    CREATE (u)-[:HAS_ROOT]->(n)
    RETURN n
  `;

  try {
    await session.run(query, {
      userId,
      name,
      birthDate,
      deathDate,
      job,
      description,
    });
    res.status(201).send("Root node created successfully");
  } catch (error) {
    console.error("Error creating root node:", error);
    res.status(500).send("Error creating root node");
  } finally {
    session.close();
  }
};

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

export const getRootNode = async (_req, res) => {
  const session = getSession();
  try {
    const result = await session.run(
      "MATCH (n:Person {isRoot: true}) RETURN n LIMIT 1"
    );
    if (result.records.length > 0) {
      const rootNode = result.records[0].get("n").properties;
      res.status(200).json(rootNode);
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
  const { name, username, email, password } = req.body;
  const session = getSession();

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const info = {
      name: name,
      username: username,
      email: email,
      hashedPassword: hashedPassword, // Ensure this key matches the one used in the query
    };

    const query = `
      CREATE (u:User {name: $name, username: $username, password: $hashedPassword, email: $email})
      RETURN u.username AS username, u.email AS email, id(u) AS userId`;

    const result = await session.run(query, info);

    if (result.records.length === 0) {
      throw new Error("User not created");
    }

    const user = result.records[0];
    const userId = user.get("userId");

    // Generate a JWT
    const token = jwt.sign(
      {
        userId: userId,
        username: user.get("username"),
        email: user.get("email"),
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    if (result.records.length > 0) {
      const user = result.records[0].get("u").properties;
      res.status(201).json({
        message: "User successfully created",
        user: { username: user.username, email: user.email, id: userId },
        token,
      });
    } else {
      throw new Error("User not created");
    }
  } catch (error) {
    if (error.message.includes("ConstraintValidationFailed")) {
      res.status(409).json({
        message: "Username or email already exists",
        error: error.message,
      });
    } else {
      console.error("Signup error:", error);
      res.status(500).json({
        message: "Failed to create user",
        error: error.message,
      });
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
    RETURN u.password AS hashedPassword, id(u) AS userId, u.username AS username, u.email AS email`;

  try {
    const result = await session.run(query, { username });

    if (result.records.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userRecord = result.records[0];
    const hashedPassword = userRecord.get("hashedPassword");

    const passwordIsValid = await bcrypt.compare(password, hashedPassword);
    if (!passwordIsValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // Generate a JWT
    const token = jwt.sign(
      {
        userId: userRecord.get("userId"),
        username: userRecord.get("username"),
        email: userRecord.get("email"),
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.json({
      message: "Successfully signed in",
      token,
      user: {
        id: userRecord.get("userId"),
        username: userRecord.get("username"),
        email: userRecord.get("email"),
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ error: "Failed to sign in: " + error.message });
  } finally {
    await session.close();
  }
};
