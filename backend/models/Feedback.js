import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    visitorName: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", FeedbackSchema);
