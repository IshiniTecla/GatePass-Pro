// server.js or index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import appointmentRoute from "./routes/appointmentRoute.js";

dotenv.config();

const app = express();

// ✅ CORRECT CORS CONFIGURATION
app.use(
  cors({
    origin: "http://localhost:5173", // Match your frontend port
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Routes
app.use("/api/appointments", appointmentRoute);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected."))
  .catch((error) => console.error("❌ MongoDB connection failed:", error));

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
