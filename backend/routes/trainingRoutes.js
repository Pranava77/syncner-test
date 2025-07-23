import express from 'express';
import { getAllLevels, getLevelById } from '../controllers/trainingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/levels', getAllLevels);
router.get('/levels/:id', getLevelById);

// Health check for training module
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Training service is healthy' });
});

export default router;
