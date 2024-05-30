import express from "express";
import cors from "cors";
import familyRoutes from "./routes/familyRoutes.js";
import { verifyConnection } from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", familyRoutes);

const startServer = async () => {
  try {
    await verifyConnection(); // Verify the database connection before starting the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
