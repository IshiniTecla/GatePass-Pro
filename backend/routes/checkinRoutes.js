import express from "express";
import multer from "multer";
import {
  sendOTP,
  verifyOTP,
  manualCheckin,
  handleFaceCheckIn,
  getAllCheckins,
  getCheckinsByUserId,
  getSingleCheckin,
  updateCheckin,
  deleteCheckin,
} from "../controllers/checkinController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// OTP Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Check-In Routes
router.post("/manual", manualCheckin);
router.post("/face-check-in", upload.single("photo"), handleFaceCheckIn);

// Get All Check-ins
router.get("/all", getAllCheckins);

// ✅ Place more specific route before the general one
router.get("/users/:userId", getCheckinsByUserId);

// Get Single Check-in (by Visitor ID)
router.get("/:visitorId", getSingleCheckin);

// Update Check-in
router.put("/:visitorId", updateCheckin);

// Delete Check-in
router.delete("/:visitorId", deleteCheckin);

export default router;
