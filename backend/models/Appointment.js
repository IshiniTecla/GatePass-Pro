// models/Appointment.js (ES Modules)
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    meetingLink: { type: String }, // QR code or meeting link can be stored here
    confirmationCode: { type: String }, // Unique code for the appointment
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema); // Exporting using ES module default