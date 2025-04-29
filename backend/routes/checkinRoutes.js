import express from "express";
import nodemailer from "nodemailer";
import Checkin from "../models/Checkin.js";
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

// Route for sending OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  // Validate the email
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();

    // Save OTP in the database or session for verification later
    // Assuming you have a `Checkin` model or other place to store OTP
    const checkin = await Checkin.findOne({ email });
    if (checkin) {
      checkin.otp = otp; // Update OTP field for that visitor
      await checkin.save();
    } else {
      await Checkin.create({ email, otp }); // Create new visitor with OTP
    }

    // Send OTP email
    await transporter.sendMail({
      to: email,
      subject: "Your OTP Code for Check-In",
      text: `Your OTP code is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Error sending OTP." });
  }
});

// Route for OTP verification
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  // Validate OTP
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const checkin = await Checkin.findOne({ email });
    if (!checkin) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    if (checkin.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP is valid
    checkin.otpVerified = true; // Set OTP verified flag
    await checkin.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Error verifying OTP." });
  }
});

// 🔥 Manual Check-In Route (POST)
router.post("/manual", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      visitPurpose,
      responsiblePerson,
      checkInTime,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !visitPurpose ||
      !responsiblePerson ||
      !checkInTime
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newVisitor = new Checkin({
      visitorName: fullName, // ✅ Map fullName to visitorName
      email,
      contactNumber: phone, // ✅ Map phone to contactNumber
      visitPurpose,
      responsiblePerson,
      checkInTime: new Date(checkInTime),
      isVerified: false,
      photo: "N/A", // Placeholder since no photo uploaded in manual
      otp: null, // ✅ No OTP needed for manual
    });

    await newVisitor.save();

    res.status(201).json({
      message: "Manual check-in successful!",
      visitorId: newVisitor._id,
    });
  } catch (error) {
    console.error("Manual Check-In Error:", error);
    res.status(500).json({ message: "Manual check-in failed.", error });
  }
});

// **GET All Check-ins (Visitors)**
router.get("/all", async (req, res) => {
  try {
    const visitors = await Checkin.find();
    console.log("Fetched visitors:", visitors); // Log the fetched visitors
    res.status(200).json(visitors);
  } catch (error) {
    console.error("Fetch Check-ins Error:", error);
    res.status(500).json({ message: "Failed to fetch visitors", error });
  }
});

// **GET Single Check-in (Visitor)**
router.get("/:visitorId", async (req, res) => {
  try {
    const visitor = await Checkin.findById(req.params.visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }
    res.status(200).json(visitor);
  } catch (error) {
    console.error("Fetch Single Check-in Error:", error);
    res.status(500).json({ message: "Failed to fetch visitor", error });
  }
});

// **PUT Edit Check-in (Update visitor details)**
router.put("/:visitorId", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      visitPurpose,
      responsiblePerson,
      checkInTime,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !visitPurpose ||
      !responsiblePerson ||
      !checkInTime
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const visitor = await Checkin.findById(req.params.visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Update visitor details
    visitor.fullName = fullName;
    visitor.email = email;
    visitor.phone = phone;
    visitor.visitPurpose = visitPurpose;
    visitor.responsiblePerson = responsiblePerson;
    visitor.checkInTime = new Date(checkInTime);

    await visitor.save();

    res.status(200).json({
      message: "Check-in details updated successfully",
      visitorId: visitor._id,
    });
  } catch (error) {
    console.error("Edit Check-in Error:", error);
    res.status(500).json({ message: "Failed to update check-in", error });
  }
});

// **DELETE Check-in (Remove a visitor)**
router.delete("/:visitorId", async (req, res) => {
  try {
    const visitor = await Checkin.findByIdAndDelete(req.params.visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json({
      message: "Visitor deleted successfully",
      visitorId: visitor._id,
    });
  } catch (error) {
    console.error("Delete Check-in Error:", error);
    res.status(500).json({ message: "Failed to delete visitor", error });
  }
});

export default router;
