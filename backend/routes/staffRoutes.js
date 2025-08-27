import express from 'express';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure user is staff
const ensureStaff = async (req, res, next) => {
  try {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying staff privileges'
    });
  }
};

// Get all students with pagination and filtering
router.get('/students', protect, ensureStaff, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, careerTrack, sortBy = 'lastActive', sortOrder = 'desc' } = req.query;
    
    // Build filter query
    const filterQuery = { role: 'student' };
    
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      filterQuery.isActive = status === 'active';
    }
    
    if (careerTrack && careerTrack !== 'all') {
      filterQuery.careerTrack = careerTrack;
    }
    
    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(filterQuery)
      .select('-password')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const totalStudents = await User.countDocuments(filterQuery);
    
    // Get progress data for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const progress = await UserProgress.findOne({ user: student._id })
          .select('currentLevel completedLevels totalPoints streakDays')
          .lean();
        
        return {
          ...student,
          progress: progress ? Math.round((progress.completedLevels.length / 10) * 100) : 0, // Assuming 10 levels per track
          currentLevel: progress ? `Level ${progress.currentLevel}` : 'Level 1',
          totalPoints: progress?.totalPoints || 0,
          streakDays: progress?.streakDays || 0,
          status: student.isActive ? 'active' : 'inactive'
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        students: studentsWithProgress,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStudents / parseInt(limit)),
          totalStudents,
          hasNextPage: skip + students.length < totalStudents,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get detailed student information
router.get('/students/:id', protect, ensureStaff, async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findById(id)
      .select('-password')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }
    
    // Get detailed progress data
    const progress = await UserProgress.findOne({ user: id })
      .lean();
    
    // Calculate performance metrics
    const performance = {
      performance: progress ? Math.round((progress.completedLevels.length / 10) * 100) : 0,
      potential: 90, // This could be calculated based on various factors
      contribution: 78, // This could be calculated based on community participation
      creativity: 82, // This could be calculated based on exercise submissions
      skill: progress ? Math.round((progress.totalPoints / 1000) * 100) : 0, // Assuming 1000 points = 100% skill
      teamwork: 80 // This could be calculated based on collaborative activities
    };
    
    // Calculate summary stats
    const summaryStats = {
      consistency: progress?.streakDays || 0,
      progress: progress ? Math.round((progress.completedLevels.length / 10) * 100) : 0,
      leaderboard: progress ? Math.round((progress.totalPoints / 1000) * 100) : 0
    };
    
    // Build learning timeline
    const learningTimeline = progress?.completedLevels.map((level, index) => ({
      level: 10 - index, // Reverse order to show latest first
      courseName: `Level ${10 - index}`, // This should come from actual curriculum data
      status: 'completed',
      learn: { 
        completed: level.completedSections?.learn || false, 
        startTime: level.completedAt, 
        endTime: level.completedAt 
      },
      test: { 
        completed: level.completedSections?.test || false, 
        score: level.testProgress?.attempts?.[0]?.score || 0, 
        attempts: level.testProgress?.attempts?.length || 0, 
        startTime: level.completedAt, 
        endTime: level.completedAt 
      },
      exercise: { 
        completed: level.completedSections?.exercise || false, 
        startTime: level.completedAt, 
        endTime: level.completedAt 
      }
    })) || [];
    
    // Add current level if not completed
    if (progress?.currentLevel && progress.currentLevel !== 1) {
      learningTimeline.unshift({
        level: progress.currentLevel,
        courseName: `Level ${progress.currentLevel}`,
        status: 'in-progress',
        learn: { completed: false, startTime: new Date(), endTime: 'In Progress' },
        test: { completed: false, score: 0, attempts: 0, startTime: new Date(), endTime: 'Not Started' },
        exercise: { completed: false, startTime: new Date(), endTime: 'In Progress' }
      });
    }
    
    const studentDetails = {
      ...student,
      performance,
      summaryStats,
      learningTimeline,
      enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'N/A'
    };
    
    res.status(200).json({
      success: true,
      data: {
        student: studentDetails
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get staff dashboard analytics
router.get('/analytics', protect, ensureStaff, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    
    // Get progress statistics
    const progressStats = await UserProgress.aggregate([
      {
        $group: {
          _id: null,
          avgProgress: { $avg: { $divide: [{ $size: '$completedLevels' }, 10] } },
          totalPoints: { $sum: '$totalPoints' },
          avgStreakDays: { $avg: '$streakDays' }
        }
      }
    ]);
    
    // Get career track distribution
    const trackDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$careerTrack', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const analytics = {
      totalStudents,
      activeStudents,
      completionRate: Math.round((activeStudents / totalStudents) * 100),
      studentRetention: Math.round((activeStudents / totalStudents) * 100),
      trackDistribution: trackDistribution.map(track => ({
        track: track._id,
        count: track.count
      })),
      avgProgress: progressStats[0] ? Math.round(progressStats[0].avgProgress * 100) : 0,
      avgPoints: progressStats[0] ? Math.round(progressStats[0].totalPoints / totalStudents) : 0,
      avgStreakDays: progressStats[0] ? Math.round(progressStats[0].avgStreakDays) : 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
