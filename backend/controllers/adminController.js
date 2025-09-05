import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { normalizeCareerTrack } from '../utils/careerTrackUtils.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { name, email, role, careerTrack, isActive } = req.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (role) filter.role = role;
    if (careerTrack) filter.careerTrack = normalizeCareerTrack(careerTrack);
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const users = await User.find(filter).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const Track = (await import('../models/Track.js')).default;

    // Students
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const completionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    // Students by track
    const trackDistributionAgg = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$careerTrack', count: { $sum: 1 } } }
    ]);
    const trackDistribution = trackDistributionAgg.map(t => ({ track: t._id || 'Unassigned', count: t.count }));

    // Level Progress Analytics
    const levelProgressData = await getLevelProgressAnalytics();

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        completionRate,
        trackDistribution,
        levelProgress: levelProgressData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get level progress analytics
// @route   GET /api/admin/level-progress
// @access  Private/Admin
const getLevelProgress = async (req, res) => {
  try {
    const levelProgressData = await getLevelProgressAnalytics();
    
    res.status(200).json({
      success: true,
      data: levelProgressData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to get level progress analytics
const getLevelProgressAnalytics = async () => {
  try {
    // Get all user progress data
    const allProgress = await UserProgress.find({});
    
    // Get total number of students
    const totalStudents = allProgress.length;
    
    // Get total number of levels (assuming max level is the highest level number)
    const maxLevel = totalStudents > 0 ? Math.max(...allProgress.map(p => p.currentLevel), 1) : 1;
    
    // Calculate progress for each level
    const levelProgress = [];
    
    for (let level = 1; level <= maxLevel; level++) {
      // Count students who have reached this level
      const studentsAtLevel = allProgress.filter(p => p.currentLevel >= level).length;
      
      // Count students who have completed this level (exercise section completed)
      const studentsCompletedLevel = allProgress.filter(p => 
        p.completedLevels.some(cl => 
          cl.levelOrder === level && 
          cl.completedSections && 
          cl.completedSections.exercise === true
        )
      ).length;
      
      // Calculate completion percentage
      const completionPercentage = totalStudents > 0 ? 
        Math.round((studentsCompletedLevel / totalStudents) * 100) : 0;
      
      levelProgress.push({
        level: level,
        totalStudents: totalStudents,
        studentsAtLevel: studentsAtLevel,
        studentsCompletedLevel: studentsCompletedLevel,
        completionPercentage: completionPercentage
      });
    }
    
    // Calculate overall progress metrics
    const averageLevelReached = totalStudents > 0 ? 
      Math.round(allProgress.reduce((sum, p) => sum + p.currentLevel, 0) / totalStudents * 10) / 10 : 0;
    
    const overallCompletionRate = totalStudents > 0 ? 
      Math.round((allProgress.filter(p => p.completedLevels.length > 0).length / totalStudents) * 100) : 0;
    
    return {
      levelProgress,
      overallMetrics: {
        totalStudents,
        averageLevelReached,
        overallCompletionRate
      }
    };
  } catch (error) {
    return {
      levelProgress: [],
      overallMetrics: {
        totalStudents: 0,
        averageLevelReached: 0,
        overallCompletionRate: 0
      }
    };
  }
};

// @desc    Create a new user (admin)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, email, password, role = 'student', college, department, careerTrack, isActive = true } = req.body;
    
    // Validate careerTrack for students and staff
    if ((role === 'student' || role === 'staff') && !careerTrack) {
      return res.status(400).json({ 
        success: false, 
        message: 'Career track is required for students and staff' 
      });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'User already exists with this email' });
    }
    // Save plain password; pre-save hook will hash it
    const user = await User.create({ name, email, password, role, college, department, careerTrack, isActive });
    user.password = undefined;
    res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, college, department, careerTrack, isActive, role } = req.body;
    const updateFields = { name, email, college, department, careerTrack, isActive, role };
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset a user's password (admin)
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.password = password; // Set plain password, let pre-save hook hash it
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  getAllUsers,
  getAnalytics,
  getLevelProgress,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
}; 