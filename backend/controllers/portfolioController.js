import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Attendance from '../models/Attendance.js';
import Curriculum from '../models/Curriculum.js';
import LeaderboardService from '../services/leaderboardService.js';

// Helper function to calculate section progress
const calculateSectionProgress = (section, completedSections, submissions = []) => {
  if (!section || !Array.isArray(section)) return 0;
  
  switch (section.type) {
    case 'learn':
      return completedSections?.learn ? 100 : 0;
    case 'test':
      return completedSections?.test ? 100 : 0;
    case 'exercise':
      if (!section.tasks || !Array.isArray(section.tasks)) return 0;
      const completedTasks = section.tasks.filter(task => 
        submissions.some(sub => 
          sub.exerciseTitle === task.title && 
          ['approved', 'submitted'].includes(sub.status)
        )
      ).length;
      return (completedTasks / section.tasks.length) * 100;
    default:
      return 0;
  }
};

// Helper function to map exercise submission details
const mapExerciseSubmission = (task, submissions = []) => {
  const submission = submissions.find(sub => sub.exerciseTitle === task.title);
  return {
    ...task,
    completed: submission?.status === 'approved',
    submissionLinks: submission?.links || [], // Return all links
    score: submission?.score || 0,
    attempts: submission?.attempts || 0,
    lastAttemptAt: submission?.submittedAt || null,
    feedback: submission?.feedback || '',
    status: submission ? submission.status : 'not-submitted'
  };
};

// Helper function to calculate overall level progress
const calculateLevelProgress = (level, completedSections, submissions) => {
  const sections = ['learn', 'test', 'exercise'];
  let totalProgress = 0;
  let activeSections = 0;

  if (level.learn) {
    totalProgress += calculateSectionProgress('learn', completedSections);
    activeSections++;
  }
  if (level.test) {
    totalProgress += calculateSectionProgress('test', completedSections);
    activeSections++;
  }
  if (level.exercise) {
    totalProgress += calculateSectionProgress('exercise', completedSections, submissions);
    activeSections++;
  }

  return activeSections > 0 ? totalProgress / activeSections : 0;
};

