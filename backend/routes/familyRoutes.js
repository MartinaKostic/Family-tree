import express from "express";
import { getFamilyTree, addPerson } from "../controllers/familyController.js";

const router = express.Router();

router.get("/family-tree", getFamilyTree);
router.post("/add-person", addPerson);

export default router;
