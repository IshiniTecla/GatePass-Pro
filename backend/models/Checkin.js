import mongoose from "mongoose";

const checkinSchema = new mongoose.Schema(
  {
    visitorName: { type: String, required: true }, // Required: Visitor's full name
    email: { type: String, required: true, unique: true }, // Required: Email must be unique
    contactNumber: { type: String, required: true }, // Required: Contact number
    personToVisit: { type: String, required: false }, // Optional: Person the visitor is visiting
    visitPurpose: { type: String, required: true }, // Required: Purpose of visit
    checkInTime: { type: Date, default: Date.now }, // Defaults to current time if not provided
    otp: { type: String, required: false }, // Optional: OTP for verification
    isVerified: { type: Boolean, default: false }, // Verification status (whether admin has verified)
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt timestamps

// Create the model based on the schema
export default mongoose.model("Checkin", checkinSchema);
