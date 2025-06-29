import express from 'express';

const router = express.Router();

// Placeholder route for users
router.get('/', (req, res) => {
  res.status(200).json({ message: 'User route is working!' });
});

export default router; 