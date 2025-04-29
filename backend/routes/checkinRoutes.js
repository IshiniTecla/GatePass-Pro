import express from "express";
import multer from "multer"; // Add multer for handling file uploads
import {
  sendOTP,
  verifyOTP,
  manualCheckin,
  handleFaceCheckIn, // Import the new face check-in handler
  getAllCheckins,
  getSingleCheckin,
  updateCheckin,
  deleteCheckin,
} from "../controllers/checkinController.js";

const router = express.Router();

// Set up Multer to handle file uploads (photo)
const upload = multer({ dest: "uploads/" });

// OTP Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Check-In Routes
router.post("/manual", manualCheckin);
router.post("/face-check-in", upload.single("photo"), handleFaceCheckIn); // Route for face check-in

// Get All Check-ins
router.get("/all", getAllCheckins);

// Get Single Check-in
router.get("/:visitorId", getSingleCheckin);

// Update Check-in
router.put("/:visitorId", updateCheckin);

// Delete Check-in
router.delete("/:visitorId", deleteCheckin);

export default router;
