import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },         // User's name
  email: { type: String, required: true },        // User's email
  date: { type: String, required: true },         // Appointment date
  time: { type: String, required: true },         // Appointment time
  reason: { type: String, required: true },       // Reason for appointment
  status: { type: String, default: "Pending" },   // Appointment status
});

export default mongoose.model("Appointment", appointmentSchema);
