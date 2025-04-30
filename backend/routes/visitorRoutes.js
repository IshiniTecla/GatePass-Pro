import express from 'express';
import * as visitorController from '../controllers/visitorController.js';
import { auth, verifyUserToken } from '../middleware/userMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/current', visitorController.getCurrentVisitor);
router.get('/public', visitorController.getPublicVisitorData);

// Protected routes (require authentication)
router.post('/', verifyUserToken, visitorController.createVisitor);
router.get('/', verifyUserToken, visitorController.getAllVisitors);
router.get('/recent', verifyUserToken, visitorController.getRecentVisitors);
router.get('/:id', verifyUserToken, visitorController.getVisitorById);
router.put('/:id', verifyUserToken, visitorController.updateVisitor);
router.delete('/:id', verifyUserToken, visitorController.deleteVisitor);

export default router;
