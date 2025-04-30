import Checkin from "../models/Checkin.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import { exec } from "child_process"; // For Python face recognition integration (optional)

dotenv.config(); // Load environment variables

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

// Controller for sending OTP
const sendOTP = async (req, res) => {
  const { email } = req.body;

  // Validate the email
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();

    // Save OTP in the database or session for verification later
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
};

// Controller for OTP verification
const verifyOTP = async (req, res) => {
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
    checkin.isVerified = true; // Set verification status to true
    checkin.otp = null; // Clear OTP after successful verification
    await checkin.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Error verifying OTP." });
  }
};

// Controller for manual check-in
const manualCheckin = async (req, res) => {
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

  try {
    const newVisitor = new Checkin({
      visitorName: fullName,
      email,
      contactNumber: phone,
      visitPurpose,
      responsiblePerson,
      checkInTime: new Date(checkInTime),
      isVerified: false, // Manual check-ins are not verified by default
      otp: null, // No OTP needed for manual check-in
      method: "manual", // Manual check-in method
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
};

// Controller for face check-in
const handleFaceCheckIn = async (req, res) => {
  try {
    const photoPath = req.file.path;

    // Use face recognition (mocked here for now)
    const faceDetected = await detectFace(photoPath);

    if (faceDetected) {
      const checkInTime = new Date().toISOString();
      const newCheckin = new Checkin({
        visitorName: req.body.visitorName,
        checkInTime,
        method: "face", // Face check-in method
      });

      await newCheckin.save();

      res.status(200).json({ message: "Face check-in successful!" });
    } else {
      res
        .status(400)
        .json({ message: "Face not recognized. Please try again." });
    }
  } catch (error) {
    console.error("Error during face check-in:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file
  }
};

// Function for detecting face (mocked for development)
const detectFace = async (photoPath) => {
  try {
    // Replace this with actual face recognition logic
    // Example: Use a Python API for face detection or a Node.js-compatible library
    // Mock logic for testing
    return true; // Return true for development/testing
  } catch (error) {
    console.error("Error during face detection:", error);
    return false;
  }
};

// Controller to get all check-ins (visitors)
const getAllCheckins = async (req, res) => {
  try {
    const visitors = await Checkin.find();
    res.status(200).json(visitors);
  } catch (error) {
    console.error("Fetch All Check-ins Error:", error);
    res.status(500).json({ message: "Failed to fetch visitors", error });
  }
};

// Controller to get a single check-in (visitor)
const getSingleCheckin = async (req, res) => {
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
};

// Controller for updating check-in details (visitor)
const updateCheckin = async (req, res) => {
  try {
    const { fullName, email, phone, visitPurpose, checkInTime } = req.body;

    if (!fullName || !email || !phone || !visitPurpose || !checkInTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const visitor = await Checkin.findById(req.params.visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor.visitorName = visitorName;
    visitor.email = email;
    visitor.contactNumber = contactNumber;
    visitor.visitPurpose = visitPurpose;
    visitor.checkInTime = new Date(checkInTime); // optional, only if passed from frontend

    await visitor.save();

    res.status(200).json({
      message: "Check-in details updated successfully",
      visitorId: visitor._id,
    });
  } catch (error) {
    console.error("Edit Check-in Error:", error);
    res.status(500).json({ message: "Failed to update check-in", error });
  }
};

// Controller to delete a check-in (visitor)
const deleteCheckin = async (req, res) => {
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
};

// Get all check-ins by user ID
const getCheckinsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const checkins = await Checkin.find({ userId });

    if (checkins.length === 0) {
      return res
        .status(404)
        .json({ message: "No check-ins found for this user." });
    }

    res.status(200).json(checkins);
  } catch (error) {
    console.error("Fetch User Check-ins Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch check-ins for user", error });
  }
};

export {
  sendOTP,
  verifyOTP,
  manualCheckin,
  handleFaceCheckIn,
  getAllCheckins,
  getSingleCheckin,
  getCheckinsByUserId,
  updateCheckin,
  deleteCheckin,
};
