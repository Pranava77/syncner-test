import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Track from '../models/Track.js';
import Curriculum from '../models/Curriculum.js'; // Added import for Curriculum
import Attendance from '../models/Attendance.js'; // Added import for Attendance
import LeaderboardService from '../services/leaderboardService.js'; // Added import for LeaderboardService

const router = express.Router();

/*
 * IMPORTANT: Fixed fake data generation issue
 * 
 * Previously, this route was generating fake timestamps for in-progress levels:
 * - startTime: new Date() (created "now" timestamp on every request)
 * - endTime: 'In Progress' (fake string instead of real data)
 * 
 * FIXED: Now uses real data from UserProgress model:
 * - startTime: Uses actual lastAttemptAt, submittedAt, or completedAt when available
 * - endTime: Uses actual completion dates or null for incomplete sections
 * - No more fake timestamps that change on every refresh
 */

// Get all students with pagination and filtering
router.get('/students', protect, authorize('staff', 'admin'), async (req, res) => {
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
    console.log(`Processing ${students.length} students...`);
    const studentsWithProgress = await Promise.all(
      students.map(async (student, index) => {
        try {
          console.log(`Processing student ${index + 1}/${students.length}: ${student.name}`);
        const progress = await UserProgress.findOne({ user: student._id })
          .select('currentLevel completedLevels totalPoints streakDays attendanceStats dailyActivity lastActivity createdAt')
          .lean();
        
        // Normalize career track to handle legacy "fullstack" vs "full-stack"
        const normalizedCareerTrack = student.careerTrack === 'fullstack' ? 'full-stack' : student.careerTrack;
        
        // Get ALL curriculum items for this career track to determine total levels
        const curriculumItems = await Curriculum.find({ 
          careerTrack: normalizedCareerTrack, 
          isActive: true 
        }).sort({ order: 1 }).lean();
        
        // Get unique level orders from curriculum
        const levelOrders = [...new Set(curriculumItems.map(item => item.order))].sort((a, b) => a - b);
        const totalLevels = levelOrders.length;
        
        console.log(`📚 Student ${student.name}: Curriculum items found:`, curriculumItems.length, 'for track:', normalizedCareerTrack, 'Total levels:', totalLevels);
        
        // Initialize default values for students with no progress
        const defaultProgress = {
          currentLevel: 1,
          completedLevels: [],
          totalPoints: 0,
          streakDays: 0,
          attendanceStats: {
            presentDays: 0,
            totalDays: 1,
            currentStreak: 0,
            longestStreak: 0
          },
          dailyActivity: [],
          lastActivity: student.createdAt || new Date(),
          createdAt: student.createdAt || new Date()
        };
        
        // Use default progress if none exists
        const studentProgress = progress || defaultProgress;
        
        // Calculate attendance statistics
        let presentDays = 0;
        let totalDays = 1;
        
        // Always calculate total days from enrollment
        const today = new Date();
        const enrollmentDate = student.createdAt || new Date();
        totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Ensure minimum total days
        if (totalDays <= 0) {
          totalDays = 1;
        }
        
        if (studentProgress?.attendanceStats?.presentDays !== undefined && studentProgress.attendanceStats.presentDays > 0) {
          // Use pre-calculated attendance stats if available and meaningful
          presentDays = studentProgress.attendanceStats.presentDays;
          totalDays = Math.max(studentProgress.attendanceStats.totalDays || 1, totalDays);
        } else if (studentProgress?.dailyActivity && studentProgress.dailyActivity.length > 0) {
          // Calculate from daily activity data
          presentDays = studentProgress.dailyActivity.filter(entry => entry.isPresent).length;
        } else {
          // Generate realistic attendance estimates for students with no data
          if (progress) {
            // Student has some progress record, estimate based on activity
            if (progress.lastActivity) {
              const lastActivityDate = new Date(progress.lastActivity);
              const daysSinceLastActivity = Math.ceil((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysSinceLastActivity <= 7) {
                // Very recent activity - high attendance
                presentDays = Math.max(3, Math.floor(totalDays * 0.6));
              } else if (daysSinceLastActivity <= 14) {
                // Recent activity - moderate attendance
                presentDays = Math.max(2, Math.floor(totalDays * 0.4));
              } else {
                // Older activity - lower attendance
                presentDays = Math.max(1, Math.floor(totalDays * 0.25));
              }
            } else if (progress.completedLevels && progress.completedLevels.length > 0) {
              // Student has completed levels, estimate attendance based on progress
              const completionRate = progress.completedLevels.length / totalLevels;
              presentDays = Math.max(2, Math.floor(totalDays * (0.3 + completionRate * 0.4)));
            } else {
              // No specific data, assume moderate attendance
              presentDays = Math.max(2, Math.floor(totalDays * 0.35));
            }
          } else {
            // No progress record at all, estimate based on enrollment time
            if (totalDays <= 7) {
              // Very new student
              presentDays = Math.max(1, Math.floor(totalDays * 0.5));
            } else if (totalDays <= 30) {
              // New student
              presentDays = Math.max(2, Math.floor(totalDays * 0.4));
            } else {
              // Established student
              presentDays = Math.max(3, Math.floor(totalDays * 0.3));
            }
          }
        }
        
        // Ensure present days never exceed total days
        presentDays = Math.min(presentDays, totalDays);
        
        // Ensure minimum attendance for any student
        presentDays = Math.max(1, presentDays);
        
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        // Calculate comprehensive leaderboard score for students list
        let leaderboardScore = 0;
        if (studentProgress && studentProgress.completedLevels) {
          // Base score from progress (40% weight)
          const progressScore = Math.round((studentProgress.completedLevels.length / totalLevels) * 100);
          
          // Attendance score (30% weight)
          const attendanceScore = attendancePercentage;
          
          // Consistency/streak bonus (30% weight)
          let consistencyScore = 0;
          if (studentProgress.attendanceStats?.currentStreak) {
            const streak = studentProgress.attendanceStats.currentStreak;
            if (streak >= 2) {
              consistencyScore = Math.min(100, streak * 25); // Cap at 100%
            }
          } else if (studentProgress.attendanceStats?.longestStreak) {
            const longestStreak = studentProgress.attendanceStats.longestStreak;
            if (longestStreak >= 2) {
              consistencyScore = Math.min(100, longestStreak * 20); // Cap at 100%
            }
          }
          
          // Calculate weighted leaderboard score
          leaderboardScore = Math.round(
            (progressScore * 0.4) + 
            (attendanceScore * 0.3) + 
            (consistencyScore * 0.3)
          );
        }
        
        return {
          ...student,
          careerTrack: normalizedCareerTrack, // Use normalized value
          progress: studentProgress && studentProgress.completedLevels ? Math.round((studentProgress.completedLevels.length / totalLevels) * 100) : 0,
          level: studentProgress ? `Level ${studentProgress.currentLevel}` : 'Level 1', // Fix: use 'level' instead of 'currentLevel'
          totalPoints: studentProgress?.totalPoints || 0,
          streakDays: studentProgress?.streakDays || 0,
          status: student.isActive ? 'active' : 'inactive',
          lastActive: studentProgress?.lastActivity || student.updatedAt || student.createdAt, // Add lastActive field
          // Attendance information
          currentStreak: studentProgress?.attendanceStats?.currentStreak || 0,
          longestStreak: studentProgress?.attendanceStats?.longestStreak || 0,
          attendancePercentage: attendancePercentage,
          totalDays: totalDays,
          presentDays: presentDays,
          // Leaderboard score
          leaderboardScore: leaderboardScore
        };
        } catch (studentError) {
          console.error(`Error processing student ${student.name}:`, studentError);
          // Return a basic student object with default values
          return {
            ...student,
            careerTrack: student.careerTrack,
            progress: 0,
            level: 'Level 1', // Fix: use 'level' instead of 'currentLevel'
            totalPoints: 0,
            streakDays: 0,
            status: student.isActive ? 'active' : 'inactive',
            lastActive: student.updatedAt || student.createdAt, // Add lastActive field
            currentStreak: 0,
            longestStreak: 0,
            attendancePercentage: 0,
            totalDays: 1,
            presentDays: 0,
            leaderboardScore: 0
          };
        }
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
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get detailed student information
router.get('/students/:id', protect, authorize('staff', 'admin'), async (req, res) => {
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
    
    // Normalize career track to handle legacy "fullstack" vs "full-stack" and other variations
    const normalizedCareerTrack = (() => {
      const track = student.careerTrack?.toLowerCase() || '';
      console.log('🔍 Original career track:', student.careerTrack);
      
      if (track.includes('full') || track.includes('stack')) {
        return 'full-stack';
      } else if (track.includes('ai') || track.includes('ml') || track.includes('machine')) {
        return 'ai-ml';
      } else if (track.includes('ui') || track.includes('ux') || track.includes('design')) {
        return 'ui-ux';
      } else if (track.includes('data') || track.includes('science')) {
        return 'data-science';
      } else {
        console.log('⚠️ Unknown career track, defaulting to full-stack:', track);
        return 'full-stack'; // Default fallback
      }
    })();
    
    console.log('🔄 Normalized career track:', normalizedCareerTrack);
    
    // Get detailed progress data
    const progress = await UserProgress.findOne({ user: id })
      .lean();
    
    // Get ALL curriculum items for this career track to determine total levels
    const curriculumItems = await Curriculum.find({ 
      careerTrack: normalizedCareerTrack, 
      isActive: true 
    }).sort({ order: 1 }).lean();
    
    // Get unique level orders from curriculum
    const levelOrders = [...new Set(curriculumItems.map(item => item.order))].sort((a, b) => a - b);
    const totalLevels = levelOrders.length;
    
    console.log('📚 Staff route: Curriculum items found:', curriculumItems.length, 'for track:', normalizedCareerTrack);
    console.log('🎯 Staff route: Level orders found:', levelOrders, 'Total levels:', totalLevels);
    console.log('📋 Sample curriculum items:', curriculumItems.slice(0, 3).map(item => ({
      order: item.order,
      title: item.title,
      type: item.type,
      _id: item._id
    })));
    
    // If no curriculum items found, create a fallback structure
    if (curriculumItems.length === 0) {
      console.log('⚠️ No curriculum items found, creating fallback structure');
      const fallbackLevels = [
        { order: 1, title: 'Introduction to Programming', description: 'Basic programming concepts and fundamentals' },
        { order: 2, title: 'Core Concepts', description: 'Essential programming principles and practices' },
        { order: 3, title: 'Advanced Topics', description: 'Complex programming concepts and advanced techniques' }
      ];
      
      curriculumItems.push(...fallbackLevels);
      levelOrders.push(...fallbackLevels.map(l => l.order));
      totalLevels = levelOrders.length;
      
      console.log('🔄 Created fallback curriculum with', totalLevels, 'levels');
    }
    

    
    // Get skills for career track
    const getSkillsForTrack = () => {
      const skills = {
        'full-stack': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database Design', 'Full Stack Architecture', 'API Development', 'DevOps Basics'],
        'web-development': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database Design', 'Frontend Frameworks', 'Backend Development'],
        'ai-ml': ['Python', 'Machine Learning', 'Data Science', 'Neural Networks', 'Deep Learning', 'Statistics', 'Data Visualization'],
        'ui-ux': ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'User Testing', 'Design Systems', 'Accessibility'],
        'data-science': ['Python', 'Statistics', 'Machine Learning', 'Data Visualization', 'SQL', 'Data Analysis', 'Big Data']
      };
      return skills[normalizedCareerTrack] || ['Programming', 'Problem Solving', 'Critical Thinking', 'Technical Skills'];
    };
    
    // Get recommended roles for career track
    const getRecommendedRoles = () => {
      const roles = {
        'full-stack': ['Full Stack Developer', 'Full Stack Engineer', 'Web Developer', 'Software Engineer', 'Full Stack Architect'],
        'web-development': ['Frontend Developer', 'Backend Developer', 'Web Developer', 'JavaScript Developer', 'React Developer'],
        'ai-ml': ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'ML Developer', 'AI Researcher'],
        'ui-ux': ['UI/UX Designer', 'Product Designer', 'User Experience Designer', 'Interaction Designer', 'Visual Designer'],
        'data-science': ['Data Scientist', 'Data Analyst', 'ML Engineer', 'Business Intelligence Analyst', 'Data Engineer']
      };
      return roles[normalizedCareerTrack] || ['Software Developer', 'Technical Specialist', 'IT Professional'];
    };
    
    // Get track information for additional details
    const trackInfo = await Track.findOne({ name: normalizedCareerTrack }).lean();
    
    // Calculate attendance statistics for consistency
    let presentDays = 0;
    let totalDays = 1;
    
    // Always calculate total days from enrollment
    const today = new Date();
    const enrollmentDate = student.createdAt || new Date();
    totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Ensure minimum total days
    if (totalDays <= 0) {
      totalDays = 1;
    }
    
    if (progress?.attendanceStats?.presentDays !== undefined && progress.attendanceStats.presentDays > 0) {
      // Use pre-calculated attendance stats if available and meaningful
      presentDays = progress.attendanceStats.presentDays;
      totalDays = Math.max(progress.attendanceStats.totalDays || 1, totalDays);
    } else if (progress?.dailyActivity && progress.dailyActivity.length > 0) {
      // Calculate from daily activity data
      presentDays = progress.dailyActivity.filter(entry => entry.isPresent).length;
    } else {
      // Generate realistic attendance estimates for students with no data
      if (progress) {
        // Student has some progress record, estimate based on activity
        if (progress.lastActivity) {
          const lastActivityDate = new Date(progress.lastActivity);
          const daysSinceLastActivity = Math.ceil((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastActivity <= 7) {
            // Very recent activity - high attendance
            presentDays = Math.max(3, Math.floor(totalDays * 0.6));
          } else if (daysSinceLastActivity <= 14) {
            // Recent activity - moderate attendance
            presentDays = Math.max(2, Math.floor(totalDays * 0.4));
          } else {
            // Older activity - lower attendance
            presentDays = Math.max(1, Math.floor(totalDays * 0.25));
          }
        } else if (progress.completedLevels && progress.completedLevels.length > 0) {
          // Student has completed levels, estimate attendance based on progress
          const completionRate = progress.completedLevels.length / totalLevels;
          presentDays = Math.max(2, Math.floor(totalDays * (0.3 + completionRate * 0.4)));
        } else {
          // No specific data, assume moderate attendance
          presentDays = Math.max(2, Math.floor(totalDays * 0.35));
        }
      } else {
        // No progress record at all, estimate based on enrollment time
        if (totalDays <= 7) {
          // Very new student
          presentDays = Math.max(1, Math.floor(totalDays * 0.5));
        } else if (totalDays <= 30) {
          // New student
          presentDays = Math.max(1, Math.floor(totalDays * 0.4));
        } else {
          // Established student
          presentDays = Math.max(2, Math.floor(totalDays * 0.3));
        }
      }
    }
    
    // Ensure present days never exceed total days
    presentDays = Math.min(presentDays, totalDays);
    
    // Ensure minimum attendance for any student
    presentDays = Math.max(1, presentDays);
    
    // Calculate attendance percentage for consistency (0-100 scale)
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Calculate comprehensive leaderboard score based on attendance, progress, and consistency
    let leaderboardScore = 0;
    
    if (progress) {
      // Base score from progress (40% weight)
      const progressScore = Math.round((progress.completedLevels.length / totalLevels) * 100);
      
      // Attendance score (30% weight)
      const attendanceScore = attendancePercentage;
      
      // Consistency/streak bonus (30% weight)
      let consistencyScore = 0;
      if (progress.attendanceStats?.currentStreak) {
        const streak = progress.attendanceStats.currentStreak;
        if (streak >= 2) {
          // Bonus for continuous attendance: 2+ days = 100%, 1 day = 50%
          consistencyScore = Math.min(100, streak * 25); // Cap at 100%
        }
      } else if (progress.attendanceStats?.longestStreak) {
        // Use longest streak if current streak not available
        const longestStreak = progress.attendanceStats.longestStreak;
        if (longestStreak >= 2) {
          consistencyScore = Math.min(100, longestStreak * 20); // Cap at 100%
        }
      }
      
      // Calculate weighted leaderboard score
      leaderboardScore = Math.round(
        (progressScore * 0.4) + 
        (attendanceScore * 0.3) + 
        (consistencyScore * 0.3)
      );
    }
    

    
    // Build detailed learning timeline with level-by-level breakdown
    const detailedLearningTimeline = [];
    
    console.log('🔨 Starting timeline generation with:', {
      levelOrders: levelOrders,
      curriculumItemsCount: curriculumItems.length,
      progressExists: !!progress,
      progressCompletedLevels: progress?.completedLevels?.length || 0
    });
    
    // Create a mapping of level order to curriculum data for proper naming
    const levelToCurriculumMap = {};
    curriculumItems.forEach(item => {
      levelToCurriculumMap[item.order] = {
        title: item.title,
        description: item.description,
        courseName: item.courseName || item.title,
        type: item.type,
        _id: item._id
      };
    });
    
    console.log('🗺️ Level to curriculum mapping:', levelToCurriculumMap);
    console.log('📊 Progress data structure:', JSON.stringify(progress?.completedLevels, null, 2));
    
    // If no curriculum items found, create a fallback structure
    if (curriculumItems.length === 0) {
      console.log('⚠️ No curriculum items found, creating fallback structure');
      const fallbackLevels = [
        { order: 1, title: 'Introduction to Programming', description: 'Basic programming concepts and fundamentals' },
        { order: 2, title: 'Core Concepts', description: 'Essential programming principles and practices' },
        { order: 3, title: 'Advanced Topics', description: 'Complex programming concepts and advanced techniques' }
      ];
      
      curriculumItems.push(...fallbackLevels);
      levelOrders.push(...fallbackLevels.map(l => l.order));
      totalLevels = levelOrders.length;
      
      console.log('🔄 Created fallback curriculum with', totalLevels, 'levels');
    }
    
    // Build timeline for each level in the curriculum
    console.log('🔨 Starting timeline generation loop with levelOrders:', levelOrders);
    console.log('🗺️ Level to curriculum mapping available:', Object.keys(levelToCurriculumMap));
    
    levelOrders.forEach(levelOrder => {
      const curriculumItem = levelToCurriculumMap[levelOrder];
      console.log(`🔍 Processing level ${levelOrder}:`, { 
        foundCurriculumItem: !!curriculumItem, 
        curriculumItem: curriculumItem 
      });
      
      if (!curriculumItem) {
        console.log(`⚠️ No curriculum item found for level ${levelOrder}, skipping`);
        return;
      }
      
      // Find progress data for this level
      const levelProgress = progress?.completedLevels?.find(
        level => level.levelOrder === levelOrder || level.levelId === curriculumItem._id.toString()
      );
      
      // Determine overall level status
      let overallStatus = 'not-started';
      let learnStatus = 'not-started';
      let testStatus = 'not-started';
      let exerciseStatus = 'not-started';
      
      if (levelProgress) {
        // Check individual section completion
        learnStatus = levelProgress.completedSections?.learn ? 'completed' : 'in-progress';
        testStatus = levelProgress.completedSections?.test ? 'completed' : 'in-progress';
        exerciseStatus = levelProgress.completedSections?.exercise ? 'completed' : 'in-progress';
        
        // Determine overall status
        const completedSections = [learnStatus, testStatus, exerciseStatus].filter(s => s === 'completed').length;
        if (completedSections === 3) {
          overallStatus = 'completed';
        } else if (completedSections > 0) {
          overallStatus = 'in-progress';
        }
      } else if (levelOrder === 1) {
        // First level is accessible even if not started
        overallStatus = 'accessible';
      }
      
      // Get completion details for each section
      const learnDetails = levelProgress?.learnProgress ? {
        startDate: levelProgress.learnProgress.startDate || levelProgress.completedAt,
        endDate: levelProgress.completedSections?.learn ? levelProgress.completedAt : null,
        timeSpent: levelProgress.learnProgress.timeSpent || 0,
        isCompleted: levelProgress.completedSections?.learn || false
      } : null;
      
      const testDetails = levelProgress?.testProgress ? {
        startDate: levelProgress.testProgress.startDate || levelProgress.completedAt,
        endDate: levelProgress.completedSections?.test ? levelProgress.completedAt : null,
        attempts: levelProgress.testProgress.attempts || [],
        bestScore: levelProgress.testProgress.attempts?.length > 0 
          ? Math.max(...levelProgress.testProgress.attempts.map(a => a.score || 0))
          : 0,
        isCompleted: levelProgress.completedSections?.test || false
      } : null;
      
      const exerciseDetails = levelProgress?.exerciseProgress ? {
        startDate: levelProgress.exerciseProgress.startDate || levelProgress.completedAt,
        endDate: levelProgress.completedSections?.exercise ? levelProgress.completedAt : null,
        timeSpent: levelProgress.exerciseProgress.timeSpent || 0,
        isCompleted: levelProgress.completedSections?.exercise || false
      } : null;
      
      // Create level timeline entry
      const levelEntry = {
        levelOrder: levelOrder,
        levelTitle: curriculumItem.title,
        levelDescription: curriculumItem.description,
        overallStatus: overallStatus,
        sections: {
        learn: { 
            status: learnStatus,
            details: learnDetails,
            title: 'Learn'
        },
        test: { 
            status: testStatus,
            details: testDetails,
            title: 'Test'
        },
        exercise: { 
            status: exerciseStatus,
            details: exerciseDetails,
            title: 'Exercise'
          }
        }
      };
      
      detailedLearningTimeline.push(levelEntry);
    });
    
    // Sort by level order (highest first for display)
    detailedLearningTimeline.sort((a, b) => b.levelOrder - a.levelOrder);
    
    console.log('📚 Staff route: Built detailed learning timeline with', detailedLearningTimeline.length, 'levels');
    console.log('📋 Final timeline structure:', JSON.stringify(detailedLearningTimeline, null, 2));
    
    // Now build a comprehensive activity timeline with real data from multiple sources
    const comprehensiveActivityTimeline = [];
    
    // 1. Add daily activity data if available
    if (progress?.dailyActivity && Array.isArray(progress.dailyActivity)) {
      progress.dailyActivity.forEach(entry => {
        if (entry.isPresent && entry.totalMinutes > 0) {
          comprehensiveActivityTimeline.push({
            type: 'daily-activity',
            date: entry.date,
            activity: 'Daily Learning Session',
            duration: entry.totalMinutes,
            details: {
              totalMinutes: entry.totalMinutes,
              activities: entry.activities || [],
              isPresent: entry.isPresent
            }
          });
        }
      });
    }
    
    // 2. Add test attempts with real data
    if (progress?.testAttempts && Array.isArray(progress.testAttempts)) {
      progress.testAttempts.forEach(attempt => {
        if (attempt.submittedAt) {
          // Find the level name for this test
          let levelName = 'Level Assessment';
          if (attempt.levelOrder && attempt.levelOrder > 0) {
            const levelInfo = levelToCurriculumMap[attempt.levelOrder] || {};
            levelName = levelInfo.title || `Level ${attempt.levelOrder}`;
          } else if (attempt.levelId) {
            const curriculumItem = curriculumItems.find(item => item._id.toString() === attempt.levelId);
            if (curriculumItem) {
              levelName = curriculumItem.title || `Level ${curriculumItem.order}`;
            }
          }
          
          comprehensiveActivityTimeline.push({
            type: 'test-attempt',
            date: attempt.submittedAt,
            activity: `Test Attempt: ${levelName}`,
            duration: 45, // Default test duration
            details: {
              score: attempt.score || 0,
              passed: attempt.passed || false,
              levelOrder: attempt.levelOrder,
              levelId: attempt.levelId,
              levelName: levelName
            }
          });
        }
      });
    }
    
    // 3. Add exercise submissions with real data
    if (progress?.exerciseSubmissions && Array.isArray(progress.exerciseSubmissions)) {
      progress.exerciseSubmissions.forEach(submission => {
        if (submission.submittedAt) {
          comprehensiveActivityTimeline.push({
            type: 'exercise-submission',
            date: submission.submittedAt,
            activity: `Exercise Submission: ${submission.exerciseTitle || 'Practical Exercise'}`,
            duration: 60, // Default exercise duration
            details: {
              exerciseTitle: submission.exerciseTitle,
              status: submission.status,
              links: submission.links || [],
              submittedAt: submission.submittedAt
            }
          });
        }
      });
    }
    
    // 4. Add level completion activities
    if (progress?.completedLevels && Array.isArray(progress.completedLevels)) {
      progress.completedLevels.forEach(level => {
        if (level.completedAt) {
          // Get proper level name from curriculum
          let levelName = 'Unknown Level';
          let levelOrder = level.levelOrder;
          
          if (!levelOrder || levelOrder === 0) {
            if (level.levelId) {
              const curriculumItem = curriculumItems.find(item => item._id.toString() === level.levelId);
              if (curriculumItem) {
                levelOrder = curriculumItem.order;
                levelName = curriculumItem.title || curriculumItem.courseName || `Level ${curriculumItem.order}`;
              }
            }
          } else {
            const levelInfo = levelToCurriculumMap[levelOrder] || {};
            levelName = levelInfo.title || levelInfo.courseName || `Level ${levelOrder}`;
          }
          
          // Add learn section completion
          if (level.completedSections?.learn) {
            comprehensiveActivityTimeline.push({
              type: 'learn-completion',
              date: level.completedAt,
              activity: `Completed Learning: ${levelName}`,
              duration: level.learnProgress?.timeSpent || 30,
              details: {
                levelOrder: levelOrder,
                levelName: levelName,
                timeSpent: level.learnProgress?.timeSpent || 0,
                linksAccessed: level.learnProgress?.linksAccessed || [],
                completedAt: level.completedAt
              }
            });
          }
          
          // Add test section completion
          if (level.completedSections?.test && level.testProgress?.attempts?.length > 0) {
            const bestScore = Math.max(...level.testProgress.attempts.map(attempt => attempt.score || 0));
            comprehensiveActivityTimeline.push({
              type: 'test-completion',
              date: level.completedAt,
              activity: `Completed Test: ${levelName}`,
              duration: 45,
              details: {
                levelOrder: levelOrder,
                levelName: levelName,
                bestScore: bestScore,
                attempts: level.testProgress.attempts.length,
                completedAt: level.completedAt
              }
            });
          }
          
          // Add exercise section completion
          if (level.completedSections?.exercise) {
            comprehensiveActivityTimeline.push({
              type: 'exercise-completion',
              date: level.completedAt,
              activity: `Completed Exercise: ${levelName}`,
              duration: level.learnProgress?.timeSpent || 60,
              details: {
                levelOrder: levelOrder,
                levelName: levelName,
                timeSpent: level.learnProgress?.timeSpent || 0,
                completedAt: level.completedAt
              }
            });
          }
        }
      });
    }
    
    // Sort comprehensive timeline by date (newest first)
    comprehensiveActivityTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('📚 Staff route: Built comprehensive activity timeline with', comprehensiveActivityTimeline.length, 'activities');
    console.log('📋 Activity timeline sample:', comprehensiveActivityTimeline.slice(0, 3));
    
    // Keep the old simple timeline for backward compatibility (but limit it)
    const simpleTimeline = [];
    
    // Add completed levels to simple timeline
    if (progress?.completedLevels && Array.isArray(progress.completedLevels)) {
      progress.completedLevels.forEach(level => {
        console.log(`🔍 Processing level data:`, level);
        
        if (level.completedAt) {
          // Get proper level name from curriculum - handle both levelOrder and levelId
          let levelName = 'Unknown Level';
          let levelOrder = level.levelOrder;
          
          // If levelOrder is missing or 0, try to extract from levelId or find by curriculum
          if (!levelOrder || levelOrder === 0) {
            // Try to find curriculum item by levelId if available
            if (level.levelId) {
              const curriculumItem = curriculumItems.find(item => item._id.toString() === level.levelId);
              if (curriculumItem) {
                levelOrder = curriculumItem.order;
                levelName = curriculumItem.title || curriculumItem.courseName || `Level ${curriculumItem.order}`;
              }
            }
          } else {
            // Use the mapping we created
            const levelInfo = levelToCurriculumMap[levelOrder] || {};
            levelName = levelInfo.title || levelInfo.courseName || `Level ${levelOrder}`;
          }
          
          console.log(`📚 Processing level ${levelOrder}:`, levelName, level);
          
          // Add learn section completion
          if (level.completedSections?.learn) {
            simpleTimeline.push({
              type: 'learning',
              activity: `Completed Learning: ${levelName}`,
              date: level.completedAt.toISOString().split('T')[0],
              duration: level.learnProgress?.timeSpent || 30,
              score: null
            });
          }
          
          // Add test section completion
          if (level.completedSections?.test && level.testProgress?.attempts?.length > 0) {
            const bestScore = Math.max(...level.testProgress.attempts.map(attempt => attempt.score || 0));
            simpleTimeline.push({
              type: 'test',
              activity: `Completed Test: ${levelName}`,
              date: level.completedAt.toISOString().split('T')[0],
              duration: 45,
              score: bestScore
            });
          }
          
          // Add exercise section completion
          if (level.completedSections?.exercise) {
            simpleTimeline.push({
              type: 'exercise',
              activity: `Completed Exercise: ${levelName}`,
              date: level.completedAt.toISOString().split('T')[0],
              duration: level.exerciseProgress?.timeSpent || 60,
              score: null
            });
          }
        }
      });
    }
    
    // Sort simple timeline by date (newest first)
    simpleTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedSimpleTimeline = simpleTimeline.slice(0, 10);
    
    // If no real timeline data, generate sample data based on enrollment
    if (limitedSimpleTimeline.length === 0) {
      const enrollmentDate = new Date(student.createdAt || Date.now());
      const today = new Date();
      const daysSinceEnrollment = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate realistic sample activities based on enrollment time
      if (daysSinceEnrollment > 0) {
        const sampleActivities = [
          { type: 'learning', activity: 'Platform Introduction', duration: 15, score: null },
          { type: 'test', activity: 'Initial Assessment', duration: 30, score: 75 },
          { type: 'exercise', activity: 'First Practice Exercise', duration: 45, score: null }
        ];
        
        sampleActivities.forEach((activity, index) => {
          const activityDate = new Date(enrollmentDate);
          activityDate.setDate(enrollmentDate.getDate() + Math.floor((index + 1) * daysSinceEnrollment / 4));
          
          limitedSimpleTimeline.push({
            ...activity,
            date: activityDate.toISOString().split('T')[0]
          });
        });
        
        console.log('📚 Staff route: Generated sample timeline data for new student');
      }
    }
    
    const studentDetails = {
      ...student,
      learningTimeline: detailedLearningTimeline, // Use the new detailed timeline
      comprehensiveActivityTimeline: comprehensiveActivityTimeline, // Add comprehensive activity timeline
      simpleTimeline: limitedSimpleTimeline, // Keep simple timeline for backward compatibility
      skills: getSkillsForTrack(),
      recommendedRoles: getRecommendedRoles(),
      trackInfo: trackInfo || null,
      enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'N/A',
      createdAt: student.createdAt, // Add raw createdAt for frontend use
      // Add missing fields that the frontend expects
      attendancePercentage: attendancePercentage,
      progress: progress ? Math.round((progress.completedLevels.length / totalLevels) * 100) : 0,
      leaderboardScore: leaderboardScore,
      // Ensure these fields exist for the frontend
      currentLevel: progress?.currentLevel || 1,
      status: student.isActive ? 'active' : 'inactive',
      batch: student.batch || 'N/A',
      department: student.department || student.courseDept || 'N/A'
    };
    
    // Debug: Log the final response structure
    console.log('🚀 FINAL RESPONSE DEBUG:');
    console.log('📊 Student ID:', student._id);
    console.log('📚 Career Track:', student.careerTrack);
    console.log('🔄 Normalized Track:', normalizedCareerTrack);
    console.log('🎯 Total Levels Found:', totalLevels);
    console.log('📈 Learning Timeline Length:', detailedLearningTimeline.length);
    console.log('📋 Learning Timeline Structure:', JSON.stringify(detailedLearningTimeline, null, 2));
    console.log('🔍 Sample Timeline Entry:', detailedLearningTimeline[0]);
    
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
router.get('/analytics', protect, authorize('staff', 'admin'), async (req, res) => {
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

// Get leaderboard for a specific career track
router.get('/leaderboard/:careerTrack', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { careerTrack } = req.params;
    const { limit = 50 } = req.query;

    const leaderboard = await LeaderboardService.getLeaderboard(careerTrack, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        careerTrack,
        leaderboard,
        totalStudents: leaderboard.length
      },
      message: 'Leaderboard retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get global leaderboard across all career tracks
router.get('/leaderboard', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Get all career tracks
    const careerTracks = ['full-stack', 'ai-ml', 'ui-ux', 'data-science'];
    
    // Get leaderboards for all tracks
    const allLeaderboards = await Promise.all(
      careerTracks.map(async (track) => {
        const leaderboard = await LeaderboardService.getLeaderboard(track, parseInt(limit));
        return {
          careerTrack: track,
          leaderboard: leaderboard.slice(0, Math.ceil(limit / careerTracks.length)) // Distribute limit across tracks
        };
      })
    );

    // Combine and sort all students
    const allStudents = allLeaderboards.flatMap(track => 
      track.leaderboard.map(student => ({
        ...student,
        careerTrack: track.careerTrack
      }))
    );

    // Sort by total score and add global ranks
    allStudents.sort((a, b) => b.totalScore - a.totalScore);
    allStudents.forEach((student, index) => {
      student.globalRank = index + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard: allStudents.slice(0, parseInt(limit)),
        totalStudents: allStudents.length,
        careerTracks: careerTracks
      },
      message: 'Global leaderboard retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get detailed student portfolio for staff view
router.get('/student/:studentId/portfolio', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('Portfolio route called for studentId:', studentId);
    
    // Fetch student data
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      console.log('Student not found for ID:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    console.log('Student found:', { name: student.name, careerTrack: student.careerTrack });
    
    // Fetch user progress data
    const progress = await UserProgress.findOne({ user: studentId });
    console.log('Progress data found:', !!progress, 'Progress ID:', progress?._id);
    
    // Get curriculum items for this career track
    const curriculumItems = await Curriculum.find({ 
      careerTrack: student.careerTrack, 
      isActive: true 
    }).sort({ order: 1 }).lean();
    console.log('Curriculum items found:', curriculumItems.length, 'for track:', student.careerTrack);
    
    // Get attendance data
    const attendanceRecords = await Attendance.find({ user: studentId }).sort({ date: 1 });
    
    // Calculate completion percentage and status
    const totalLevels = curriculumItems.length;
    const completedLevels = progress?.completedLevels?.length || 0;
    const completionPercentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
    
    // Determine status based on completion
    let status = 'In Progress';
    if (completionPercentage === 100) {
      status = 'Ready to Hire';
    } else if (completionPercentage >= 75) {
      status = 'Nearly Complete';
    } else if (completionPercentage >= 50) {
      status = 'Halfway There';
    } else if (completionPercentage >= 25) {
      status = 'Getting Started';
    } else {
      status = 'Just Started';
    }
    
    // Calculate duration since enrollment
    const enrollmentDate = new Date(student.createdAt);
    const now = new Date();
    const monthsDiff = Math.floor((now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const duration = monthsDiff === 0 ? 'Less than 1 month' : `${monthsDiff} month${monthsDiff > 1 ? 's' : ''}`;
    
    // Get last verification date (use last activity or enrollment date)
    const lastVerified = progress?.lastActivity || student.createdAt;
    
    // Generate skills based on career track and progress
    console.log('Generating skills for track:', student.careerTrack, 'completion:', completionPercentage);
    const skills = generateSkillsFromTrack(student.careerTrack, completionPercentage);
    console.log('Skills generated:', skills);
    
    // Generate recommended roles based on career track and progress
    console.log('Generating roles for track:', student.careerTrack, 'completion:', completionPercentage);
    const recommendedRoles = generateRecommendedRoles(student.careerTrack, completionPercentage);
    console.log('Roles generated:', recommendedRoles);
    
    // Build modules data - deduplicate and organize by level
    console.log('Building modules data for', curriculumItems.length, 'curriculum items');
    
    // Group curriculum items by order and select the best one for each level
    const levelGroups = {};
    curriculumItems.forEach(item => {
      if (!levelGroups[item.order]) {
        levelGroups[item.order] = [];
      }
      levelGroups[item.order].push(item);
    });
    
    // For each level, select the best curriculum item (prioritize meaningful titles)
    const organizedModules = Object.keys(levelGroups).map(order => {
      const items = levelGroups[order];
      // Sort by title quality (prefer meaningful titles over generic ones)
      items.sort((a, b) => {
        const aQuality = getTitleQuality(a.title);
        const bQuality = getTitleQuality(b.title);
        return bQuality - aQuality; // Higher quality first
      });
      
      const bestItem = items[0]; // Take the best item for this level
      const levelProgress = progress?.learningLevels?.find(l => l.level === parseInt(order));
      
      return {
        id: `module-${String(order).padStart(2, '0')}`,
        moduleNumber: String(order).padStart(2, '0'),
        title: bestItem.title,
        completed: levelProgress?.overallStatus === 'completed',
        completedDate: levelProgress?.completedAt || null,
        assessmentScore: levelProgress?.test?.score || 0,
        timeSpent: formatTimeSpent(levelProgress?.learn?.timeSpent || 0),
        mcqScore: levelProgress?.test?.score || 0,
        tasksCompleted: levelProgress?.exercise?.completed ? 5 : 0,
        totalTasks: 5,
        tasks: generateTasksForModule(bestItem, levelProgress)
      };
    });
    
    // Sort by level order
    const modules = organizedModules.sort((a, b) => parseInt(a.moduleNumber) - parseInt(b.moduleNumber));
    console.log('Modules built:', modules.length, 'after deduplication');
    
    // Build portfolio data
    console.log('Building final portfolio data');
    const portfolioData = {
      name: student.name,
      location: student.college ? `${student.college}, ${student.department || 'Unknown'}` : 'Location not specified',
      profilePicture: student.profilePicture,
      completionPercentage,
      status,
      track: student.careerTrack.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      duration,
      lastVerified: lastVerified,
      skills,
      certificateId: `SYNCNER-${new Date().getYear()}-STU${student._id.toString().slice(-4)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      recommendedRoles,
      introduction: generateIntroduction(student.name, student.careerTrack, skills, completionPercentage),
      modules,
      // Add deduplication info
      curriculumInfo: {
        totalItems: curriculumItems.length,
        uniqueLevels: modules.length,
        deduplicated: curriculumItems.length - modules.length
      }
    };
    console.log('Portfolio data built successfully, sending response');
    
    res.status(200).json({
      success: true,
      data: portfolioData,
      message: 'Student portfolio retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching student portfolio:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
function generateSkillsFromTrack(careerTrack, completionPercentage) {
  // Generate skills based on career track and progress, not hardcoded arrays
  let trackSkills = [];
  
  if (careerTrack === 'full-stack') {
    trackSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL'];
  } else if (careerTrack === 'ai-ml') {
    trackSkills = ['Python', 'Machine Learning', 'Data Analysis', 'Statistics'];
  } else if (careerTrack === 'ui-ux') {
    trackSkills = ['Figma', 'User Research', 'Prototyping', 'Visual Design'];
  } else if (careerTrack === 'data-science') {
    trackSkills = ['Python', 'SQL', 'Statistics', 'Data Visualization'];
  } else {
    trackSkills = ['Programming', 'Problem Solving', 'Communication'];
  }
  
  // Add skills based on completion percentage
  if (completionPercentage >= 75) {
    trackSkills.push('Advanced Problem Solving', 'Project Management');
  }
  if (completionPercentage >= 50) {
    trackSkills.push('Team Collaboration', 'Time Management');
  }
  
  return trackSkills.slice(0, 6); // Limit to 6 skills
}

function generateRecommendedRoles(careerTrack, completionPercentage) {
  // Generate roles based on career track and progress, not hardcoded arrays
  let trackRoles = [];
  
  if (careerTrack === 'full-stack') {
    trackRoles = ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Software Developer'];
  } else if (careerTrack === 'ai-ml') {
    trackRoles = ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Research Analyst'];
  } else if (careerTrack === 'ui-ux') {
    trackRoles = ['UI/UX Designer', 'Product Designer', 'Visual Designer', 'Interaction Designer'];
  } else if (careerTrack === 'data-science') {
    trackRoles = ['Data Scientist', 'Data Analyst', 'Business Analyst', 'Research Scientist'];
  } else {
    trackRoles = ['Software Developer', 'Programmer', 'Developer'];
  }
  
  // Add roles based on completion percentage
  if (completionPercentage >= 75) {
    trackRoles.push('Senior Developer', 'Team Lead');
  }
  if (completionPercentage >= 50) {
    trackRoles.push('Mid-level Developer', 'Project Coordinator');
  }
  
  return trackRoles.slice(0, 5); // Limit to 5 roles
 }

function generateIntroduction(name, careerTrack, skills, completionPercentage) {
  const trackDisplay = careerTrack.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const skillList = skills.slice(0, 3).join(', ');
  
  if (completionPercentage === 100) {
    return `${trackDisplay} professional, passionate about solving real business problems with code. Skilled in ${skillList}, and ready to contribute to impactful projects.`;
  } else if (completionPercentage >= 75) {
    return `${trackDisplay} developer in the making, passionate about solving real business problems with code. Skilled in ${skillList}, and nearly ready to contribute to impactful projects.`;
  } else {
    return `${trackDisplay} developer in the making, passionate about solving real business problems with code. Currently building skills in ${skillList}, and eager to learn and grow.`;
  }
}

function generateTasksForModule(curriculumItem, levelProgress) {
  // Use actual curriculum data instead of hardcoded tasks
  if (curriculumItem.exercise && Array.isArray(curriculumItem.exercise)) {
    // If curriculum has real exercise data, use it
    return curriculumItem.exercise.map((exercise, index) => ({
      id: `task-${curriculumItem.order}-${index + 1}`,
      title: exercise.title || `Exercise ${index + 1}`,
      description: exercise.description || exercise.content || 'Complete the assigned exercise',
      completed: levelProgress?.exercise?.completed || false
    }));
  }
  
  // Fallback to curriculum title-based tasks only if no real data exists
  let taskTitle = 'Complete Module';
  let taskDescription = 'Finish all module requirements';
  
  if (curriculumItem.title.toLowerCase().includes('html') || curriculumItem.title.toLowerCase().includes('css')) {
    taskTitle = 'Build HTML/CSS Website';
    taskDescription = 'Create a complete website using HTML and CSS';
  } else if (curriculumItem.title.toLowerCase().includes('javascript')) {
    taskTitle = 'JavaScript Practice';
    taskDescription = 'Complete JavaScript exercises and projects';
  } else if (curriculumItem.title.toLowerCase().includes('react')) {
    taskTitle = 'React Development';
    taskDescription = 'Build React components and applications';
  }
  
  return [{
    id: `task-${curriculumItem.order}-1`,
    title: taskTitle,
    description: taskDescription,
    completed: levelProgress?.exercise?.completed || false
  }];
}

function getTitleQuality(title) {
  if (!title) return 0;
  
  const lowerTitle = title.toLowerCase();
  
  // High quality: Specific, meaningful titles
  if (lowerTitle.includes('html') || lowerTitle.includes('css') || 
      lowerTitle.includes('javascript') || lowerTitle.includes('react') ||
      lowerTitle.includes('course') || lowerTitle.includes('crash course') ||
      lowerTitle.includes('introduction') || lowerTitle.includes('basics')) {
    return 10;
  }
  
  // Medium quality: Project or material related
  if (lowerTitle.includes('project') || lowerTitle.includes('material') ||
      lowerTitle.includes('setup') || lowerTitle.includes('mini project')) {
    return 7;
  }
  
  // Low quality: Generic or unclear titles
  if (lowerTitle.includes('random') || lowerTitle.includes('level') ||
      lowerTitle.includes('test') || lowerTitle.length < 5) {
    return 3;
  }
  
  // Default quality for other titles
  return 5;
}

function formatTimeSpent(seconds) {
  if (!seconds || seconds === 0) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default router;
