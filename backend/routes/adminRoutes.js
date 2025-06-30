import express from 'express';
import { getAllUsers, getAnalytics, createUser, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';
import { body } from 'express-validator';

const router = express.Router();

// Get all users (admin only)
router.get('/users', protect, requireAdmin, getAllUsers);

// Create user (admin only)
router.post(
  '/users',
  protect,
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Role must be student or admin'),
    body('college').notEmpty().withMessage('College required'),
  ],
  createUser
);

// Update user (admin only)
router.put('/users/:id', protect, requireAdmin, updateUser);

// Delete user (admin only)
router.delete('/users/:id', protect, requireAdmin, deleteUser);

// Get analytics (admin only)
router.get('/analytics', protect, requireAdmin, getAnalytics);

export default router; 