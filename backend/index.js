import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server as socketIo } from "socket.io";
import morgan from "morgan";

// Load environment variables BEFORE anything else
dotenv.config();

// Import routes
import userRoutes from "./routes/userRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import hostRoutes from "./routes/hostRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";

// Import DB connection
import connectDB from "./config/db.js";

// Import the status scheduler
import { scheduleStatusUpdates } from "./utils/statusScheduler.js";

// Handle __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define PORT
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Setup real-time communication
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

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware
app.use(morgan("dev"));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-token']
}));
app.options("*", cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/hosts", hostRoutes);

app.get("/api/public", (req, res) => {
  res.send("This is a public route!");
});

app.get("/health", (req, res) => {
  res.status(200).send("Server is running");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect to MongoDB
connectDB();

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Share io instance
app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  scheduleStatusUpdates(); // Initialize the host status updater
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

export { app, server, io };
