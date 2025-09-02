import express from 'express';
import { getAllUsers, getAnalytics, getLevelProgress, createUser, updateUser, deleteUser, resetPassword } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import fetch from 'node-fetch';
import { fixUserProgressLevelOrders, checkUserProgressLevelOrders } from '../utils/fixUserProgressLevelOrders.js';

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
    body('role').optional().isIn(['student', 'admin', 'staff']).withMessage('Role must be student, admin, or staff'),
    body('college')
      .if((value, { req }) => req.body.role === 'student' || req.body.role === 'staff')
      .notEmpty()
      .withMessage('College required'),
    validateRequest
  ],
  createUser
);

// Update user (admin only)
router.put('/users/:id', protect, authorize('admin'), updateUser);

// Delete user (admin only)
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Add after update and delete user routes
router.post('/users/:id/reset-password', protect, authorize('admin'), resetPassword);

// Get analytics (admin only)
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// Get level progress analytics (admin only)
router.get('/level-progress', protect, authorize('admin'), getLevelProgress);

// Health check for admin module
router.get('/health', async (req, res) => {
  try {
    await User.findOne();
    res.status(200).json({ success: true, message: 'Admin service is healthy' });
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
    { name: 'admin', url: '/api/admin/health' },
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

// Check UserProgress levelOrder status
router.get('/check-progress-orders', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await checkUserProgressLevelOrders();
    res.status(200).json({
      success: true,
      data: result,
      message: 'UserProgress levelOrder status checked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking UserProgress levelOrders',
      error: error.message
    });
  }
});

// Fix UserProgress levelOrder issues
router.post('/fix-progress-orders', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await fixUserProgressLevelOrders();
    res.status(200).json({
      success: true,
      data: result,
      message: 'UserProgress levelOrders fixed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fixing UserProgress levelOrders',
      error: error.message
    });
  }
});

// Clean up orphaned UserProgress records (where user was deleted)
router.post('/cleanup-orphaned-progress', protect, authorize('admin'), async (req, res) => {
  try {
    const UserProgress = (await import('../models/UserProgress.js')).default;
    const User = (await import('../models/User.js')).default;
    
    // Find all UserProgress records
    const allProgress = await UserProgress.find({}).lean();
    
    let orphanedCount = 0;
    let cleanedCount = 0;
    
    for (const progress of allProgress) {
      // Check if the referenced user still exists
      const userExists = await User.findById(progress.user);
      
      if (!userExists) {
        console.log(`Removing orphaned UserProgress for deleted user: ${progress.user}`);
        await UserProgress.deleteOne({ _id: progress._id });
        orphanedCount++;
        cleanedCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalRecords: allProgress.length,
        orphanedFound: orphanedCount,
        cleanedUp: cleanedCount
      },
      message: `Cleaned up ${cleanedCount} orphaned UserProgress records`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up orphaned UserProgress records',
      error: error.message
    });
  }
});

export default router; 