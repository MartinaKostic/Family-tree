import { driver as neo4jDriver, auth } from "neo4j-driver";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;
const driver = neo4jDriver(URI, auth.basic(USER, PASSWORD));

const verifyConnection = async () => {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log("Connection established");
    console.log(serverInfo);
  } catch (err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
  }
};

const getSession = () => driver.session();

const closeDriver = async () => {
  await driver.close();
};

export { driver, getSession, verifyConnection, closeDriver };
