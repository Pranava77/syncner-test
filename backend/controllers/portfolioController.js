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
    submissionLink: submission?.links?.[0] || null,
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

  if (level.learn) {
    totalProgress += calculateSectionProgress('learn', completedSections);
  }
  if (level.test) {
    totalProgress += calculateSectionProgress('test', completedSections);
  }
  if (level.exercise) {
    totalProgress += calculateSectionProgress('exercise', completedSections, submissions);
  }

  const activeSections = sections.filter(section => level[section]).length;
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
          id: item._id.toString(),
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

      // Map items based on their type
      switch (item.type) {
        case 'learn':
          levelGroups[levelKey].learn.materials.push({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            content: item.content,
            externalLink: item.externalLink,
            order: item.order,
            completed: false
          });
          break;
        case 'test':
          levelGroups[levelKey].test.questions.push({
            id: item._id.toString(),
            title: item.title,
            question: item.content,
            order: item.order,
            completed: false
          });
          break;
        case 'exercise':
          levelGroups[levelKey].exercise.tasks.push({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            content: item.content,
            order: item.order,
            completed: false
          });
          break;
      }
    });

    // Update level groups with user progress
    if (progress?.completedLevels) {
      progress.completedLevels.forEach(completedLevel => {
        const level = levelGroups[completedLevel.levelOrder];
        if (level) {
          // Update learn section
          level.learn = {
            ...level.learn,
            completed: completedLevel.completedSections?.learn || false,
            timeSpent: completedLevel.learnProgress?.timeSpent || 0,
            startTime: completedLevel.learnProgress?.startTime,
            endTime: completedLevel.learnProgress?.endTime,
            materials: level.learn.materials.map(material => ({
              ...material,
              completed: completedLevel.learnProgress?.linksAccessed?.includes(material.externalLink) || false
            }))
          };

          // Update test section
          level.test = {
            ...level.test,
            completed: completedLevel.completedSections?.test || false,
            score: completedLevel.testProgress?.attempts?.length > 0 
              ? Math.max(...completedLevel.testProgress.attempts.map(a => a.score))
              : 0,
            attempts: completedLevel.testProgress?.attempts?.length || 0,
            startTime: completedLevel.testProgress?.attempts?.[0]?.completedAt,
            endTime: completedLevel.testProgress?.lastAttemptAt,
            questions: level.test.questions.map(question => ({
              ...question,
              completed: completedLevel.testProgress?.attempts?.some(attempt => 
                attempt.answers?.some(answer => answer.questionIndex === question.order)
              ) || false
            }))
          };

          // Update exercise section
          level.exercise = {
            ...level.exercise,
            completed: completedLevel.completedSections?.exercise || false,
            timeSpent: completedLevel.exerciseProgress?.timeSpent || 0,
            startTime: completedLevel.exerciseProgress?.startTime,
            endTime: completedLevel.exerciseProgress?.endTime,
            tasks: level.exercise.tasks.map(task => 
              mapExerciseSubmission(task, completedLevel.exerciseSubmissions)
            )
          };

          // Calculate level status
          const levelProgress = calculateLevelProgress(
            level,
            completedLevel.completedSections,
            completedLevel.exerciseSubmissions
          );
          level.status = levelProgress === 100 ? 'completed' 
            : levelProgress > 0 ? 'in-progress' 
            : 'not-started';
        }
      });
    }

    // Convert level groups to array and sort by order
    const learningLevels = Object.values(levelGroups).sort((a, b) => a.level - b.level);

    // Calculate overall progress
    const totalLevels = learningLevels.length;
    const completedLevels = learningLevels.filter(level => level.status === 'completed').length;
    const inProgressLevels = learningLevels.filter(level => level.status === 'in-progress').length;
    
    const progressPercentage = Math.round(
      ((completedLevels + (inProgressLevels * 0.5)) / totalLevels) * 100
    );

    // Fetch attendance stats
    const attendanceStats = progress?.attendanceStats || {
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
        completedLevels: completedLevels,
        totalLevels: totalLevels,
        percentage: progressPercentage,
        totalPoints: Math.max(progress?.totalPoints || 0, 0)
      },
      attendance: {
        totalDays: Math.max(attendanceStats.totalDays || 0, 0),
        presentDays: Math.max(attendanceStats.presentDays || 0, 0),
        percentage: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
        currentStreak: Math.max(attendanceStats.currentStreak || 0, 0),
        longestStreak: Math.max(attendanceStats.longestStreak || 0, 0)
      },
      leaderboard: {
        score: Math.max(leaderboardData?.totalScore || 0, 0),
        rank: leaderboardData?.rank || null,
        breakdown: {
          progressScore: progressPercentage,
          attendanceScore: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
          consistencyScore: Math.round((attendanceStats.currentStreak / 30) * 100), // Assuming 30 days as max streak
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
      message: 'Error retrieving portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};