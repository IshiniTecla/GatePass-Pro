import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  visitorName: { type: String, required: false },
  email: { type: String, required: false },
  contactNumber: { type: String, required: false },
  checkInTime: { type: Date, required: true },
  photo: { type: String, required: true },
});

export default mongoose.model("Visitor", visitorSchema);
