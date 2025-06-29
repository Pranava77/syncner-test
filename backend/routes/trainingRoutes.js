import express from 'express';
import { getAllModules, getModuleById } from '../controllers/trainingController.js';

const router = express.Router();

// Get all modules
router.get('/', getAllModules);

// Get a specific module by ID
router.get('/:id', getModuleById);

// Placeholder route for training
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Training route is working!' });
});

export default router; 