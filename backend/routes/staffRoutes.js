import express from 'express';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Track from '../models/Track.js';
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
        
        // Normalize career track to handle legacy "fullstack" vs "full-stack"
        const normalizedCareerTrack = student.careerTrack === 'fullstack' ? 'full-stack' : student.careerTrack;
        
        // Get the actual track structure to calculate accurate completion rate
        const track = await Track.findOne({ name: normalizedCareerTrack }).lean();
        const totalLevels = track ? track.levels.length : 10; // Fallback to 10 if track not found
        
        // Calculate attendance statistics
        let presentDays = 0;
        let totalDays = 1;
        
        if (progress?.attendanceStats?.presentDays !== undefined) {
          // Use pre-calculated attendance stats if available
          presentDays = progress.attendanceStats.presentDays;
          totalDays = progress.attendanceStats.totalDays || 1;
        } else if (progress?.dailyActivity) {
          // Fallback to calculating from daily activity
          presentDays = progress.dailyActivity.filter(entry => entry.isPresent).length;
          const today = new Date();
          const enrollmentDate = progress?.createdAt || student.createdAt || new Date();
          totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // If no attendance data exists, provide a more realistic estimate
          const today = new Date();
          const enrollmentDate = student.createdAt || new Date();
          totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Use only actual attendance data, no progress-based estimation
          if (progress?.attendanceStats?.presentDays !== undefined) {
            // Use pre-calculated attendance stats if available
            presentDays = progress.attendanceStats.presentDays;
            totalDays = progress.attendanceStats.totalDays || 1;
          } else if (progress?.dailyActivity) {
            // Calculate from daily activity data
            presentDays = progress.dailyActivity.filter(entry => entry.isPresent).length;
            const today = new Date();
            const enrollmentDate = progress?.createdAt || student.createdAt || new Date();
            totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
          } else {
            // No attendance data available, set to 0
            presentDays = 0;
            totalDays = 1;
          }
        }
        
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        return {
          ...student,
          careerTrack: normalizedCareerTrack, // Use normalized value
          progress: progress ? Math.round((progress.completedLevels.length / totalLevels) * 100) : 0,
          currentLevel: progress ? `Level ${progress.currentLevel}` : 'Level 1',
          totalPoints: progress?.totalPoints || 0,
          streakDays: progress?.streakDays || 0,
          status: student.isActive ? 'active' : 'inactive',
          // Attendance information
          currentStreak: progress?.attendanceStats?.currentStreak || 0,
          longestStreak: progress?.attendanceStats?.longestStreak || 0,
          attendancePercentage: attendancePercentage,
          totalDays: totalDays,
          presentDays: presentDays
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
    
    // Normalize career track to handle legacy "fullstack" vs "full-stack"
    const normalizedCareerTrack = student.careerTrack === 'fullstack' ? 'full-stack' : student.careerTrack;
    
    // Get the actual track structure to calculate accurate completion rate
    const track = await Track.findOne({ name: normalizedCareerTrack }).lean();
    const totalLevels = track ? track.levels.length : 10; // Fallback to 10 if track not found
    
    // Calculate performance metrics
    const performance = {
      performance: progress ? Math.round((progress.completedLevels.length / totalLevels) * 100) : 0,
      potential: 90, // This could be calculated based on various factors
      contribution: 78, // This could be calculated based on community participation
      creativity: 82, // This could be calculated based on exercise submissions
      skill: progress ? Math.round((progress.totalPoints / 1000) * 100) : 0, // Assuming 1000 points = 100% skill
      teamwork: 80 // This could be calculated based on collaborative activities
    };
    
    // Calculate attendance statistics for consistency
    let presentDays = 0;
    let totalDays = 1;
    
    if (progress?.attendanceStats?.presentDays !== undefined) {
      // Use pre-calculated attendance stats if available
      presentDays = progress.attendanceStats.presentDays;
      totalDays = progress.attendanceStats.totalDays || 1;
    } else if (progress?.dailyActivity) {
      // Fallback to calculating from daily activity
      presentDays = progress.dailyActivity.filter(entry => entry.isPresent).length;
      const today = new Date();
      const enrollmentDate = progress?.createdAt || student.createdAt || new Date();
      totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // If no attendance data exists, provide a more realistic estimate
      const today = new Date();
      const enrollmentDate = student.createdAt || new Date();
      totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use only actual attendance data, no progress-based estimation
      if (progress?.attendanceStats?.presentDays !== undefined) {
        // Use pre-calculated attendance stats if available
        presentDays = progress.attendanceStats.presentDays;
        totalDays = progress.attendanceStats.totalDays || 1;
      } else if (progress?.dailyActivity) {
        // Calculate from daily activity data
        presentDays = progress.dailyActivity.filter(entry => entry.isPresent).length;
        const today = new Date();
        const enrollmentDate = progress?.createdAt || student.createdAt || new Date();
        totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        // No attendance data available, set to 0
        presentDays = 0;
        totalDays = 1;
      }
    }
    
    // Calculate attendance percentage for consistency (0-100 scale)
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Calculate summary stats
    const summaryStats = {
      consistency: attendancePercentage, // Now normalized to 0-100
      progress: progress ? Math.round((progress.completedLevels.length / totalLevels) * 100) : 0,
      leaderboard: progress ? Math.round((progress.totalPoints / 1000) * 100) : 0
    };
    
    // Build learning timeline
    const learningTimeline = progress?.completedLevels.map((level, index) => ({
      level: totalLevels - index, // Reverse order to show latest first, using actual total levels
      courseName: `Level ${totalLevels - index}`, // This should come from actual curriculum data
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
    
    // Get progress statistics with dynamic track-based calculations
    const studentsWithTracks = await User.aggregate([
      { $match: { role: 'student' } },
      { $lookup: { from: 'tracks', localField: 'careerTrack', foreignField: 'name', as: 'track' } },
      { $unwind: { path: '$track', preserveNullAndEmptyArrays: true } }
    ]);


    
    // Calculate actual completion rate based on student progress
    let studentsWithCompletedLevels = 0;
    
    for (const student of studentsWithTracks) {
      const progress = await UserProgress.findOne({ user: student._id }).lean();
      if (progress && progress.completedLevels.length > 0) {
        studentsWithCompletedLevels++;
      }
    }
    
    // Calculate completion rate: percentage of students who have completed at least one level
    const completionRate = totalStudents > 0 ? Math.round((studentsWithCompletedLevels / totalStudents) * 100) : 0;
    
    // Calculate progress for each student based on their actual track
    let totalProgress = 0;
    let studentsWithProgress = 0;

    for (const student of studentsWithTracks) {
      const progress = await UserProgress.findOne({ user: student._id }).lean();
      if (progress) {
        const totalLevels = student.track ? student.track.levels.length : 10;
        const studentProgress = progress.completedLevels.length / totalLevels;
        totalProgress += studentProgress;
        
        studentsWithProgress++;
      }
    }

    const avgProgress = studentsWithProgress > 0 ? totalProgress / studentsWithProgress : 0;
    
    // Get career track distribution with actual level counts
    const trackDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $lookup: { from: 'tracks', localField: 'careerTrack', foreignField: 'name', as: 'track' } },
      { $unwind: { path: '$track', preserveNullAndEmptyArrays: true } },
      // Normalize career track values to handle legacy "fullstack" vs "full-stack"
      { $addFields: {
        normalizedCareerTrack: {
          $cond: {
            if: { $eq: ['$careerTrack', 'fullstack'] },
            then: 'full-stack',
            else: '$careerTrack'
          }
        }
      }},
      { $group: { 
        _id: '$normalizedCareerTrack', 
        count: { $sum: 1 },
        totalLevels: { $first: '$track.levels' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get track structure information
    const trackStructure = await Track.find({ isActive: true }).select('name displayName levels difficulty').lean();
    
    const analytics = {
      totalStudents,
      activeStudents,
      completionRate: Math.round((activeStudents / totalStudents) * 100),
      trackDistribution: trackDistribution.map(track => ({
        track: track._id,
        count: track.count,
        totalLevels: track.totalLevels ? track.totalLevels.length : 10
      })),
      trackStructure: trackStructure.map(track => ({
        name: track.name,
        displayName: track.displayName,
        totalLevels: track.levels.length,
        difficulty: track.difficulty
      })),
      avgProgress: Math.round(avgProgress * 100)
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
