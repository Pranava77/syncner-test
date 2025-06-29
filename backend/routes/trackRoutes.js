import express from 'express';
import { getAllTracks, getTrackById } from '../controllers/trackController.js';

const router = express.Router();

// Get all tracks
router.get('/', getAllTracks);

// Get a specific track by ID
router.get('/:id', getTrackById);

// Placeholder route for tracks
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Track route is working!' });
});

export default router; 