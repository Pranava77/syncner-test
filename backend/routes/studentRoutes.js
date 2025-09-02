import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

import { getStudentPortfolio } from '../controllers/portfolioController.js';

// Portfolio routes - simplified permission logic in controller
router.get('/portfolio/me', protect, (req, res, next) => {
  // Redirect to the user's own portfolio
  req.params.studentId = req.user._id.toString();
  next();
}, getStudentPortfolio);

// Get student portfolio data - accessible by student (own data) and staff/admin
router.get('/portfolio/:studentId', protect, getStudentPortfolio);

// Public portfolio route - no authentication required
router.get('/portfolio/public/:studentId', getStudentPortfolio);

export default router;