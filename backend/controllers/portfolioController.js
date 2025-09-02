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
      );
      return Math.round((completedTasks.length / section.tasks.length) * 100);
    default:
      return 0;
  }
};

// Helper function to map exercise submission data
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

// Helper function to calculate level progress
const calculateLevelProgress = (level, completedSections, submissions) => {
  const sections = ['learn', 'test', 'exercise'];
  let totalProgress = 0;
  let activeSections = 0;

  sections.forEach(section => {
    if (level[section] && Array.isArray(level[section])) {
      activeSections++;
      totalProgress += calculateSectionProgress(
        { type: section, tasks: level[section] },
        completedSections,
        submissions
      );
    }
  });

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
          learn: [],
          test: [],
          exercise: []
        };
      }

      // Add item to appropriate section array
      switch (item.type) {
        case 'learn':
          levelGroups[levelKey].learn.push({
          id: item._id,
          title: item.title,
          description: item.description,
          content: item.content,
          externalLink: item.externalLink,
            order: item.order
        });
          break;
        case 'test':
          levelGroups[levelKey].test.push({
          id: item._id,
          title: item.title,
          question: item.content,
          options: item.options,
          answer: item.answer,
            order: item.order
        });
          break;
        case 'exercise':
          levelGroups[levelKey].exercise.push({
          id: item._id,
            title: item.title,
            description: item.description,
            content: item.content,
            order: item.order
          });
          break;
      }
    });

    // Calculate completion status for each level
    let completedLevels = 0;
    const totalLevels = Object.keys(levelGroups).length;
    const learningLevels = Object.values(levelGroups).map(level => {
      const levelProgress = progress?.completedLevels?.find(l => l.levelOrder === level.level);
      const completedSections = levelProgress?.completedSections || {};
      const exerciseSubmissions = levelProgress?.exerciseSubmissions || [];

      // Map learn section
      const learnSection = {
        completed: completedSections.learn || false,
        startTime: levelProgress?.learnProgress?.startTime || null,
        endTime: levelProgress?.learnProgress?.endTime || null,
        timeSpent: levelProgress?.learnProgress?.timeSpent || 0,
        content: level.learn,
        title: 'Learning Materials',
        status: completedSections.learn ? 'completed' : 'not-started',
        materials: level.learn.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          externalLink: item.externalLink,
          order: item.order,
          completed: levelProgress?.learnProgress?.linksAccessed?.includes(item.externalLink)
        }))
      };

      // Map test section
      const testSection = {
        completed: completedSections.test || false,
        score: levelProgress?.testProgress?.attempts?.slice(-1)[0]?.score || 0,
        attempts: levelProgress?.testProgress?.attempts?.length || 0,
        startTime: levelProgress?.testProgress?.startTime || null,
        endTime: levelProgress?.testProgress?.endTime || null,
        content: level.test,
        title: 'Assessment',
        status: completedSections.test ? 'completed' : 'not-started',
        questions: level.test.map(item => ({
          id: item.id,
          title: item.title,
          question: item.question,
          options: item.options,
          answer: item.answer,
          order: item.order
        }))
      };

      // Map exercise section with submission data
      const exerciseSection = {
        completed: completedSections.exercise || false,
        startTime: levelProgress?.exerciseProgress?.startTime || null,
        endTime: levelProgress?.exerciseProgress?.endTime || null,
        timeSpent: levelProgress?.exerciseProgress?.timeSpent || 0,
        content: level.exercise,
        title: 'Practice Exercise',
        status: completedSections.exercise ? 'completed' : 'not-started',
        tasks: level.exercise.map(task => {
          // Find all submissions for this task
          const taskSubmissions = exerciseSubmissions.filter(sub => sub.exerciseTitle === task.title);
          // Get the latest submission status and links
          const latestSubmission = taskSubmissions[taskSubmissions.length - 1];
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            content: task.content,
            order: task.order,
            completed: latestSubmission ? latestSubmission.status === 'approved' : false,
            submissionLinks: latestSubmission ? latestSubmission.links || [] : [],
            score: latestSubmission?.score || 0,
            attempts: taskSubmissions.length,
            lastAttemptAt: latestSubmission?.submittedAt || null,
            feedback: latestSubmission?.feedback || '',
            status: latestSubmission ? latestSubmission.status : 'not-submitted'
          };
        })
      };

      // Calculate overall level status
      let status = 'not-started';
      if (completedSections.learn && completedSections.test && completedSections.exercise) {
        status = 'completed';
        completedLevels++;
      } else if (completedSections.learn || completedSections.test || completedSections.exercise) {
        status = 'in-progress';
      }

      return {
        level: level.level,
        courseName: level.courseName,
        description: level.description,
        status,
        learn: learnSection,
        test: testSection,
        exercise: exerciseSection
      };
    });

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

    // Calculate actual total days since enrollment
    const enrollmentDate = new Date(student.createdAt);
    const today = new Date();
    const actualTotalDays = Math.ceil((today - enrollmentDate) / (1000 * 60 * 60 * 24));
    
    // Use the actual total days instead of just counting attendance records
    const correctedStats = {
      totalDays: Math.max(actualTotalDays, stats.totalDays),
      presentDays: stats.presentDays,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak
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
        totalDays: Math.max(correctedStats.totalDays || 0, 0),
        presentDays: Math.max(correctedStats.presentDays || 0, 0),
        percentage: Math.round((correctedStats.presentDays / Math.max(correctedStats.totalDays, 1)) * 100),
        currentStreak: Math.max(correctedStats.currentStreak || 0, 0),
        longestStreak: Math.max(correctedStats.longestStreak || 0, 0)
      },
      leaderboard: {
        score: Math.max(leaderboardData?.totalScore || 0, 0),
        rank: leaderboardData?.rank || null,
        breakdown: {
          progressScore: Math.max(leaderboardData?.progressScore || 0, 0),
          attendanceScore: Math.max(leaderboardData?.attendanceScore || 0, 0),
          consistencyScore: Math.max(leaderboardData?.consistencyScore || 0, 0),
          timeScore: Math.max(leaderboardData?.timeScore || 0, 0)
        }
      },
      learningLevels
    };

    res.status(200).json({
      success: true,
      data: portfolioData
    });

  } catch (error) {
    console.error('Get student portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};