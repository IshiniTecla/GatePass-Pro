import connectDB from "./config/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import morgan from "morgan";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Express app
const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Routes
import userRoutes from "./routes/userRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import hostRoutes from "./routes/hostRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";
import notificationRoutes from './routes/notificationRoutes.js';
import meetingRoutes from "./routes/meetingRoutes.js";
import { scheduleStatusUpdates } from './utils/statusScheduler.js';

// Middleware
app.use(morgan("dev"));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
}));

app.options("*", cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Socket.io setup
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinMeeting", (meetingId) => {
    socket.join(`meeting-${meetingId}`);
    console.log(`User joined meeting: ${meetingId}`);
  });

  socket.on("registerUser", (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User registered for private messages: ${userId}`);
    }
  });

  socket.on("leaveMeeting", (meetingId) => {
    socket.leave(`meeting-${meetingId}`);
    console.log(`User left meeting: ${meetingId}`);
  });

  socket.on("sendMessage", (data) => {
    if (data.isPrivate && data.recipientId) {
      io.to(`user-${data.recipientId}`).to(`user-${data.senderId}`).emit("newPrivateMessage", data);
    } else {
      io.to(`meeting-${data.meetingId}`).emit("newMessage", data);
    }
  });

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGO_URL = process.env.MONGO_URL;


  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meetings", meetingRoutes);

// Test/public routes
app.get("/api/public", (req, res) => {
  res.send("This is a public route!");
});
app.get("/health", (req, res) => {
  res.status(200).send("Server is running");
});
app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect to DB
connectDB();

// Error middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});


// Attach socket.io to app
app.set("io", io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  scheduleStatusUpdates();
});

// Global unhandled rejection handler
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

export { app, server, io };

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, {})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection failed:", error));
