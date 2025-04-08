import express from "express";
import userController from "../controllers/userController.js";
import { verifyToken } from "../middleware/userMiddleware.js";

const router = express.Router();

// Public routes - no auth required
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes - auth required
router.get("/me", verifyToken, userController.getCurrentUser);
router.put("/me", verifyToken, userController.updateProfile);
router.put("/password", verifyToken, userController.updatePassword);
router.delete("/me", verifyToken, userController.deleteAccount);
router.get("/profile", verifyToken, userController.getProfile);

// Add this route to your existing auth routes
router.post("/refresh", userController.refreshToken);

export default router;
