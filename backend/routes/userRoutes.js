import express from "express";
import * as userController from "../controllers/userController.js";
import { verifyToken } from "../middleware/userMiddleware.js";

const router = express.Router();

// Public routes - no authentication required
router.post("/register", userController.registerUser); // Register new user
router.post("/login", userController.loginUser); // Login user

// Protected routes - authentication required
router.get("/me", verifyToken, userController.getCurrentUser); // Get current user profile
router.put("/me", verifyToken, userController.updateProfile); // Update user profile
router.put("/password", verifyToken, userController.updatePassword); // Update password
router.delete("/me", verifyToken, userController.deleteAccount); // Delete user account

// Fetch user profile by email, protected with token
router.get("/profile", verifyToken, userController.getprofile); // Make sure `getProfile` is defined correctly in your controller

// Refresh token route
router.post("/refresh", userController.refreshToken); // Refresh access token

export default router;
