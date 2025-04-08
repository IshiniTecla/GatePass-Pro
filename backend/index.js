import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import hostRoutes from "./routes/hostRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";

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
app.use("/feedback", feedbackRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/host", hostRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected."))
  .catch((error) => console.error("MongoDB connection failed:", error));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
