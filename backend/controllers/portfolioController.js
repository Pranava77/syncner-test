import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Attendance from '../models/Attendance.js';
import Curriculum from '../models/Curriculum.js';
import LeaderboardService from '../services/leaderboardService.js';

export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    const isOwnPortfolio = req.isOwnPortfolio || false;

    // Validate studentId
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided'
      });
    }

    // Check if user has permission to view this portfolio
    if (!isOwnPortfolio && req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can view their own portfolio, and staff/admin can view any portfolio.'
      });
    }

    // Validate user role and access rights
    if (isOwnPortfolio && (!req.user || req.user._id.toString() !== studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own portfolio.'
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
        select: 'order title description'
      })
      .lean();
    
    // Debug: Log what we found in UserProgress
    console.log('Portfolio Controller - UserProgress query result:', {
      studentId,
      foundProgress: !!progress,
      progressId: progress?._id,
      progressStructure: progress ? {
        user: progress.user,
        careerTrack: progress.careerTrack,
        currentLevel: progress.currentLevel,
        totalPoints: progress.totalPoints,
        completedLevelsCount: progress.completedLevels?.length || 0,
        hasCompletedLevels: progress.completedLevels && progress.completedLevels.length > 0,
        completedLevelsSample: progress.completedLevels?.[0] || null
      } : null
    });
    
    // Get real attendance data from Attendance model
    let attendanceStats = { totalDays: 0, presentDays: 0, currentStreak: 0, longestStreak: 0 };
    
    try {
      // Get attendance records for this student
      const attendanceRecords = await Attendance.find({ user: studentId })
        .sort({ date: -1 })
        .lean();
      
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
            // Find progress for this specific level by matching curriculum ID or order
            const levelProgress = progress.completedLevels.find(l => 
              l.levelId === item._id.toString() || l.levelOrder === item.order
            );
            
            // Determine overall status for this level
            let overallStatus = 'not-started';
            if (levelProgress) {
              // Check if all sections are completed
              const allSectionsCompleted = levelProgress.completedSections?.learn && 
                                         levelProgress.completedSections?.test && 
                                         levelProgress.completedSections?.exercise;
              overallStatus = allSectionsCompleted ? 'completed' : 'in-progress';
            } else if (progress?.currentLevel === item.order) {
              overallStatus = 'in-progress';
            }
            
            // Get timestamps for each section if available
            const learnStartTime = levelProgress?.learnProgress?.startTime || null;
            const learnEndTime = levelProgress?.learnProgress?.endTime || null;
            const testStartTime = levelProgress?.testProgress?.lastAttemptAt || null;
            const testEndTime = levelProgress?.testProgress?.lastAttemptAt || null; // Assuming test end time is same as last attempt
            const exerciseStartTime = levelProgress?.exerciseSubmissions?.[0]?.submittedAt || null;
            const exerciseEndTime = levelProgress?.exerciseSubmissions?.[0]?.submittedAt || null; // Assuming exercise end time is same as submission

            return {
              level: item.order,
              courseName: item.title,
              description: item.description,
              status: overallStatus,
              learn: {
                completed: levelProgress?.completedSections?.learn || false,
                startTime: learnStartTime,
                endTime: learnEndTime,
                timeSpent: levelProgress?.learnProgress?.timeSpent || 0,
                content: item.learn || [],
                title: 'Learning Materials',
                status: levelProgress?.completedSections?.learn ? 'completed' : learnStartTime ? 'in-progress' : 'not-started',
                // Additional content details
                materials: item.learn?.map(material => ({
                  id: material.id,
                  title: material.title,
                  description: material.description,
                  externalLink: material.externalLink,
                  order: material.order
                })) || []
              },
              test: {
                completed: levelProgress?.completedSections?.test || false,
                score: levelProgress?.testProgress?.attempts?.[0]?.score || 0,
                attempts: levelProgress?.testProgress?.attempts?.length || 0,
                startTime: testStartTime,
                endTime: testEndTime,
                content: item.test || [],
                title: 'Assessment',
                status: levelProgress?.completedSections?.test ? 'completed' : testStartTime ? 'in-progress' : 'not-started',
                // Additional test details
                questions: item.test?.map(test => ({
                  id: test.id,
                  title: test.title,
                  question: test.question,
                  options: test.options,
                  answer: test.answer,
                  order: test.order
                })) || []
              },
              exercise: {
                completed: levelProgress?.completedSections?.exercise || false,
                startTime: exerciseStartTime,
                endTime: exerciseEndTime,
                timeSpent: levelProgress?.exerciseSubmissions?.[0]?.timeSpent || 0,
                content: item.exercise || [],
                title: 'Practice Exercise',
                status: levelProgress?.completedSections?.exercise ? 'completed' : exerciseStartTime ? 'in-progress' : 'not-started',
                // Additional exercise details
                tasks: item.exercise?.map(exercise => ({
                  id: exercise.id,
                  title: exercise.title,
                  description: exercise.description,
                  content: exercise.content,
                  order: exercise.order
                })) || []
              }
            };
          });
          
          console.log('Portfolio Controller - Generated learning levels data:', {
            totalLevels: learningLevelsData.length,
            sampleLevel: learningLevelsData[0],
            progressData: {
              hasProgress: !!progress,
              completedLevelsCount: progress?.completedLevels?.length || 0,
              currentLevel: progress?.currentLevel
            }
          });
        }
      } catch (error) {
        console.log('Portfolio Controller - Could not get curriculum items:', error.message);
      }
    }
    
    // If no learning levels data was generated, create a basic structure from curriculum
    if (learningLevelsData.length === 0 && progress?.careerTrack) {
      try {
        console.log('Portfolio Controller - No learning levels data generated, creating basic structure from curriculum');
        const curriculumItems = await Curriculum.find({ 
          careerTrack: progress.careerTrack,
          type: 'syllabus'
        }).sort({ order: 1 });
        
        if (curriculumItems && curriculumItems.length > 0) {
          learningLevelsData = curriculumItems.map(item => ({
            level: item.order,
            courseName: item.title,
            description: item.description,
            status: 'not-started',
            learn: {
              completed: false,
              startTime: null,
              endTime: null,
              timeSpent: 0,
              content: item.learn || [],
              title: 'Learning Materials',
              status: 'not-started',
              materials: item.learn?.map(material => ({
                id: material.id,
                title: material.title,
                description: material.description,
                externalLink: material.externalLink,
                order: material.order
              })) || []
            },
            test: {
              completed: false,
              score: 0,
              attempts: 0,
              startTime: null,
              endTime: null,
              content: item.test || [],
              title: 'Assessment',
              status: 'not-started',
              questions: item.test?.map(test => ({
                id: test.id,
                title: test.title,
                question: test.question,
                options: test.options,
                answer: test.answer,
                order: test.order
              })) || []
            },
            exercise: {
              completed: false,
              startTime: null,
              endTime: null,
              timeSpent: 0,
              content: item.exercise || [],
              title: 'Practice Exercise',
              status: 'not-started',
              tasks: item.exercise?.map(exercise => ({
                id: exercise.id,
                title: exercise.title,
                description: exercise.description,
                content: exercise.content,
                order: exercise.order
              })) || []
            }
          }));
          
          console.log('Portfolio Controller - Created basic learning levels structure:', {
            totalLevels: learningLevelsData.length,
            sampleLevel: learningLevelsData[0]
          });
        }
      } catch (error) {
        console.log('Portfolio Controller - Could not create basic curriculum structure:', error.message);
      }
    }

    // Normalize career track to handle legacy values
    const normalizedCareerTrack = student.careerTrack === 'fullstack' ? 'full-stack' : student.careerTrack;

    // Get all curriculum items for this career track with efficient projection
    const curriculumItems = await Curriculum.find({
      careerTrack: normalizedCareerTrack,
      isActive: true
    }, {
      _id: 1,
      order: 1,
      title: 1,
      description: 1,
      type: 1,
      content: 1,
      materials: 1,
      questions: 1,
      tasks: 1
    })
    .sort({ order: 1 })
    .lean();

    // Group curriculum items by level order
    const levelGroups = curriculumItems.reduce((acc, item) => {
      if (!acc[item.order]) {
        acc[item.order] = {
          id: item._id,
          level: item.order,
          courseName: item.title,
          description: item.description,
          status: 'not-started',
          learn: { completed: false, timeSpent: 0, materials: [] },
          test: { completed: false, score: 0, attempts: 0, questions: [] },
          exercise: { completed: false, timeSpent: 0, tasks: [] }
        };
      }
      
      // Add item to appropriate section
      if (item.type === 'learn') {
        acc[item.order].learn.materials.push(item);
      } else if (item.type === 'test') {
        acc[item.order].test.questions.push(item);
      } else if (item.type === 'exercise') {
        acc[item.order].exercise.tasks.push(item);
      }
      
      return acc;
    }, {});

    // Update level status based on progress
    if (progress?.completedLevels) {
      progress.completedLevels.forEach(completedLevel => {
        const level = levelGroups[completedLevel.levelOrder];
        if (level) {
          level.status = 'completed';
          level.learn = {
            ...level.learn,
            completed: completedLevel.completedSections?.learn || false,
            timeSpent: completedLevel.learnProgress?.timeSpent || 0,
            startTime: completedLevel.learnProgress?.startTime,
            endTime: completedLevel.learnProgress?.endTime
          };
          level.test = {
            ...level.test,
            completed: completedLevel.completedSections?.test || false,
            score: completedLevel.testProgress?.attempts?.[0]?.score || 0,
            attempts: completedLevel.testProgress?.attempts?.length || 0,
            startTime: completedLevel.testProgress?.startTime,
            endTime: completedLevel.testProgress?.endTime
          };
          level.exercise = {
            ...level.exercise,
            completed: completedLevel.completedSections?.exercise || false,
            timeSpent: completedLevel.exerciseProgress?.timeSpent || 0,
            startTime: completedLevel.exerciseProgress?.startTime,
            endTime: completedLevel.exerciseProgress?.endTime
          };
        }
      });
    }

    // Convert level groups to array and sort by order
    const learningLevels = Object.values(levelGroups).sort((a, b) => a.level - b.level);

    // Validate required data before building response
    if (!student || !student.careerTrack) {
      throw new Error('Invalid student data: missing required fields');
    }

    if (!learningLevels || !Array.isArray(learningLevels)) {
      throw new Error('Invalid learning levels data');
    }

    // Calculate progress percentage safely
    const totalLevels = learningLevels.length || 1; // Avoid division by zero
    const completedLevelsCount = progress?.completedLevels?.length || 0;
    const progressPercentage = Math.min(
      Math.round((completedLevelsCount / totalLevels) * 100),
      100 // Cap at 100%
    );

    // Calculate attendance percentage safely
    const attendancePercentage = Math.min(
      Math.round((attendanceStats.presentDays / Math.max(attendanceStats.totalDays, 1)) * 100),
      100 // Cap at 100%
    );

    // Build comprehensive response with data validation
    const portfolioData = {
      student: {
        _id: student._id,
        name: student.name || 'Unknown',
        email: student.email || 'No email',
        careerTrack: student.careerTrack,
        college: student.college || 'Not specified',
        department: student.department || 'Not specified',
        createdAt: student.createdAt || new Date()
      },
      progress: {
        currentLevel: Math.max(progress?.currentLevel || 1, 1), // Ensure minimum level 1
        completedLevels: completedLevelsCount,
        totalLevels,
        percentage: progressPercentage,
        totalPoints: Math.max(progress?.totalPoints || 0, 0) // Ensure non-negative
      },
      attendance: {
        totalDays: Math.max(attendanceStats.totalDays || 0, 0),
        presentDays: Math.max(attendanceStats.presentDays || 0, 0),
        percentage: attendancePercentage,
        currentStreak: Math.max(attendanceStats.currentStreak || 0, 0),
        longestStreak: Math.max(attendanceStats.longestStreak || 0, 0)
      },
      leaderboard: {
        score: Math.max(leaderboardData?.totalScore || 0, 0),
        rank: leaderboardData?.rank || null,
        breakdown: {
          progressScore: Math.max(leaderboardData?.breakdown?.progressScore || 0, 0),
          attendanceScore: Math.max(leaderboardData?.breakdown?.attendanceScore || 0, 0),
          consistencyScore: Math.max(leaderboardData?.breakdown?.consistencyScore || 0, 0),
          timeScore: Math.max(leaderboardData?.breakdown?.timeScore || 0, 0)
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
    console.error('Portfolio Controller - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
