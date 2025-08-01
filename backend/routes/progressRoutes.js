import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserProgress,
  markLevelCompleted,
  submitExercise,
  checkLevelUnlocked,
  getLevelsStatus,
  updateLearnProgress,
  submitTestAttempt,
  checkTestUnlocked,
  checkExerciseUnlocked,
  checkExerciseLinks
} from '../controllers/userProgressController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all levels with unlock status (must come before /:careerTrack)
router.get('/levels-status', getLevelsStatus);

// Check if level is unlocked
router.get('/unlocked/:levelOrder', checkLevelUnlocked);

// Check test unlock status
router.get('/test-unlocked/:levelId', checkTestUnlocked);

// Check exercise unlock status
router.get('/exercise-unlocked/:levelId', checkExerciseUnlocked);

// Check exercise links status
router.get('/exercise-links/:levelId', checkExerciseLinks);

// Mark level section as completed
router.post('/complete', markLevelCompleted);

// Update learn progress
router.post('/learn-progress', updateLearnProgress);

// Submit test attempt
router.post('/test-attempt', submitTestAttempt);

// Submit exercise
router.post('/submit-exercise', submitExercise);

// Get user progress for a career track (must come last to avoid catching other routes)
router.get('/:careerTrack', getUserProgress);

export default router; 