import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const router = express.Router();

// Debug: Check if environment variables are loaded correctly
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "******" : "MISSING");

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP function
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// **GET All Visitors**
router.get("/all", async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.status(200).json(visitors);
  } catch (error) {
    console.error("Fetch Visitors Error:", error);
    res.status(500).json({ message: "Failed to fetch visitors", error });
  }
});

// **Send OTP Route (POST)**
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const otp = generateOTP();

    const visitor = new Visitor({
      email,
      otp,
      isVerified: false,
      checkInTime: new Date(), // Dummy value
      photo: "N/A", // Dummy value
    });

    await visitor.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification for GatePass Pro Check-In",
      text: `Your OTP for check-in is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Nodemailer Error:", error);
        return res.status(500).json({ message: "Failed to send OTP.", error });
      }
      console.log("Email Sent: ", info);
      res.status(200).json({
        message: "OTP sent to email.",
        visitorId: visitor._id,
      });
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP.", error });
  }
});

// **Verify OTP & Check-In Route (POST)**
router.post("/verify-otp", async (req, res) => {
  try {
    const { visitorName, email, contactNumber, checkInTime, otp } = req.body;

    if (!visitorName || !email || !contactNumber || !checkInTime || !otp) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    if (visitor.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Update visitor details
    visitor.visitorName = visitorName;
    visitor.contactNumber = contactNumber;
    visitor.checkInTime = new Date(checkInTime);
    visitor.otp = null;
    visitor.isVerified = false; // Admin verification pending

    await visitor.save();

    res.status(200).json({
      message: "OTP verified. Check-in successful. Awaiting admin approval.",
      visitorId: visitor._id,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "OTP verification failed.", error });
  }
});

// **Admin Verification Route (PATCH)**
router.patch("/admin-verify/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    visitor.isVerified = true;
    await visitor.save();

    res.status(200).json({
      message: "Visitor successfully verified by admin.",
      visitor,
    });
  } catch (error) {
    console.error("Admin Verification Error:", error);
    res.status(500).json({ message: "Admin verification failed.", error });
  }
});

export default router;
