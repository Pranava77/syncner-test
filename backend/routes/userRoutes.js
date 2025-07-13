import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Placeholder route for users
router.get('/', (req, res) => {
  res.status(200).json({ message: 'User route is working!' });
});

// Health check for users module
router.get('/health', async (req, res) => {
  try {
    await User.findOne();
    res.status(200).json({ success: true, message: 'Users service is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Users service health check failed', error: error.message });
  }
});

export default router; 