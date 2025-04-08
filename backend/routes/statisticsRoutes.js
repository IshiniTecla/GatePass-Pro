import express from "express";
import statisticsController from "../controllers/statisticsController.js";
import { verifyToken } from "../middleware/userMiddleware.js";

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Get visitor statistics
router.get("/visitors", statisticsController.getVisitorStatistics);

export default router;
