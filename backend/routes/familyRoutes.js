import express from "express";
import {
  getFamilyTree,
  addPerson,
  deletePersonByName,
} from "../controllers/familyController.js";

const router = express.Router();

router.get("/family-tree", getFamilyTree);
router.post("/add-person", addPerson);
router.delete("/delete-person-by-name/:name", deletePersonByName);

export default router;
