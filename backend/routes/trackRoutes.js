import express from 'express';
import { getAllTracks, getTrackById } from '../controllers/trackController.js';
import Track from '../models/Track.js';

const router = express.Router();

// Get all tracks
router.get('/', getAllTracks);

// Health check for tracks module
router.get('/health', async (req, res) => {
  try {
    await Track.findOne();
    res.status(200).json({ success: true, message: 'Tracks module is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Tracks module health check failed', error: error.message });
  }
});

// Get a specific track by ID
router.get('/:id', getTrackById);

export default router; 