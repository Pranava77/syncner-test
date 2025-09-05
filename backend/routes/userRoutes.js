import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update current user profile
router.put('/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const allowedFields = ['name', 'college', 'department', 'phone', 'location', 'careerTrack', 'interests', 'profileComplete', 'gpa', 'graduationYear'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

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