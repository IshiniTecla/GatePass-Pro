import express from "express";
import Visitor from "../models/Visitor.js";

const router = express.Router();

// Facial Check-In (POST)
router.post("/visitor-checkin", async (req, res) => {
  try {
    const { checkInTime, photo } = req.body;

    if (!photo || !checkInTime) {
      return res
        .status(400)
        .json({ message: "Missing check-in time or photo." });
    }

    const visitor = new Visitor({
      checkInTime,
      photo,
    });

    await visitor.save();

    res.status(201).json({ message: "Facial Check-In successful!", visitor });
  } catch (error) {
    res.status(500).json({ message: "Error saving check-in data", error });
  }
});

// Manual Check-In (POST)
router.post("/checkin", async (req, res) => {
  try {
    const { visitorName, email, contactNumber, checkInTime } = req.body;

    if (!visitorName || !email || !contactNumber || !checkInTime) {
      return res
        .status(400)
        .json({ message: "All fields are required for manual check-in." });
    }

    const visitor = new Visitor({
      visitorName,
      email,
      contactNumber,
      checkInTime,
      photo: "Manual check-in - no photo", // No photo for manual check-in
    });

    await visitor.save();
    res.status(201).json({ message: "Manual Check-In successful!", visitor });
  } catch (error) {
    console.error("Error in manual check-in:", error);
    res.status(500).json({ message: "Failed to check in", error });
  }
});

export default router;
