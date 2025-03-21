import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGO_URL = process.env.MONGO_URL;

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Routes
app.use("/feedback", feedbackRoutes);
app.use("/api/appointments", appointmentRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, {})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection failed:", error));
