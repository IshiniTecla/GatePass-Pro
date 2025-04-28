import express from "express";
import { saveFacePhoto } from "../controllers/facePhotoController.js";

const router = express.Router();

router.post("/save-face-photo", saveFacePhoto);

export default router;
