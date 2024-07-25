import express from "express";
import {
  getFamilyTree,
  addPerson,
  deletePersonByName,
  editPersonDetails,
} from "../controllers/familyController.js";

const router = express.Router();

router.get("/family-tree", getFamilyTree);
router.post("/add-person", addPerson);
router.delete("/delete-person-by-name/:name", deletePersonByName);
router.put("/update-person/:personId", editPersonDetails);
export default router;
