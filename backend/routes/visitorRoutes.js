import express from 'express';
import { getCurrentVisitor, getPublicVisitorData, createVisitor, getAllVisitors, getRecentVisitors, getVisitorById, updateVisitor, deleteVisitor } from '../controllers/visitorController.js';
import { auth, verifyUserToken } from '../middleware/userMiddleware.js';

const router = express.Router();


// Public routes (no authentication required)
router.get('/current', getCurrentVisitor); // Get current visitor details
router.get('/public', getPublicVisitorData); // Get public visitor data

// Protected routes (require authentication)
router.post('/', verifyUserToken, createVisitor); // Create new visitor
router.get('/', verifyUserToken, getAllVisitors); // Get all visitors
router.get('/recent', verifyUserToken, getRecentVisitors); // Get recent visitors
router.get('/:id', verifyUserToken, getVisitorById); // Get a specific visitor by ID
router.put('/:id', verifyUserToken, updateVisitor); // Update a specific visitor
router.delete('/:id', verifyUserToken, deleteVisitor); // Delete a specific visitor

export default router;
