import express from 'express';
import { getRecentNotifications, getUserNotifications, getUnreadCount, markNotificationAsRead, deleteNotification } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/userMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Middleware to check if notification exists
const checkNotificationExists = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    next();
  } catch (error) {
    console.error("Error checking notification:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Public routes (no authentication required)
router.get('/recent', getRecentNotifications);

// Protected routes (require authentication)
router.get('/user', verifyToken, getUserNotifications);
router.get('/unread', verifyToken, getUnreadCount);
router.put('/:id', verifyToken, checkNotificationExists, markNotificationAsRead);
router.delete('/:id', verifyToken, checkNotificationExists, deleteNotification);

export default router;
