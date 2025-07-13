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
    const User = (await import('../models/User.js')).default;
    const Progress = (await import('../models/Progress.js')).default;
    const Module = (await import('../models/Module.js')).default;
    const Track = (await import('../models/Track.js')).default;
    const Submission = (await import('../models/Submission.js')).default;

    // Students
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const completionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    // Submissions by status
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

    // --- Real Attendance Data (last 7 days) ---
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });
    const attendanceData = await Promise.all(last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const count = await Progress.countDocuments({ lastActive: { $gte: start, $lte: end } });
      return { day: start.toLocaleDateString('en-US', { weekday: 'short' }), students: count };
    }));

    // --- Engagement Data (last 7 days) ---
    const engagementData = await Promise.all(last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const activeUsers = await Progress.countDocuments({ lastActive: { $gte: start, $lte: end } });
      // Sessions and avgDuration require more tracking; set as null for now
      return { date: start, activeUsers, sessions: null, avgDuration: null };
    }));

    // --- Career Track Data ---
    const tracks = await Track.find({});
    const progressByTrack = await Progress.aggregate([
      { $group: {
        _id: '$careerTrack',
        students: { $sum: 1 },
        avgProgress: { $avg: '$overallProgress' }
      }}
    ]);
    const careerTrackData = tracks.map(track => {
      const stat = progressByTrack.find(t => t._id === track.id);
      return {
        track: track.name,
        students: stat ? stat.students : 0,
        avgProgress: stat ? Math.round(stat.avgProgress || 0) : 0,
        completionRate: stat ? Math.round((stat.avgProgress || 0)) : 0 // proxy: avgProgress as completion
      };
    });

    // --- Module Performance ---
    const modules = await Module.find({});
    const modulePerformance = await Promise.all(modules.map(async (mod) => {
      const progresses = await Progress.find({ 'moduleProgress.module': mod.id });
      let completions = 0, totalScore = 0, totalTime = 0, count = 0;
      progresses.forEach(p => {
        const mp = p.moduleProgress.find(m => m.module === mod.id && m.status === 'COMPLETED');
        if (mp) {
          completions++;
          totalTime += mp.timeSpent || 0;
          if (p.taskProgress && Array.isArray(p.taskProgress)) {
            p.taskProgress.forEach(tp => {
              if (tp.status === 'COMPLETED' && typeof tp.score === 'number') {
                totalScore += tp.score;
                count++;
              }
            });
          }
        }
      });
      return {
        module: mod.title,
        completions,
        avgScore: count ? Math.round(totalScore / count) : 0,
        avgTime: completions ? (totalTime / completions / 60).toFixed(1) : 0 // min to hours
      };
    }));

    // --- Averages ---
    const allProgress = await Progress.find({});
    const avgProgress = allProgress.length
      ? Math.round(allProgress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / allProgress.length)
      : 0;

    const allCompletedTasks = allProgress.flatMap(p =>
      (p.taskProgress || []).filter(tp => tp.status === 'COMPLETED' && typeof tp.score === 'number')
    );
    const averageTaskScore = allCompletedTasks.length
      ? Math.round(allCompletedTasks.reduce((sum, tp) => sum + tp.score, 0) / allCompletedTasks.length)
      : 0;

    const allCompletedModules = allProgress.flatMap(p =>
      (p.moduleProgress || []).filter(mp => mp.status === 'COMPLETED' && typeof mp.timeSpent === 'number')
    );
    const averageTimePerModule = allCompletedModules.length
      ? (allCompletedModules.reduce((sum, mp) => sum + mp.timeSpent, 0) / allCompletedModules.length / 60).toFixed(1)
      : 0;

    // Student retention: percent of students active in last 7 days
    const retentionBase = await Progress.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7*24*60*60*1000) } });
    const studentRetention = totalStudents ? Math.round((retentionBase / totalStudents) * 100) : 0;

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