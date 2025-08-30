import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Attendance from '../models/Attendance.js';

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
    
    // Get real attendance data from Attendance model
    let attendanceStats = { totalDays: 0, presentDays: 0, currentStreak: 0, longestStreak: 0 };
    
    try {
      // Get attendance records for this student
      const attendanceRecords = await Attendance.find({ user: studentId }).sort({ date: 1 });
      
      if (attendanceRecords && attendanceRecords.length > 0) {
        // Calculate total days since enrollment
        const totalDays = Math.ceil((Date.now() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24));
        
        // Count present days from actual attendance records
        const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
        
        // Calculate current streak from attendance records
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        // Sort records by date (newest first) to calculate current streak
        const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        for (let i = 0; i < sortedRecords.length; i++) {
          const record = sortedRecords[i];
          if (record.status === 'present') {
            tempStreak++;
            if (i === 0) { // First record (most recent)
              currentStreak = tempStreak;
            }
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        
        attendanceStats = { totalDays, presentDays, currentStreak, longestStreak };
        
        console.log('Portfolio Controller - Real attendance stats from Attendance model:', attendanceStats);
        console.log('Portfolio Controller - Attendance records found:', attendanceRecords.length);
      } else {
        // No attendance records found, calculate based on enrollment time
        const totalDays = Math.ceil((Date.now() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24));
        attendanceStats = { 
          totalDays, 
          presentDays: 0, 
          currentStreak: 0, 
          longestStreak: 0 
        };
        
        console.log('Portfolio Controller - No attendance records found, using enrollment-based calculation');
      }
    } catch (error) {
      console.error('Portfolio Controller - Error fetching attendance data:', error);
      // Fallback to enrollment-based calculation
      const totalDays = Math.ceil((Date.now() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24));
      attendanceStats = { 
        totalDays, 
        presentDays: 0, 
        currentStreak: 0, 
        longestStreak: 0 
      };
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
      leaderboard: progress?.leaderboardRank || 80, // Default to 80 if no rank
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

    // Create portfolio data structure matching StudentDetails interface
    const portfolioData = {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        careerTrack: student.careerTrack || 'Full Stack Development',
        level: student.level || 'Beginner',
        progress: Math.round(performance.performance),
        status: 'active',
        lastActive: student.lastActive || new Date().toISOString(),
        totalPoints: progress?.totalPoints || 0,
        streakDays: attendanceStats.currentStreak,
        college: student.college || 'Tech University',
        department: student.courseDept || 'B.E IT',
        batch: student.batch || '2023-2027',
        isActive: true,
        createdAt: student.createdAt || new Date().toISOString(),
        updatedAt: student.updatedAt || new Date().toISOString(),
        currentStreak: attendanceStats.currentStreak,
        longestStreak: attendanceStats.longestStreak,
        attendancePercentage: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
        totalDays: attendanceStats.totalDays,
        presentDays: attendanceStats.presentDays,
        leaderboardScore: summaryStats.leaderboard || 80,
        enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN') : '21-03-2025',
        performance,
        summaryStats,
        learningTimeline: learningTimeline,
        dailyActivity: progress?.dailyActivity || [],
        attendanceStats,
        skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
        recommendedRoles: ['Frontend Developer', 'Full Stack Engineer', 'DevOps Engineer'],
        learningLevels: [
          {
            level: 3,
            courseName: 'Introduction to HTML',
            description: 'HTML Fundamentals',
            status: 'in-progress',
            learn: {
              completed: true,
              startTime: '10-08-2025 10:00 AM',
              endTime: '12-08-2025 11:00 AM'
            },
            test: {
              completed: true,
              score: 80,
              attempts: 2,
              startTime: '13-08-2025 02:00 PM',
              endTime: '13-08-2025 03:00 PM'
            },
            exercise: {
              completed: false,
              startTime: '14-08-2025 09:03 PM',
              endTime: 'In-Progress'
            }
          },
          {
            level: 2,
            courseName: 'Introduction to HTML',
            description: 'HTML Fundamentals',
            status: 'completed',
            learn: {
              completed: true,
              startTime: '05-08-2025 09:00 AM',
              endTime: '07-08-2025 10:00 AM'
            },
            test: {
              completed: true,
              score: 85,
              attempts: 2,
              startTime: '08-08-2025 01:00 PM',
              endTime: '08-08-2025 02:00 PM'
            },
            exercise: {
              completed: true,
              startTime: '09-08-2025 09:00 AM',
              endTime: '09-08-2025 10:00 AM'
            }
          },
          {
            level: 1,
            courseName: 'Introduction to HTML',
            description: 'HTML Fundamentals',
            status: 'completed',
            learn: {
              completed: true,
              startTime: '01-08-2025 09:00 AM',
              endTime: '03-08-2025 10:00 AM'
            },
            test: {
              completed: true,
              score: 90,
              attempts: 2,
              startTime: '04-08-2025 01:00 PM',
              endTime: '04-08-2025 02:00 PM'
            },
            exercise: {
              completed: true,
              startTime: '05-08-2025 09:00 AM',
              endTime: '05-08-2025 10:00 AM'
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
