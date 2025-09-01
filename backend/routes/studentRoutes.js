import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

import { getStudentPortfolio } from '../controllers/portfolioController.js';

// Portfolio routes
router.get('/portfolio/me', protect, (req, res, next) => {
  try {
    // Set the studentId param to the logged-in user's ID as a string
    req.params.studentId = req.user._id.toString();
    req.isOwnPortfolio = true; // Add flag to indicate this is own portfolio request
    console.log('StudentRoutes - /portfolio/me middleware:', {
      userId: req.user._id,
      studentId: req.params.studentId,
      isOwnPortfolio: req.isOwnPortfolio
    });
    next();
  } catch (error) {
    next(error);
  }
}, getStudentPortfolio);

// Get student portfolio data - accessible by student (own data) and staff/admin
router.get('/portfolio/:studentId', protect, getStudentPortfolio);

export default router;