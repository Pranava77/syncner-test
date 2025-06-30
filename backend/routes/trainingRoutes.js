import express from 'express';
import { getAllModules, getModuleById, createModule, updateModule, deleteModule } from '../controllers/trainingController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = express.Router();

// Public routes
router.get('/', getAllModules);
router.get('/:id', getModuleById);

// Admin routes
router.post('/', protect, requireAdmin, createModule);
router.put('/:id', protect, requireAdmin, updateModule);
router.delete('/:id', protect, requireAdmin, deleteModule);

export default router; 