import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

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
    if (careerTrack) filter.careerTrack = careerTrack;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const users = await User.find(filter).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    // Students
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const completionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    // Submissions by status
    const Submission = (await import('../models/Submission.js')).default;
    const submissionsByStatusAgg = await Submission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const submissionsByStatus = submissionsByStatusAgg.map(s => ({ status: s._id, count: s.count }));

    // Students by track
    const trackDistributionAgg = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$careerTrack', count: { $sum: 1 } } }
    ]);
    const trackDistribution = trackDistributionAgg.map(t => ({ track: t._id || 'Unassigned', count: t.count }));

    // Set all other analytics fields to empty or null for now
    const avgProgress = null;
    const attendanceData = [];
    const averageTaskScore = null;
    const averageTimePerModule = null;
    const studentRetention = null;
    const engagementData = [];
    const careerTrackData = [];
    const modulePerformance = [];

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        completionRate,
        avgProgress,
        attendanceData,
        submissionsByStatus,
        trackDistribution,
        averageTaskScore,
        averageTimePerModule,
        studentRetention,
        engagementData,
        careerTrackData,
        modulePerformance
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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
    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'User already exists with this email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, college, department, careerTrack, isActive });
    user.password = undefined;
    res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error) {
    console.error('Create user error:', error);
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
    console.error('Update user error:', error);
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
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  getAllUsers,
  getAnalytics,
  createUser,
  updateUser,
  deleteUser
}; 