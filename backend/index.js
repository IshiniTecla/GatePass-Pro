import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import appointmentRoute from "./routes/appointmentRoute.js";

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5177",
  })
);
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Routes
app.use("/api/appointments", appointmentRoute);


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

