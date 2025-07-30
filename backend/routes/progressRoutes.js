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

// Get user progress for a career track
router.get('/:careerTrack', getUserProgress);

// Mark level section as completed
router.post('/complete', markLevelCompleted);

// Submit exercise
router.post('/submit-exercise', submitExercise);

// Check if level is unlocked
router.get('/unlocked/:levelOrder', checkLevelUnlocked);

// Get all levels with unlock status
router.get('/levels-status', getLevelsStatus);

export default router; 