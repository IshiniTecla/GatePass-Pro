// models/Host.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const hostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  hostID: {
    type: String,
    default: () => `HOST-${uuidv4().substring(0, 8).toUpperCase()}`,
    unique: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: false },
  bio: { type: String, required: true },
  expertise: { type: String, required: true },
  location: { type: String, required: true },
  experience: { type: String, required: true },
  avatar: { type: String, default: "" },
  socialMedia: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

const Host = mongoose.model("Host", hostSchema);
export default Host;
