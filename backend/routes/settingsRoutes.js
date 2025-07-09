import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

// Health check for settings module
router.get('/health', async (req, res) => {
  try {
    await Settings.findOne();
    res.status(200).json({ success: true, message: 'Settings module is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Settings module health check failed', error: error.message });
  }
});

export default router; 