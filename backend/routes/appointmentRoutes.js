import express from "express";
const router = express.Router();
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getHostAppointments,
} from "../controllers/appointmentController.js";

// Get all appointments
router.get("/", getAppointments);

// Get a specific appointment by ID
router.get("/:id", getAppointmentById);

// Create a new appointment
router.post("/", createAppointment);

// Update an appointment
router.put("/:id", updateAppointment);

// Delete an appointment
router.delete("/:id", deleteAppointment);

// Get appointments for a specific host
router.get("/host/:hostId", getHostAppointments);

export default router;