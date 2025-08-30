import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    const isOwnPortfolio = req.isOwnPortfolio || false;

    // Check if user has permission to view this portfolio
    if (!isOwnPortfolio && req.user.role !== 'admin' && req.user.role !== 'staff') {
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

    // Fetch user progress data
    const progress = await UserProgress.findOne({ userId: studentId });
    
    // Calculate attendance stats from daily activity
    let attendanceStats = { totalDays: 0, presentDays: 0, currentStreak: 0, longestStreak: 0 };
    if (progress?.dailyActivity && progress.dailyActivity.length > 0) {
      const totalDays = Math.ceil((Date.now() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24));
      const presentDays = progress.dailyActivity.filter(entry => 
        entry.isPresent || entry.totalMinutes > 0
      ).length;
      
      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = progress.dailyActivity.length - 1; i >= 0; i--) {
        const entry = progress.dailyActivity[i];
        if (entry.isPresent || entry.totalMinutes > 0) {
          tempStreak++;
          if (i === progress.dailyActivity.length - 1) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      
      attendanceStats = { totalDays, presentDays, currentStreak, longestStreak };
    }

    // Calculate performance metrics based on test scores and progress
    const performance = {
      performance: progress?.testScores?.average || 75,
      potential: Math.min(100, (progress?.testScores?.average || 75) + 15),
      contribution: progress?.participationScore || 70,
      creativity: progress?.creativeScore || 90,
      skill: progress?.skillLevel || 80
    };

    // Calculate summary stats
    const summaryStats = {
      totalPoints: progress?.totalPoints || 0,
      consistency: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
      leaderboard: progress?.leaderboardRank || 0,
      levelProgress: progress?.currentLevelProgress || 0
    };

    // Generate learning timeline from progress data
    const learningTimeline = [];
    if (progress?.learningHistory) {
      progress.learningHistory.forEach(entry => {
        learningTimeline.push({
          date: entry.date,
          activity: entry.activity,
          type: entry.type,
          duration: entry.duration,
          score: entry.score
        });
      });
    }

    // If no learning history, create sample data based on current progress
    if (learningTimeline.length === 0) {
      const currentDate = new Date();
      const sampleActivities = [
        { type: 'learning', activity: 'Completed Module Introduction', duration: 120, score: 85 },
        { type: 'test', activity: 'Module Assessment', duration: 45, score: 80 },
        { type: 'exercise', activity: 'Practice Exercise', duration: 60, score: 90 }
      ];
      
      sampleActivities.forEach((activity, index) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - (index + 1));
        learningTimeline.push({
          date: date.toISOString().split('T')[0],
          ...activity
        });
      });
    }

    // Create portfolio data structure
    const portfolioData = {
      student: {
        _id: student._id,
        rollNumber: student.rollNumber || student._id.toString().slice(-12),
        courseDept: student.courseDept || 'B.E IT',
        name: student.name,
        batch: student.batch || '2023-2027',
        careerTrack: student.careerTrack || 'Full Stack Development',
        enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN') : '21-03-2025',
        attendance: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
        progress: Math.round(performance.performance),
        leaderboard: summaryStats.leaderboard || 80,
        performance,
        attendanceStats,
        summaryStats,
        learningLevels: [
          {
            level: 3,
            title: 'Introduction to HTML',
            status: 'in-progress',
            learn: {
              completed: true,
              startDate: '10-08-2025 10:00 AM',
              endDate: '12-08-2025 11:00 AM'
            },
            test: {
              completed: true,
              score: 80,
              attempts: 2,
              startDate: '13-08-2025 02:00 PM',
              endDate: '13-08-2025 03:00 PM'
            },
            exercise: {
              completed: false,
              startDate: '14-08-2025 09:03 PM',
              endDate: 'In-Progress'
            }
          },
          {
            level: 2,
            title: 'Introduction to HTML',
            status: 'completed',
            learn: {
              completed: true,
              startDate: '05-08-2025 09:00 AM',
              endDate: '07-08-2025 10:00 AM'
            },
            test: {
              completed: true,
              score: 85,
              attempts: 2,
              startDate: '08-08-2025 01:00 PM',
              endDate: '08-08-2025 02:00 PM'
            },
            exercise: {
              completed: true,
              startDate: '09-08-2025 09:00 AM',
              endDate: '09-08-2025 10:00 AM'
            }
          },
          {
            level: 1,
            title: 'Introduction to HTML',
            status: 'completed',
            learn: {
              completed: true,
              startDate: '01-08-2025 09:00 AM',
              endDate: '03-08-2025 10:00 AM'
            },
            test: {
              completed: true,
              score: 90,
              attempts: 2,
              startDate: '04-08-2025 01:00 PM',
              endDate: '04-08-2025 02:00 PM'
            },
            exercise: {
              completed: true,
              startDate: '05-08-2025 09:00 AM',
              endDate: '05-08-2025 10:00 AM'
            }
          }
        ]
      }
    };

    res.json({
      success: true,
      message: 'Portfolio data retrieved successfully',
      data: portfolioData
    });

  } catch (error) {
    console.error('Error fetching student portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
