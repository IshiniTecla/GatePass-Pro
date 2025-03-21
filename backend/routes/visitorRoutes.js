import express from "express";
import Visitor from "../models/Visitor.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP function
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Manual Check-In (POST) with OTP
router.post("/checkin", async (req, res) => {
  try {
    const { visitorName, email, contactNumber, checkInTime } = req.body;

    if (!visitorName || !email || !contactNumber || !checkInTime) {
      return res.status(400).json({
        message: "All fields are required for manual check-in.",
      });
    }

    const otp = generateOTP();

    const visitor = new Visitor({
      visitorName,
      email,
      contactNumber,
      checkInTime,
      photo: "Manual check-in - no photo",
      otp,
      isVerified: false,
    });

    await visitor.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for GatePass Pro Check-In",
      text: `Your OTP for check-in is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "OTP sent to email. Please verify to complete check-in.",
      visitor,
    });
  } catch (error) {
    console.error("Manual check-in error:", error);
    res.status(500).json({ message: "Failed to check in", error });
  }
});

// OTP Verification (POST)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    if (visitor.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    visitor.otp = null; // Clear OTP after verification
    await visitor.save();

    res.status(200).json({ message: "OTP verified. Awaiting admin approval." });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error });
  }
});

// Admin Verification (PATCH)
router.patch("/admin-verify/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    visitor.isVerified = true;
    await visitor.save();

    res.status(200).json({ message: "Visitor verified by admin.", visitor });
  } catch (error) {
    res.status(500).json({ message: "Admin verification failed.", error });
  }
});

// Facial Check-In (POST)
router.post("/visitor-checkin", async (req, res) => {
  try {
    const { checkInTime, photo } = req.body;

    if (!photo || !checkInTime) {
      return res.status(400).json({
        message: "Missing check-in time or photo.",
      });
    }

    const visitor = new Visitor({
      checkInTime,
      photo,
    });

    await visitor.save();

    res.status(201).json({
      message: "Facial Check-In successful!",
      visitor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving check-in data.",
      error,
    });
  }
});

export default router;
