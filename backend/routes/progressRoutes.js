import express from 'express';
import { getUserProgress, updateUserProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user progress
router.get('/', protect, getUserProgress);

// Update user progress
router.patch('/', protect, updateUserProgress);

export default router; 