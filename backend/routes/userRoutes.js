import express from "express";
import * as userController from "../controllers/userController.js";
import { verifyUserToken, auth } from "../middleware/userMiddleware.js";

const router = express.Router();

// Public routes - no auth required
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes - auth required
router.get("/me", verifyUserToken, userController.getCurrentUser);
router.put("/me", verifyUserToken, userController.updateProfile);
router.put("/password", verifyUserToken, userController.updatePassword);
router.delete("/me", verifyUserToken, userController.deleteAccount);
router.get("/profile", verifyUserToken, userController.getprofile);

// Add this route to your existing auth routes
router.post("/refresh", userController.refreshToken);

export default router;
