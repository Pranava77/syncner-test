import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserProgress,
  markLevelCompleted,
  submitExercise,
  checkLevelUnlocked,
  getLevelsStatus
} from '../controllers/userProgressController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all levels with unlock status (must come before /:careerTrack)
router.get('/levels-status', getLevelsStatus);

// Check if level is unlocked
router.get('/unlocked/:levelOrder', checkLevelUnlocked);

// Mark level section as completed
router.post('/complete', markLevelCompleted);

// Submit exercise
router.post('/submit-exercise', submitExercise);

// Get user progress for a career track (must come last to avoid catching other routes)
router.get('/:careerTrack', getUserProgress);

export default router; 