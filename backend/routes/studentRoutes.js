import express from 'express';
import { protect } from '../middleware/auth.js';
import { getStudentPortfolio } from '../controllers/portfolioController.js';

const router = express.Router();

// Get student portfolio data - accessible by student (own data) and staff/admin
router.get('/portfolio/:studentId', protect, getStudentPortfolio);

export default router;