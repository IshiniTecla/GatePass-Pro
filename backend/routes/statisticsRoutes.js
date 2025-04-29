import express from 'express';
import * as statisticsController from '../controllers/statisticsController.js';
import { auth } from '../middleware/userMiddleware.js';

const router = express.Router();

// Use the auth middleware for the routes
router.get('/visitors', auth, statisticsController.getVisitorStatistics);

// Add any other statistics routes with the auth middleware
// router.get('/dashboard', auth, statisticsController.getDashboardStats);
// router.get('/other-stats', auth, statisticsController.getOtherStats);

export default router;
