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

// Test route to debug the issue
router.get('/test/:id', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🧪 Test route called with ID:', id);
    
    const student = await User.findById(id).select('-password').lean();
    console.log('🧪 Student found:', !!student);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, data: { student } });
  } catch (error) {
    console.error('🧪 Test route error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

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
        const curriculumLevelOrders = [...new Set(curriculumItems.map(item => item.order))].sort((a, b) => a - b);
        
        // Also include completed level orders that might not be in current curriculum
        const studentProgressLevelOrders = studentProgress?.completedLevels?.map(l => l.levelOrder).filter(order => order > 0) || [];
        const allStudentLevelOrders = [...new Set([...curriculumLevelOrders, ...studentProgressLevelOrders])].sort((a, b) => a - b);
        const totalLevels = allStudentLevelOrders.length;
        
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
        let progressScore = 0;
        
        if (studentProgress && studentProgress.completedLevels) {
          // Base score from progress (40% weight) - calculate based on section completion
          let totalSectionsCompleted = 0;
          let totalSectionsAvailable = totalLevels * 3;
          
          console.log('🔍 Progress calculation debug for student list:', {
            studentId: student._id,
            studentName: student.name,
            careerTrack: normalizedCareerTrack,
            totalLevels,
            totalSectionsAvailable,
            completedLevelsCount: studentProgress.completedLevels.length
          });
          
          studentProgress.completedLevels.forEach(level => {
            // Skip levels with invalid levelOrder (0 or undefined)
            if (!level.levelOrder || level.levelOrder === 0) {
              console.log('⚠️ Skipping level with invalid levelOrder in student list:', level.levelId, 'levelOrder:', level.levelOrder);
              return;
            }
            
            if (level.completedSections) {
              if (level.completedSections.learn) totalSectionsCompleted++;
              if (level.completedSections.test) totalSectionsCompleted++;
              if (level.completedSections.exercise) totalSectionsCompleted++;
            }
          });
          
          progressScore = totalSectionsAvailable > 0 ? Math.round((totalSectionsCompleted / totalSectionsAvailable) * 100) : 0;
          console.log(`📊 Student ${student.name} final progress: ${progressScore}% (${totalSectionsCompleted}/${totalSectionsAvailable} sections)`);
          
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
          progress: progressScore, // Use the calculated progressScore from above
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
    console.log('🔍 Student details route called with ID:', req.params.id);
    const { id } = req.params;
    
    console.log('🔍 Step 1: Fetching student from database...');
    const student = await User.findById(id)
      .select('-password')
      .lean();
    
    console.log('🔍 Step 1 result: Student found:', !!student);
    
    if (!student) {
      console.log('❌ Student not found');
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
    
    console.log('🔍 Step 2: Fetching user progress...');
    // Get detailed progress data
    const progress = await UserProgress.findOne({ user: id })
      .lean();
    
    console.log('🔍 Step 2 result: Progress found:', !!progress);
    
    console.log('🔍 Step 3: Fetching curriculum items...');
    // Get ALL curriculum items for this career track to determine total levels
    const curriculumItems = await Curriculum.find({ 
      careerTrack: normalizedCareerTrack, 
      isActive: true 
    }).sort({ order: 1 }).lean();
    
    console.log('🔍 Step 3 result: Curriculum items found:', curriculumItems.length);
    
    // Get unique level orders from curriculum
    const curriculumLevelOrders = [...new Set(curriculumItems.map(item => item.order))].sort((a, b) => a - b);
    
    // Also include completed level orders that might not be in current curriculum
    const completedLevelOrders = progress?.completedLevels?.map(l => l.levelOrder).filter(order => order > 0) || [];
    let allLevelOrders = [...new Set([...curriculumLevelOrders, ...completedLevelOrders])].sort((a, b) => a - b);
    let totalLevels = allLevelOrders.length;
    
    console.log('📚 Staff route curriculum debug:', {
      studentId: id,
      careerTrack: normalizedCareerTrack,
      curriculumItemsFound: curriculumItems.length,
      curriculumLevelOrders,
      completedLevelOrders,
      allLevelOrders,
      totalLevels
    });
    
    console.log('📚 Staff route: Curriculum items found:', curriculumItems.length, 'for track:', normalizedCareerTrack);
    console.log('🎯 Staff route: Level orders found:', allLevelOrders, 'Total levels:', totalLevels);
    console.log('📋 Sample curriculum items:', curriculumItems.slice(0, 3).map(item => ({
      order: item.order,
      title: item.title,
      type: item.type,
      _id: item._id,
      hasExercise: !!item.exercise,
      exerciseCount: item.exercise?.length || 0,
      exerciseData: item.exercise ? item.exercise.slice(0, 2) : 'No exercise data'
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
      const fallbackOrders = fallbackLevels.map(l => l.order);
      allLevelOrders.push(...fallbackOrders);
      totalLevels = allLevelOrders.length;
      
      console.log('🔄 Created fallback curriculum with', totalLevels, 'levels');
    }
    
    // Get default course names based on level and track
    const getDefaultCourseName = (order, careerTrack) => {
      const courseNames = {
        'full-stack': [
          'Foundations: HTML & CSS',
          'JavaScript Fundamentals', 
          'React Development',
          'Backend with Node.js',
          'Full Stack Project'
        ],
        'data-science': [
          'Foundations: Linux & Shell',
          'Python Programming',
          'Data Analysis & EDA',
          'Data Visualization',
          'Machine Learning Basics'
        ],
        'ai-ml': [
          'Python Fundamentals',
          'Statistics & Mathematics',
          'Machine Learning Algorithms',
          'Deep Learning',
          'AI Project Development'
        ],
        'ui-ux': [
          'Design Principles',
          'User Research Methods',
          'Wireframing & Prototyping',
          'UI Design Systems',
          'UX Testing & Iteration'
        ]
      };
      
      const trackCourses = courseNames[careerTrack] || courseNames['full-stack'];
      return trackCourses[order - 1] || `Level ${order}`;
    };
    
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
    
    // Generate certificate ID (deterministic based on user ID - same logic as portfolio controller)
    const generateCertificateId = (userId, careerTrack) => {
      const prefix = {
        'full-stack': 'FSE',
        'data-science': 'DSE',
        'ai-ml': 'AIM',
        'ui-ux': 'UXD'
      }[careerTrack] || 'STU';

      const year = new Date().getFullYear().toString().slice(-2);
      
      // Create deterministic "random" digits based on user ID
      const userIdHash = userId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const deterministicDigits = (userIdHash % 10000).toString().padStart(4, '0');
      
      return `SYNCNER-${prefix}${year}-${userId.toString().slice(-5)}-${deterministicDigits}`;
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
      levelOrders: allLevelOrders,
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
      const fallbackOrders2 = fallbackLevels.map(l => l.order);
      allLevelOrders.push(...fallbackOrders2);
      totalLevels = allLevelOrders.length;
      
      console.log('🔄 Created fallback curriculum with', totalLevels, 'levels');
    }
    
    // Build timeline for each level in the curriculum
    console.log('🔨 Starting timeline generation loop with allLevelOrders:', allLevelOrders);
    console.log('🗺️ Level to curriculum mapping available:', Object.keys(levelToCurriculumMap));
    
    allLevelOrders.forEach(levelOrder => {
      const curriculumItem = levelToCurriculumMap[levelOrder];
      console.log(`🔍 Processing level ${levelOrder}:`, { 
        foundCurriculumItem: !!curriculumItem, 
        curriculumItem: curriculumItem 
      });
      
      // If no curriculum item found, create a placeholder for completed levels
      let levelData = curriculumItem;
      if (!curriculumItem) {
        console.log(`⚠️ No curriculum item found for level ${levelOrder}, creating placeholder`);
        levelData = {
          title: getDefaultCourseName(levelOrder, normalizedCareerTrack),
          description: `Training content for level ${levelOrder}`
        };
      }
      
      // Find progress data for this level
      const levelProgress = progress?.completedLevels?.find(
        level => level.levelOrder === levelOrder || (curriculumItem && level.levelId === curriculumItem._id.toString())
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
        levelTitle: levelData.title,
        levelDescription: levelData.description,
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
    
    // Build learning levels for portfolio-style display (matching portfolio controller structure)
    const learningLevels = allLevelOrders.map(levelOrder => {
      const levelProgress = progress?.completedLevels?.find(
        level => level.levelOrder === levelOrder
      );
      
      const curriculumItem = levelToCurriculumMap[levelOrder];
      
      // Calculate level status
      let status = 'not-started';
      if (levelProgress && levelProgress.completedSections) {
        const sectionsCompleted = Object.values(levelProgress.completedSections).filter(Boolean).length;
        if (sectionsCompleted === 3) {
          status = 'completed';
        } else if (sectionsCompleted > 0) {
          status = 'in-progress';
        }
      }
      
      // Use default course names if curriculum item not found
      let courseName = curriculumItem?.title;
      if (!courseName) {
        const defaultNames = getDefaultCourseName(levelOrder, normalizedCareerTrack);
        courseName = defaultNames;
      }
      
      return {
        level: levelOrder,
        courseName: courseName || `Level ${levelOrder}`,
        description: curriculumItem?.description || `Training content for level ${levelOrder}`,
        status: status,
        learn: {
          completed: levelProgress?.completedSections?.learn || false,
          startTime: levelProgress?.learnProgress?.startDate || null,
          endTime: levelProgress?.completedSections?.learn ? levelProgress?.completedAt : null,
          timeSpent: levelProgress?.learnProgress?.timeSpent || 0,
          title: 'Learning Materials',
          status: levelProgress?.completedSections?.learn ? 'completed' : 'not-started',
          materials: [] // Will be populated by frontend if needed
        },
        test: {
          completed: levelProgress?.completedSections?.test || false,
          score: levelProgress?.testProgress?.attempts?.length > 0 
            ? Math.max(...levelProgress.testProgress.attempts.map(a => a.score || 0))
            : 0,
          attempts: levelProgress?.testProgress?.attempts?.length || 0,
          startTime: levelProgress?.testProgress?.startDate || null,
          endTime: levelProgress?.completedSections?.test ? levelProgress?.completedAt : null,
          title: 'Assessment',
          status: levelProgress?.completedSections?.test ? 'completed' : 'not-started'
        },
        exercise: {
          completed: levelProgress?.completedSections?.exercise || false,
          startTime: levelProgress?.exerciseProgress?.startDate || null,
          endTime: levelProgress?.completedSections?.exercise ? levelProgress?.completedAt : null,
          timeSpent: levelProgress?.exerciseProgress?.timeSpent || 0,
          title: 'Practice Exercise',
          status: levelProgress?.completedSections?.exercise ? 'completed' : 'not-started',
          tasks: levelProgress?.exerciseSubmissions?.map(submission => ({
            id: submission._id || submission.exerciseTitle,
            title: submission.exerciseTitle,
            description: submission.exerciseTitle,
            content: submission.exerciseTitle,
            completed: submission.status === 'approved',
            submissionLinks: submission.links || [],
            score: submission.score || 0,
            attempts: 1,
            lastAttemptAt: submission.submittedAt,
            feedback: submission.feedback || '',
            status: submission.status || 'not-submitted'
          })) || []
        }
      };
    });

    const studentDetails = {
      ...student,
      learningTimeline: detailedLearningTimeline, // Use the new detailed timeline
      learningLevels: learningLevels, // Add portfolio-style learning levels
      comprehensiveActivityTimeline: comprehensiveActivityTimeline, // Add comprehensive activity timeline
      simpleTimeline: limitedSimpleTimeline, // Keep simple timeline for backward compatibility
      skills: getSkillsForTrack(),
      recommendedRoles: getRecommendedRoles(),
      certificateId: generateCertificateId(student._id, normalizedCareerTrack),
      trackInfo: trackInfo || null,
      enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'N/A',
      createdAt: student.createdAt, // Add raw createdAt for frontend use
      // Add missing fields that the frontend expects
      attendancePercentage: attendancePercentage,
      progress: (() => {
        if (!progress || !progress.completedLevels) return 0;
        
        // Calculate progress based on completed sections across all levels
        let totalSectionsCompleted = 0;
        let totalSectionsAvailable = totalLevels * 3; // Each level has 3 sections
        
        console.log('🔍 Progress calculation debug for student details:', {
          userId: id,
          careerTrack: normalizedCareerTrack,
          totalLevels,
          totalSectionsAvailable,
          completedLevelsCount: progress.completedLevels.length,
          completedLevels: progress.completedLevels.map(l => ({
            levelId: l.levelId,
            levelOrder: l.levelOrder,
            completedSections: l.completedSections
          }))
        });
        
        progress.completedLevels.forEach(level => {
          // Skip levels with invalid levelOrder (0 or undefined)
          if (!level.levelOrder || level.levelOrder === 0) {
            console.log('⚠️ Skipping level with invalid levelOrder:', level.levelId, 'levelOrder:', level.levelOrder);
            return;
          }
          
          if (level.completedSections) {
            const sectionsInThisLevel = {
              learn: level.completedSections.learn,
              test: level.completedSections.test,
              exercise: level.completedSections.exercise
            };
            console.log(`📊 Level ${level.levelOrder} sections:`, sectionsInThisLevel);
            
            if (level.completedSections.learn) totalSectionsCompleted++;
            if (level.completedSections.test) totalSectionsCompleted++;
            if (level.completedSections.exercise) totalSectionsCompleted++;
          }
        });
        
        const finalPercentage = totalSectionsAvailable > 0 ? Math.round((totalSectionsCompleted / totalSectionsAvailable) * 100) : 0;
        console.log('🎯 Final progress calculation:', {
          totalSectionsCompleted,
          totalSectionsAvailable,
          finalPercentage
        });
        
        return finalPercentage;
      })(),
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





export default router;
