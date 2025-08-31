import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Attendance from '../models/Attendance.js';
import Curriculum from '../models/Curriculum.js';
import LeaderboardService from '../services/leaderboardService.js';

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
    const progress = await UserProgress.findOne({ user: studentId });
    
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

    // Calculate real progress based on completed levels
    let realProgress = 0;
    let totalLevels = 10; // Default total levels
    
    // Debug: Log the progress object structure
    console.log('Portfolio Controller - Progress object:', {
      hasProgress: !!progress,
      completedLevels: progress?.completedLevels,
      completedLevelsLength: progress?.completedLevels?.length,
      currentLevel: progress?.currentLevel,
      totalPoints: progress?.totalPoints,
      careerTrack: progress?.careerTrack
    });
    
    // Try to get total levels from curriculum if we have career track
    if (progress?.careerTrack) {
      try {
        const curriculumCount = await Curriculum.countDocuments({ 
          careerTrack: progress.careerTrack,
          type: 'syllabus'
        });
        if (curriculumCount > 0) {
          totalLevels = curriculumCount;
          console.log('Portfolio Controller - Total levels from curriculum:', totalLevels);
        }
      } catch (error) {
        console.log('Portfolio Controller - Could not get curriculum count:', error.message);
      }
    }
    
    if (progress?.completedLevels && Array.isArray(progress.completedLevels) && progress.completedLevels.length > 0) {
      // Student has completed levels
      realProgress = Math.round((progress.completedLevels.length / totalLevels) * 100);
      console.log('Portfolio Controller - Progress based on completed levels:', { 
        completedLevels: progress.completedLevels.length, 
        totalLevels,
        realProgress 
      });
    } else {
      // If no completed levels, check if there's any progress data
      if (progress?.currentLevel && progress.currentLevel > 1) {
        // Student has started but not completed any levels
        realProgress = Math.round(((progress.currentLevel - 1) / totalLevels) * 100);
        console.log('Portfolio Controller - Progress based on current level:', { 
          currentLevel: progress.currentLevel, 
          totalLevels,
          realProgress 
        });
      } else if (progress?.totalPoints && progress.totalPoints > 0) {
        // Student has earned points but no level progress
        realProgress = Math.min(100, Math.round((progress.totalPoints / 1000) * 100)); // Assume 1000 points = 100%
        console.log('Portfolio Controller - Progress based on total points:', { totalPoints: progress.totalPoints, realProgress });
      } else {
        // No progress at all
        realProgress = 0;
        console.log('Portfolio Controller - No progress data found, setting to 0');
      }
    }
    
    // Use unified leaderboard service for consistent scoring
    let leaderboardData = null;
    if (progress?.careerTrack) {
      try {
        leaderboardData = await LeaderboardService.updateStudentScore(studentId, progress.careerTrack);
        console.log('Portfolio Controller - Leaderboard data from service:', leaderboardData);
      } catch (error) {
        console.log('Portfolio Controller - Could not get leaderboard data:', error.message);
      }
    }
    
    // Fallback to old calculation if leaderboard service fails
    if (!leaderboardData) {
      console.log('Portfolio Controller - Using fallback leaderboard calculation');
      if (progress || attendanceStats.presentDays > 0) {
        // Base score from progress (40% weight)
        const progressScore = realProgress;
        
        // Attendance score (30% weight)
        const attendanceScore = Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100);
        
        // Consistency/streak bonus (30% weight)
        let consistencyScore = 0;
        if (attendanceStats.currentStreak >= 2) {
          // Bonus for continuous attendance: 2+ days = 100%, 1 day = 50%
          consistencyScore = Math.min(100, attendanceStats.currentStreak * 25); // Cap at 100%
        } else if (attendanceStats.longestStreak >= 2) {
          // Use longest streak if current streak not available
          consistencyScore = Math.min(100, attendanceStats.longestStreak * 20); // Cap at 100%
        }
        
        // Calculate weighted leaderboard score
        const realLeaderboardScore = Math.round(
          (progressScore * 0.4) + 
          (attendanceScore * 0.3) + 
          (consistencyScore * 0.3)
        );
        
        leaderboardData = {
          totalScore: realLeaderboardScore,
          breakdown: {
            progressScore,
            attendanceScore,
            consistencyScore,
            timeScore: 0
          },
          rank: null
        };
      }
    }



    // Generate learning levels data from curriculum
    let learningLevelsData = [];
    if (progress?.careerTrack) {
      try {
        // Get curriculum items for this career track
        const curriculumItems = await Curriculum.find({ 
          careerTrack: progress.careerTrack,
          type: 'syllabus'
        }).sort({ order: 1 });
        
        if (curriculumItems && curriculumItems.length > 0) {
          learningLevelsData = curriculumItems.map(item => {
            const levelProgress = progress.completedLevels.find(l => l.levelId === item._id.toString());
            return {
              level: item.order,
              courseName: item.title,
              description: item.description,
              status: levelProgress ? 'completed' : progress?.currentLevel === item.order ? 'in-progress' : 'not-started',
              learn: {
                completed: levelProgress?.completedSections?.learn || false,
                startTime: levelProgress?.learnProgress?.startTime || null,
                endTime: levelProgress?.learnProgress?.endTime || null,
                timeSpent: levelProgress?.learnProgress?.timeSpent || 0,
                content: item.learn || []
              },
              test: {
                completed: levelProgress?.completedSections?.test || false,
                score: levelProgress?.testProgress?.attempts?.[0]?.score || 0,
                attempts: levelProgress?.testProgress?.attempts?.length || 0,
                startTime: levelProgress?.testProgress?.lastAttemptAt || null,
                content: item.test || []
              },
              exercise: {
                completed: levelProgress?.completedSections?.exercise || false,
                startTime: levelProgress?.exerciseSubmissions?.[0]?.submittedAt || null,
                timeSpent: levelProgress?.exerciseSubmissions?.[0]?.timeSpent || 0,
                content: item.exercise || []
              }
            };
          });
        }
      } catch (error) {
        console.log('Portfolio Controller - Could not get curriculum items:', error.message);
      }
    }

    // Build comprehensive response
    const portfolioData = {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        careerTrack: student.careerTrack,
        college: student.college,
        department: student.department,
        createdAt: student.createdAt
      },
      progress: {
        currentLevel: progress?.currentLevel || 1,
        completedLevels: progress?.completedLevels?.length || 0,
        totalLevels: totalLevels,
        percentage: realProgress,
        totalPoints: progress?.totalPoints || 0
      },
      attendance: {
        totalDays: attendanceStats.totalDays,
        presentDays: attendanceStats.presentDays,
        percentage: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
        currentStreak: attendanceStats.currentStreak,
        longestStreak: attendanceStats.longestStreak
      },
      leaderboard: {
        score: leaderboardData?.totalScore || 0,
        rank: leaderboardData?.rank || null,
        breakdown: leaderboardData?.breakdown || {
          progressScore: 0,
          attendanceScore: 0,
          consistencyScore: 0,
          timeScore: 0
        }
      },
      learningLevels: learningLevelsData
    };

    res.status(200).json({
      success: true,
      data: portfolioData,
      message: 'Portfolio retrieved successfully'
    });

  } catch (error) {
    console.error('Portfolio Controller - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
