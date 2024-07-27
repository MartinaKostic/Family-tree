import express from "express";
import {
  getFamilyTree,
  addPerson,
  deletePersonByName,
  editPersonDetails,
  signUp,
  signIn,
  getRootNode,
} from "../controllers/familyController.js";

const router = express.Router();

router.get("/family-tree", getFamilyTree);
router.get("/get-root-node", getRootNode);
router.post("/add-person", addPerson);
router.delete("/delete-person-by-name/:name", deletePersonByName);
router.put("/update-person/:personId", editPersonDetails);
router.post("/signup", signUp);
router.post("/signin", signIn);

export default router;
