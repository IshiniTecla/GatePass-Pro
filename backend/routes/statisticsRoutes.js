// statisticsRoutes.js

import express from 'express';
import { getVisitorStatistics, getDashboardStats } from '../controllers/statisticsController.js';
import { auth } from '../middleware/userMiddleware.js';

const router = express.Router();

// Routes for statistics that require authentication
router.get('/visitors', auth, getVisitorStatistics);
router.get('/dashboard', auth, getDashboardStats);

export default router;
