import express from "express";
import {
  getFamilyTree,
  addPerson,
  deletePersonByName,
  editPersonDetails,
  signUp,
  signIn,
  getRootNode,
  createRootNode,
} from "../controllers/familyController.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Set the destination directory for file uploads
  },
  filename: function (req, file, cb) {
    // Set the file name to original name
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/create-root-node", createRootNode);
router.get("/family-tree", getFamilyTree);
router.get("/get-root-node", getRootNode);
router.post("/add-person", upload.single("file"), addPerson);
router.delete("/delete-person-by-name/:name", deletePersonByName);
router.put("/update-person/:personId", editPersonDetails);
router.post("/signup", signUp);
router.post("/signin", signIn);

export default router;
