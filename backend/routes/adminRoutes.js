import express from 'express';
import { getAllUsers, getAnalytics, createUser, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { body } from 'express-validator';
import User from '../models/User.js';
import fetch from 'node-fetch';

const router = express.Router();

// Get all users (admin only)
router.get('/users', protect, authorize('admin'), getAllUsers);

// Create user (admin only)
router.post(
  '/users',
  protect,
  authorize('admin'),
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
router.put('/users/:id', protect, authorize('admin'), updateUser);

// Delete user (admin only)
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Get analytics (admin only)
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// Health check for admin module
router.get('/health', async (req, res) => {
  try {
    await User.findOne();
    res.status(200).json({ success: true, message: 'Admin module is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Admin module health check failed', error: error.message });
  }
});

// Diagnostics endpoint: aggregate all module health checks
router.get('/diagnostics', protect, authorize('admin'), async (req, res) => {
  // List of health endpoints to check
  const endpoints = [
    { name: 'auth', url: '/api/auth/health' },
    { name: 'users', url: '/api/users/health' },
    { name: 'tracks', url: '/api/tracks/health' },
    { name: 'training', url: '/api/training/health' },
    { name: 'tasks', url: '/api/tasks/health' },
    { name: 'admin', url: '/api/admin/health' },
    { name: 'submissions', url: '/api/submissions/health' },
    { name: 'settings', url: '/api/admin/settings/health' },
    { name: 'ai', url: '/api/ai/health' }
  ];
  const baseUrl = process.env.DIAGNOSTICS_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const results = await Promise.all(endpoints.map(async (ep) => {
    try {
      const resp = await fetch(baseUrl + ep.url);
      const data = await resp.json();
      return { module: ep.name, healthy: data.success, message: data.message, error: data.error || null };
    } catch (error) {
      return { module: ep.name, healthy: false, message: 'Request failed', error: error.message };
    }
  }));
  res.status(200).json({
    success: true,
    diagnostics: results,
    timestamp: new Date().toISOString()
  });
});

export default router; 