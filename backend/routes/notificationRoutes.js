import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/userMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/recent', notificationController.getRecentNotifications);

// Protected routes (require authentication)
router.get('/user', verifyToken, notificationController.getUserNotifications);
router.get('/unread', verifyToken, notificationController.getUnreadCount);
router.put('/:id', verifyToken, notificationController.markNotificationAsRead);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

export default router;
