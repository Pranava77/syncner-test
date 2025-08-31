import express from 'express';
import { startTimeTracking, stopTimeTracking, pauseTimeTracking } from '../controllers/timeTrackingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Time tracking routes
router.post('/start', startTimeTracking);
router.post('/stop', stopTimeTracking);
router.post('/pause', pauseTimeTracking);

export default router;
