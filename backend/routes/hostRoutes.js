import express from 'express';
import jwt from 'jsonwebtoken';
import Host from '../models/Host.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { loginHost, createHostProfile, getHostProfile, getAvailableHosts, updateHostProfile, getHostById, getHostDetails, updateHostActiveStatus } from '../controllers/hostController.js';
import { auth } from '../middleware/userMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Correct import

const router = express.Router();

// Validate host token endpoint
router.post("/validate-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || require('../config/default').jwtSecret);

    if (!decoded.isHost) {
      return res.status(403).json({ valid: false, role: "user", message: "Token is valid but not for a host" });
    }

    const host = await Host.findOne({ user: decoded.id });
    if (!host) {
      return res.status(404).json({ valid: false, message: "Host account not found" });
    }

    return res.status(200).json({
      valid: true,
      role: "host",
      hostId: host.hostID,
      name: host.name
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ valid: false, message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    console.error("Token validation error:", error);
    return res.status(500).json({ valid: false, message: "Server error during validation" });
  }
});

// Host authentication routes
router.post('/login', loginHost);

// Host profile routes
router.post('/create-profile', auth, upload.single('avatar'), createHostProfile);
router.get('/profile', auth, getHostProfile);
router.get('/getHostDetails', auth, getHostDetails);
router.get('/available', getAvailableHosts);
router.put('/update-profile', auth, upload.single('avatar'), updateHostProfile);

// Delete profile endpoint
router.delete('/delete-profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const host = await Host.findOne({ user: userId });
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }

    await Host.findOneAndDelete({ user: userId });

    await User.findByIdAndUpdate(userId, {
      isHost: false,
      hostId: null
    });

    // Delete avatar file if exists
    if (host.avatar) {
      const avatarPath = path.join(__dirname, "..", "public", host.avatar);
      try {
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (err) {
        console.error("Error deleting avatar:", err);
      }
    }

    res.status(200).json({ message: "Host profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting host profile:", error);
    res.status(500).json({ message: "Server error during profile deletion" });
  }
});

router.get('/:hostId', getHostById);

// Update host active status
router.put('/update-status', auth, updateHostActiveStatus);

export default router;
