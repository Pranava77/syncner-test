import express from 'express';
import { getUserProgress, updateUserProgress, getAllProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import Progress from '../models/Progress.js';

const router = express.Router();

// Get user progress
router.get('/', protect, getUserProgress);

// Update user progress
router.patch('/', protect, updateUserProgress);

// Health check for progress module
router.get('/health', async (req, res) => {
  try {
    await Progress.findOne();
    res.status(200).json({ success: true, message: 'Progress module is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Progress module health check failed', error: error.message });
  }
});



export default router; 