import express from 'express';
import { getAllUsers, getAnalytics } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', protect, requireAdmin, getAllUsers);

// Get analytics (admin only)
router.get('/analytics', protect, requireAdmin, getAnalytics);

// Placeholder route for admin
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Admin route is working!' });
});

export default router; 