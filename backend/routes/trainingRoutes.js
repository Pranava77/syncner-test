import express from 'express';
import {
  getAllLevels, getLevelById, createLevel, updateLevel, deleteLevel,
  addLearn, updateLearn, deleteLearn,
  addTest, updateTest, deleteTest,
  addExercise, updateExercise, deleteExercise
} from '../controllers/trainingController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import Level from '../models/Level.js';

const router = express.Router();

// Public routes
router.get('/levels', getAllLevels);

// Health check for training levels
router.get('/health', async (req, res) => {
  try {
    await Level.findOne();
    res.status(200).json({ success: true, message: 'Training levels are healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Training levels health check failed', error: error.message });
  }
});

router.get('/levels/:id', getLevelById);

// Admin routes
router.post('/levels', protect, authorize('admin'), createLevel);
router.put('/levels/:id', protect, authorize('admin'), updateLevel);
router.delete('/levels/:id', protect, authorize('admin'), deleteLevel);

// Learn CRUD
router.post('/levels/:id/learn', protect, authorize('admin'), addLearn);
router.put('/levels/:id/learn/:learnIdx', protect, authorize('admin'), updateLearn);
router.delete('/levels/:id/learn/:learnIdx', protect, authorize('admin'), deleteLearn);
// Test CRUD
router.post('/levels/:id/test', protect, authorize('admin'), addTest);
router.put('/levels/:id/test/:testIdx', protect, authorize('admin'), updateTest);
router.delete('/levels/:id/test/:testIdx', protect, authorize('admin'), deleteTest);
// Exercise CRUD
router.post('/levels/:id/exercise', protect, authorize('admin'), addExercise);
router.put('/levels/:id/exercise/:exerciseIdx', protect, authorize('admin'), updateExercise);
router.delete('/levels/:id/exercise/:exerciseIdx', protect, authorize('admin'), deleteExercise);

export default router; 