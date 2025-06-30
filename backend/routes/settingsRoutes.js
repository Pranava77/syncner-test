import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = express.Router();

router.get('/', protect, requireAdmin, getSettings);
router.put('/', protect, requireAdmin, updateSettings);

export default router; 