import express from "express";
import * as visitorController from "../controllers/visitorController.js";
import { verifyToken } from "../middleware/userMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/current", visitorController.getCurrentVisitor);
router.get("/public", visitorController.getPublicVisitorData);

// Protected routes (require authentication)
router.post("/", verifyToken, visitorController.createVisitor);
router.get("/", verifyToken, visitorController.getAllVisitors);
router.get("/recent", verifyToken, visitorController.getRecentVisitors);
router.get("/:id", verifyToken, visitorController.getVisitorById);
router.put("/:id", verifyToken, visitorController.updateVisitor);
router.delete("/:id", verifyToken, visitorController.deleteVisitor);

export default router;
