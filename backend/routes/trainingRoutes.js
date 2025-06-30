import express from 'express';
import { getAllModules, getModuleById, createModule, updateModule, deleteModule } from '../controllers/trainingController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';
import Module from '../models/Module.js';

const router = express.Router();

// Public routes
router.get('/', getAllModules);

// Health check for training module
router.get('/health', async (req, res) => {
  try {
    await Module.findOne();
    res.status(200).json({ success: true, message: 'Training module is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Training module health check failed', error: error.message });
  }
});

router.get('/:id', getModuleById);

// Admin routes
router.post('/', protect, requireAdmin, createModule);
router.put('/:id', protect, requireAdmin, updateModule);
router.delete('/:id', protect, requireAdmin, deleteModule);

export default router; 