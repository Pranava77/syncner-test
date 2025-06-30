import express from 'express';
import { getAllTracks, getTrackById } from '../controllers/trackController.js';

const router = express.Router();

// Get all tracks
router.get('/', getAllTracks);

// Get a specific track by ID
router.get('/:id', getTrackById);

export default router; 