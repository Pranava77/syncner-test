import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import User from '../models/User.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('college').trim().notEmpty().withMessage('College is required'),
  body('role').isIn(['student', 'admin']).withMessage('Invalid role'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('college').optional().trim().notEmpty().withMessage('College cannot be empty'),
  body('department').optional().trim().isLength({ max: 50 }).withMessage('Department cannot exceed 50 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('careerTrack').optional().isIn(['ai-ml', 'fullstack', 'ui-ux', 'data-science']).withMessage('Invalid career track'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('profileComplete').optional().isBoolean().withMessage('Profile complete must be a boolean'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('gpa').optional().trim().isLength({ max: 10 }).withMessage('GPA cannot exceed 10 characters'),
  body('graduationYear').optional().trim().isLength({ max: 4 }).withMessage('Graduation year cannot exceed 4 characters'),
  validateRequest
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Health check for auth module
router.get('/health', async (req, res) => {
  try {
    // Try a simple query
    await User.findOne();
    res.status(200).json({ success: true, message: 'Auth service is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Auth service health check failed', error: error.message });
  }
});

export default router;