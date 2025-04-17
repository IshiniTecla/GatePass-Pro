import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express";
// Import controllers
import {
  createHostProfile,
  getHostProfile,
  getAvailableHosts,
  updateHostProfile,
  getHostById,
} from "../controllers/hostController.js";

// JWT Secret from config
import { config } from "../config/default.js";
import jwt from "jsonwebtoken";

// Initialize express Router
const router = express.Router(); // Initialize router here

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Set up upload limits and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = { id: decoded.id || decoded.userId }; // Compatibility for both formats
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.post(
  "/create",
  auth,
  upload.single("avatar"),
  handleMulterError,
  createHostProfile
);
router.get("/me", auth, getHostProfile);
router.get("/available", getAvailableHosts);
router.get("/:hostId", getHostById);
router.put(
  "/update",
  auth,
  upload.single("avatar"),
  handleMulterError,
  updateHostProfile
);

// Export the router
export default router;
