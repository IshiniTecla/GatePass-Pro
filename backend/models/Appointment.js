import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User's name
  email: { type: String, required: true }, // User's email address
  date: { type: String, required: true }, // Appointment date
  time: { type: String, required: true }, // Appointment time
   // Reason for appointment
  status: { type: String, default: "Pending" }, // Appointment status
});

export default mongoose.model("Appointment", appointmentSchema);
