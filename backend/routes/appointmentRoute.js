import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// Create Appointment
router.post("/", async (req, res) => {
  try {
    const { name, date, time, reason } = req.body;

    // Validate required fields
    if (!name || !date || !time || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const appointment = new Appointment({ name, date, time, reason });
    await appointment.save();

    res.status(201).json({
      message: "Appointment created successfully!",
      appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      message: "Error creating appointment.",
      error: error.message,
    });
  }
});

// Get All Appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      message: "Error fetching appointments.",
      error: error.message,
    });
  }
});

// Get Appointments by User Name
router.get("/user/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const appointments = await Appointment.find({ name });

    if (appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this user." });
    }

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({
      message: "Error fetching user appointments.",
      error: error.message,
    });
  }
});

// Update Appointment (name, date, time, reason)
router.put("/:id", async (req, res) => {
  try {
    const { name, date, time, reason } = req.body;

    // Validate required fields
    if (!name || !date || !time || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { name, date, time, reason },  // Update all fields
      { new: true }  // Return the updated document
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({
      message: "Appointment updated successfully!",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      message: "Error updating appointment.",
      error: error.message,
    });
  }
});


// Delete Appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({ message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      message: "Error deleting appointment.",
      error: error.message,
    });
  }
});

// Get Appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment by ID:", error);
    res.status(500).json({
      message: "Error fetching appointment by ID.",
      error: error.message,
    });
  }
});

// Update Appointment Status (Approve/Reject)
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;  // Status should be passed in the request body

    if (!status || (status !== 'Approved' && status !== 'Rejected')) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'." });
    }

    // Update only the status of the appointment
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },  // Update only the status
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({
      message: "Appointment status updated successfully!",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      message: "Error updating appointment status.",
      error: error.message,
    });
  }
});


export default router;
