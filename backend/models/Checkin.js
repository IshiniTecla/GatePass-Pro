import mongoose from "mongoose";

const checkinSchema = new mongoose.Schema({
  visitorName: { type: String, required: false },
  email: { type: String, required: false },
  contactNumber: { type: String, required: false },
  photo: { type: String, required: false },
  checkInTime: { type: Date, required: false },
  otp: { type: String, required: false }, // OTP for verification
  isVerified: { type: Boolean, default: false }, // Admin verification status
});

export default mongoose.model("Checkin", checkinSchema);
