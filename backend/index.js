import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import facePhotoRoutes from "./routes/facePhotoRoutes.js";

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Routes
app.use("/api/feedback", feedbackRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api", facePhotoRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected."))
  .catch((error) => console.error("MongoDB connection failed:", error));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
