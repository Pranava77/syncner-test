import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Attendance from '../models/Attendance.js';
import Curriculum from '../models/Curriculum.js';

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
        
        // Log progress and leaderboard calculations
        console.log('Portfolio Controller - Progress calculation:', {
          completedLevels: progress?.completedLevels?.length || 0,
          totalLevels,
          realProgress
        });
        
        console.log('Portfolio Controller - Leaderboard calculation:', {
          progressScore: realProgress,
          attendanceScore: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
          consistencyScore: attendanceStats.currentStreak >= 2 ? Math.min(100, attendanceStats.currentStreak * 25) : 
                           attendanceStats.longestStreak >= 2 ? Math.min(100, attendanceStats.longestStreak * 20) : 0,
          finalScore: realLeaderboardScore
        });
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

        const curriculumItems = await Curriculum.find({ 
          careerTrack: progress.careerTrack,
          type: 'syllabus' // Get only syllabus items (main levels)
        }).sort({ order: 1 });
        
        if (curriculumItems && curriculumItems.length > 0) {
          totalLevels = curriculumItems.length;
          console.log('Portfolio Controller - Found curriculum levels:', { careerTrack: progress.careerTrack, totalLevels });
        }
      } catch (error) {
        console.log('Portfolio Controller - Could not fetch curriculum, using default:', error.message);
      }
    }
    
    if (progress?.completedLevels && Array.isArray(progress.completedLevels) && progress.completedLevels.length > 0) {
      // Calculate progress based on completed levels vs total curriculum levels
      realProgress = Math.round((progress.completedLevels.length / totalLevels) * 100);
      console.log('Portfolio Controller - Progress calculation successful:', { 
        completedLevels: progress.completedLevels.length, 
        totalLevels, 
        realProgress,
        careerTrack: progress.careerTrack 
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
    
    // Calculate real leaderboard score using the same formula as staff routes
    let realLeaderboardScore = 0;
    let leaderboardRank = 0;
    
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
      realLeaderboardScore = Math.round(
        (progressScore * 0.4) + 
        (attendanceScore * 0.3) + 
        (consistencyScore * 0.3)
      );
      
      // Try to get actual leaderboard ranking if we have career track
      if (progress?.careerTrack) {
        try {
          
          const allStudentsInTrack = await UserProgress.find({ 
            careerTrack: progress.careerTrack 
          }).populate('user', 'name email');
          
          if (allStudentsInTrack && allStudentsInTrack.length > 0) {
            // Calculate scores for all students in the track
            const studentScores = allStudentsInTrack.map(student => {
              let studentProgress = 0;
              let studentAttendance = 0;
              let studentConsistency = 0;
              
              // Calculate student progress
              if (student.completedLevels && student.completedLevels.length > 0) {
                studentProgress = Math.round((student.completedLevels.length / totalLevels) * 100);
              }
              
              // Calculate student attendance (simplified)
              if (student.attendanceStats?.presentDays) {
                studentAttendance = Math.round((student.attendanceStats.presentDays / Math.max(student.attendanceStats.totalDays, 1)) * 100);
              }
              
              // Calculate student consistency
              if (student.attendanceStats?.currentStreak >= 2) {
                studentConsistency = Math.min(100, student.attendanceStats.currentStreak * 25);
              } else if (student.attendanceStats?.longestStreak >= 2) {
                studentConsistency = Math.min(100, student.attendanceStats.longestStreak * 20);
              }
              
              const totalScore = Math.round(
                (studentProgress * 0.4) + 
                (studentAttendance * 0.3) + 
                (studentConsistency * 0.3)
              );
              
              return {
                userId: student.user._id,
                name: student.user.name,
                score: totalScore
              };
            });
            
            // Sort by score and find rank
            studentScores.sort((a, b) => b.score - a.score);
            const currentStudentRank = studentScores.findIndex(student => student.userId.toString() === studentId) + 1;
            
            if (currentStudentRank > 0) {
              leaderboardRank = currentStudentRank;
              console.log('Portfolio Controller - Leaderboard ranking calculated:', { 
                totalStudents: studentScores.length, 
                rank: leaderboardRank,
                topScore: studentScores[0]?.score,
                currentScore: realLeaderboardScore
              });
            }
          }
        } catch (error) {
          console.log('Portfolio Controller - Could not calculate leaderboard ranking:', error.message);
        }
      }
      
      console.log('Portfolio Controller - Leaderboard calculation:', {
        progressScore,
        attendanceScore,
        consistencyScore,
        finalScore: realLeaderboardScore,
        rank: leaderboardRank || 'N/A'
      });
    } else {
      console.log('Portfolio Controller - No progress or attendance data for leaderboard calculation');
    }
    
    // Calculate performance metrics based on test scores and progress
    const performance = {
      performance: progress?.testScores?.average || realProgress,
      potential: Math.min(100, (progress?.testScores?.average || realProgress) + 15),
      contribution: progress?.participationScore || attendanceStats.presentDays,
      creativity: progress?.creativeScore || realProgress,
      skill: progress?.skillLevel || realProgress
    };

    // Calculate summary stats with real data
    const summaryStats = {
      totalPoints: progress?.totalPoints || 0,
      consistency: Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
      leaderboard: realLeaderboardScore,
      levelProgress: realProgress
    };

    // Generate learning timeline from progress data
    const learningTimeline = [];
    
    // Check if we have completed levels to create timeline
    if (progress?.completedLevels && Array.isArray(progress.completedLevels) && progress.completedLevels.length > 0) {
      progress.completedLevels.forEach(level => {
        if (level.completedAt) {
          learningTimeline.push({
            date: level.completedAt.toISOString().split('T')[0],
            activity: `Completed Level ${level.levelOrder}`,
            type: 'learning',
            duration: level.learnProgress?.timeSpent || 0,
            score: level.testProgress?.attempts?.[0]?.score || 0
          });
        }
      });
    }
    
    // If no completed levels, check daily activity for timeline
    if (learningTimeline.length === 0 && progress?.dailyActivity && progress.dailyActivity.length > 0) {
      progress.dailyActivity.forEach(entry => {
        if (entry.isPresent && entry.totalMinutes > 0) {
          learningTimeline.push({
            date: entry.date.toISOString().split('T')[0],
            activity: 'Daily Learning Session',
            type: 'learning',
            duration: entry.totalMinutes * 60, // Convert to seconds
            score: null
          });
        }
      });
    }

    // If still no timeline, create sample data based on current progress
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

    // Generate learning levels data from curriculum
    let learningLevelsData = [];
    if (progress?.careerTrack) {
      try {
        // Get curriculum items for this career track
        const curriculumItems = await Curriculum.find({ 
          careerTrack: progress.careerTrack,
          isActive: true 
        }).sort({ order: 1 });
        
        if (curriculumItems && curriculumItems.length > 0) {
          console.log('Portfolio Controller - Generating learning levels from curriculum:', curriculumItems.length, 'items');
          
          learningLevelsData = curriculumItems.map(item => {
            // Find progress data for this level
            const levelProgress = progress?.completedLevels?.find(
              level => level.levelOrder === item.order || level.levelId === item._id.toString()
            );
            
            console.log(`🔍 Portfolio Controller - Processing level ${item.order}:`, {
              itemTitle: item.title,
              levelProgressFound: !!levelProgress,
              levelProgressData: levelProgress
            });
            
            // Determine level status
            let levelStatus = 'not-started';
            if (levelProgress) {
              const completedSections = [
                levelProgress.completedSections?.learn,
                levelProgress.completedSections?.test,
                levelProgress.completedSections?.exercise
              ].filter(Boolean).length;
              
              if (completedSections === 3) {
                levelStatus = 'completed';
              } else if (completedSections > 0) {
                levelStatus = 'in-progress';
              }
            } else if (item.order === 1) {
              levelStatus = 'accessible';
            }
            
            // Get completion details for each section
            const learnDetails = levelProgress?.learnProgress ? {
              completed: levelProgress.completedSections?.learn || false,
              startTime: levelProgress.learnProgress.lastAttemptAt || levelProgress.completedAt,
              endTime: levelProgress.completedSections?.learn ? levelProgress.completedAt : null,
              timeSpent: levelProgress.learnProgress.timeSpent || 0
            } : {
              completed: false,
              startTime: null,
              endTime: null,
              timeSpent: 0
            };
            
            const testDetails = levelProgress?.testProgress ? {
              completed: levelProgress.completedSections?.test || false,
              score: levelProgress.testProgress.attempts?.length > 0 
                ? Math.max(...levelProgress.testProgress.attempts.map(a => a.score || 0))
                : 0,
              attempts: levelProgress.testProgress.attempts?.length || 0,
              startTime: levelProgress.testProgress.lastAttemptAt || levelProgress.completedAt,
              endTime: levelProgress.completedSections?.test ? levelProgress.completedAt : null
            } : {
              completed: false,
              score: 0,
              attempts: 0,
              startTime: null,
              endTime: null
            };
            
            const exerciseDetails = levelProgress?.exerciseSubmissions ? {
              completed: levelProgress.completedSections?.exercise || false,
              startTime: levelProgress.exerciseSubmissions?.[0]?.submittedAt || levelProgress.completedAt,
              endTime: levelProgress.completedSections?.exercise ? levelProgress.completedAt : null,
              timeSpent: 0 // Exercise doesn't track time spent
            } : {
              completed: false,
              startTime: null,
              endTime: null,
              timeSpent: 0
            };
            
            return {
              level: item.order,
              courseName: item.title,
              description: item.description,
              status: levelStatus,
              learn: learnDetails,
              test: testDetails,
              exercise: exerciseDetails
            };
          });
          
          console.log('Portfolio Controller - Generated learning levels:', learningLevelsData.length, 'levels');
          console.log('Portfolio Controller - Learning levels data structure:', JSON.stringify(learningLevelsData, null, 2));
        }
      } catch (error) {
        console.log('Portfolio Controller - Error generating learning levels:', error.message);
      }
    }
    
    // Fallback to sample data if no curriculum found
    if (learningLevelsData.length === 0) {
      console.log('Portfolio Controller - Using fallback learning levels');
      learningLevelsData = [
        {
          level: 1,
          courseName: 'Introduction to Web Development',
          description: 'Learn the basics of web development',
          status: 'accessible',
          learn: { completed: false, startTime: null, endTime: null },
          test: { completed: false, score: 0, attempts: 0, startTime: null, endTime: null },
          exercise: { completed: false, startTime: null, endTime: null }
        }
      ];
    }

    // Create portfolio data structure matching StudentDetails interface
    const portfolioData = {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        careerTrack: student.careerTrack || 'Full Stack Development',
        level: student.level || 'Beginner',
        progress: realProgress,
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
        leaderboardScore: realLeaderboardScore,
        leaderboardRank: leaderboardRank || null,
        enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN') : '21-03-2025',
              performance: {
          performance: realProgress,
          potential: 90,
          contribution: 78,
          creativity: 82,
          skill: Math.min(100, Math.round((progress?.totalPoints || 0) / 10)),
          teamwork: 80
        },
        summaryStats: {
          consistency: Math.min(100, attendanceStats.currentStreak * 25),
          progress: realProgress,
          leaderboard: realLeaderboardScore
        },
        learningTimeline: [],
        dailyActivity: progress?.dailyActivity || [],
        attendanceStats,
        skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
        recommendedRoles: ['Frontend Developer', 'Full Stack Engineer', 'DevOps Engineer'],
        learningLevels: learningLevelsData
      }
    };

    // Final debug log to see what's being returned
    console.log('Portfolio Controller - Final portfolio data:', {
      studentId: portfolioData.student._id,
      progress: portfolioData.student.progress,
      leaderboardScore: portfolioData.student.leaderboardScore,
      attendancePercentage: portfolioData.student.attendancePercentage,
      realProgress,
      realLeaderboardScore,
      summaryStats: portfolioData.student.summaryStats
    });

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