export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided'
      });
    }

    // Check if user has permission to view this portfolio
    const isOwnPortfolio = req.user._id.toString() === studentId.toString();
    const isStaffOrAdmin = req.user.role === 'admin' || req.user.role === 'staff';
    
    if (!isOwnPortfolio && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can view their own portfolio, and staff/admin can view any portfolio.'
      });
    }

    // Fetch student data
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Fetch user progress data with populated completedLevels
    const progress = await UserProgress.findOne({ user: studentId })
      .populate({
        path: 'completedLevels.levelId',
        model: 'Curriculum',
        select: 'order title description type content options answer externalLink'
      })
      .lean();

    // Fetch all curriculum items for the career track
    const curriculumItems = await Curriculum.find({
      careerTrack: student.careerTrack,
      isActive: true
    }).sort({ order: 'asc' }).lean();

    // Group curriculum items by level
    const levelGroups = {};
    curriculumItems.forEach(item => {
      const levelKey = item.order;
      if (!levelGroups[levelKey]) {
        levelGroups[levelKey] = {
          level: item.order,
          courseName: item.title,
          description: item.description,
          status: 'not-started',
          learn: {
            completed: false,
            timeSpent: 0,
            materials: []
          },
          test: {
            completed: false,
            score: 0,
            attempts: 0,
            questions: []
          },
          exercise: {
            completed: false,
            timeSpent: 0,
            tasks: []
          }
        };
      }

      // Add item to appropriate section
      switch (item.type) {
        case 'learn':
          levelGroups[levelKey].learn.materials.push({
            id: item._id,
            title: item.title,
            description: item.description,
            content: item.content,
            externalLink: item.externalLink
          });
          break;
        case 'test':
          levelGroups[levelKey].test.questions.push({
            id: item._id,
            title: item.title,
            question: item.content,
            options: item.options,
            answer: item.answer
          });
          break;
        case 'exercise':
          levelGroups[levelKey].exercise.tasks.push({
            id: item._id,
            title: item.title,
            description: item.description,
            content: item.content
          });
          break;
      }
    });

    // Calculate progress and merge with user progress data
    const learningLevels = Object.values(levelGroups).map(level => {
      const userLevel = progress?.completedLevels?.find(l => l.levelOrder === level.level);
      
      if (userLevel) {
        // Update level status
        level.status = userLevel.completedSections.exercise ? 'completed' :
                      userLevel.completedSections.learn || userLevel.completedSections.test ? 'in-progress' :
                      'not-started';

        // Update learn section
        if (userLevel.learnProgress) {
          level.learn.completed = userLevel.completedSections.learn;
          level.learn.timeSpent = userLevel.learnProgress.timeSpent;
          level.learn.materials = level.learn.materials.map(material => ({
            ...material,
            completed: userLevel.learnProgress.linksAccessed.includes(material.externalLink)
          }));
        }

        // Update test section
        if (userLevel.testProgress) {
          level.test.completed = userLevel.completedSections.test;
          level.test.score = userLevel.testProgress.attempts.length > 0 
            ? Math.max(...userLevel.testProgress.attempts.map(a => a.score))
            : 0;
          level.test.attempts = userLevel.testProgress.attempts.length;
        }

        // Update exercise section with all submission links
        if (userLevel.exerciseSubmissions) {
          level.exercise.completed = userLevel.completedSections.exercise;
          level.exercise.tasks = level.exercise.tasks.map(task => 
            mapExerciseSubmission(task, userLevel.exerciseSubmissions)
          );
        }
      }

      return level;
    });

    // Calculate completion stats
    const completedLevels = learningLevels.filter(level => level.status === 'completed').length;
    const totalLevels = learningLevels.length;
    const progressPercentage = Math.round((completedLevels / totalLevels) * 100);

    // Get attendance stats
    const attendanceStats = await Attendance.aggregate([
      { $match: { user: student._id } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          currentStreak: { $max: '$currentStreak' },
          longestStreak: { $max: '$longestStreak' }
        }
      }
    ]).exec();

    const stats = attendanceStats[0] || {
      totalDays: 0,
      presentDays: 0,
      currentStreak: 0,
      longestStreak: 0
    };

    // Get leaderboard data
    const leaderboardData = await LeaderboardService.getStudentRank(studentId, student.careerTrack);

    // Build the response
    const portfolioData = {
      student: {
        _id: student._id,
        name: student.name || 'Unknown',
        email: student.email || 'No email',
        careerTrack: student.careerTrack,
        college: student.college || 'Not specified',
        department: student.department || 'Not specified',
        createdAt: student.createdAt || new Date(),
        introduction: student.introduction || null,
        readyToHire: student.readyToHire || false,
        duration: student.duration || '6 months'
      },
      progress: {
        currentLevel: Math.max(progress?.currentLevel || 1, 1),
        completedLevels,
        totalLevels,
        percentage: progressPercentage,
        totalPoints: Math.max(progress?.totalPoints || 0, 0)
      },
      attendance: {
        totalDays: Math.max(stats.totalDays || 0, 0),
        presentDays: Math.max(stats.presentDays || 0, 0),
        percentage: Math.round((stats.presentDays / Math.max(stats.totalDays, 1)) * 100),
        currentStreak: Math.max(stats.currentStreak || 0, 0),
        longestStreak: Math.max(stats.longestStreak || 0, 0)
      },
      leaderboard: {
        score: Math.max(leaderboardData?.totalScore || 0, 0),
        rank: leaderboardData?.rank || null,
        breakdown: {
          progressScore: progressPercentage,
          attendanceScore: Math.round((stats.presentDays / Math.max(stats.totalDays, 1)) * 100),
          consistencyScore: Math.round((stats.currentStreak / 30) * 100), // Assuming 30 days as max streak
          timeScore: Math.round((progress?.totalPoints || 0) / 100) // Normalize points to percentage
        }
      },
      learningLevels
    };

    res.status(200).json({
      success: true,
      data: portfolioData,
      message: 'Portfolio retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getStudentPortfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};