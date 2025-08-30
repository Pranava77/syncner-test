import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Track from '../models/Track.js';
import Curriculum from '../models/Curriculum.js';
import { normalizeCareerTrack } from '../utils/careerTrackUtils.js';

// Helper function to get skills for a career track
const getSkillsForTrack = (track) => {
  const skills = {
    'full-stack': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database Design'],
    'ai-ml': ['Python', 'Machine Learning', 'Data Science', 'Neural Networks', 'Deep Learning'],
    'ui-ux': ['UI Design', 'UX Research', 'Prototyping', 'User Testing', 'Design Systems'],
    'data-science': ['Python', 'Statistics', 'Data Analysis', 'Data Visualization', 'Machine Learning']
  };
  return skills[track] || ['Programming', 'Problem Solving', 'Critical Thinking'];
};

// Helper function to get recommended roles
const getRecommendedRoles = (track) => {
  const roles = {
    'full-stack': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Web Developer'],
    'ai-ml': ['ML Engineer', 'AI Developer', 'Data Scientist', 'Research Engineer'],
    'ui-ux': ['UI Designer', 'UX Designer', 'Product Designer', 'Interaction Designer'],
    'data-science': ['Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Data Engineer']
  };
  return roles[track] || ['Software Developer', 'Technical Specialist', 'Technology Consultant'];
};

// @desc    Get student portfolio data
// @route   GET /api/student/portfolio/:studentId
// @access  Private (Student: own data only, Staff/Admin: any student)
export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('🎯 Portfolio request for student:', studentId);
    console.log('👤 Requesting user:', req.user._id, 'Role:', req.user.role);
    console.log('🔐 Request headers:', req.headers);
    console.log('📝 Request params:', req.params);
    console.log('🔍 Request query:', req.query);
    
    // Authorization check
    if (req.user.role === 'student') {
      // If it's a /me request or the user is requesting their own portfolio
      if (req.isOwnPortfolio || req.user._id.toString() === studentId.toString()) {
        // Allow access to own portfolio
        console.log('✅ Authorized: User accessing own portfolio');
      } else {
        // Deny access to other student portfolios
        console.log('❌ Unauthorized: Student trying to access another student\'s portfolio');
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own portfolio.'
        });
      }
    } else {
      // Staff/admin can access any portfolio
      console.log('✅ Authorized: Staff/admin accessing student portfolio');
    }

    // Get student data
    console.log('🔍 Looking for student with ID:', studentId);
    const student = await User.findById(studentId)
      .select('-password')
      .lean();

    if (!student) {
      console.log('❌ Student not found with ID:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    console.log('✅ Student found:', {
      id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      careerTrack: student.careerTrack
    });

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID. User is not a student.'
      });
    }

    console.log('👤 Student found:', student.name, 'Career Track:', student.careerTrack);

    // Get student progress
    console.log('🔍 Looking for progress data for user:', studentId);
    const progress = await UserProgress.findOne({ user: studentId })
      .lean();
    
    console.log('📊 Progress data found:', progress ? 'Yes' : 'No');
    if (progress) {
      console.log('📈 Progress details:', {
        currentLevel: progress.currentLevel,
        totalPoints: progress.totalPoints,
        completedLevelsCount: progress.completedLevels?.length || 0,
        hasDailyActivity: !!progress.dailyActivity,
        hasAttendanceStats: !!progress.attendanceStats
      });
    }

    // Normalize career track
    const normalizedCareerTrack = normalizeCareerTrack(student.careerTrack);
    console.log('🔄 Normalized track:', student.careerTrack, '->', normalizedCareerTrack);

    // Get track information
    const track = await Track.findOne({ name: normalizedCareerTrack })
      .lean();

    // Get curriculum items for learning timeline
    console.log('🔍 Looking for curriculum items for track:', normalizedCareerTrack);
    const curriculumItems = await Curriculum.find({
      careerTrack: normalizedCareerTrack,
      isActive: true
    })
    .sort({ order: 1 })
    .lean();

    console.log('📚 Curriculum items found:', curriculumItems.length);
    console.log('📋 Curriculum item types:', [...new Set(curriculumItems.map(item => item.type))]);
    
    // Get unique level orders
    const levelOrders = [...new Set(curriculumItems.map(item => item.order))];
    console.log('🎯 Level orders found:', levelOrders);

    // Build learning timeline
    const learningTimeline = levelOrders.map(order => {
      const levelItems = curriculumItems.filter(item => item.order === order);
      const syllabusItem = levelItems.find(item => item.type === 'syllabus');
      const learnItems = levelItems.filter(item => item.type === 'learn');
      const testItems = levelItems.filter(item => item.type === 'test');
      const exerciseItems = levelItems.filter(item => item.type === 'exercise');

      // Find completed level data
      const completedLevel = progress?.completedLevels?.find(cl => cl.levelOrder === order);

      return {
        level: order,
        courseName: syllabusItem?.title || `Level ${order}`,
        description: syllabusItem?.description || `Level ${order} content`,
        status: completedLevel?.completedSections?.exercise ? 'completed' :
                completedLevel ? 'in-progress' : 'not-started',
        learn: {
          completed: completedLevel?.completedSections?.learn || false,
          startTime: completedLevel?.learnProgress?.timeSpent ? new Date(completedLevel.completedAt).toISOString() : null,
          endTime: completedLevel?.completedSections?.learn ? new Date(completedLevel.completedAt).toISOString() : null,
          title: learnItems[0]?.title || `Level ${order} Learning`,
          description: learnItems[0]?.description || 'Complete the learning materials for this level',
          content: learnItems.map(item => ({
            id: item._id.toString(),
            title: item.title,
            content: item.content,
            externalLink: item.externalLink || '',
            description: item.description || '',
            resources: item.resources || []
          })),
          timeSpent: completedLevel?.learnProgress?.timeSpent || 0
        },
        test: {
          completed: completedLevel?.completedSections?.test || false,
          score: completedLevel?.testProgress?.attempts?.slice(-1)[0]?.score || 0,
          attempts: completedLevel?.testProgress?.attempts?.length || 0,
          startTime: completedLevel?.testProgress?.attempts?.[0]?.completedAt?.toISOString() || null,
          endTime: completedLevel?.testProgress?.isCompleted ? completedLevel?.testProgress?.lastAttemptAt?.toISOString() : null,
          title: testItems[0]?.title || `Level ${order} Assessment`,
          description: testItems[0]?.description || 'Complete the assessment for this level',
          content: testItems.map(item => ({
            id: item._id.toString(),
            title: item.title,
            question: item.content.split('\n')[0],
            options: item.content.split('\n')
              .slice(1)
              .filter(line => line.match(/^[A-D]\)/))
              .map(line => line.substring(2).trim()),
            answer: item.content.split('\n')
              .find(line => line.startsWith('Answer:'))
              ?.split(':')[1]?.trim() || 'A'
          })),
          timeSpent: completedLevel?.testProgress?.attempts?.reduce((total, attempt) => {
            const start = new Date(attempt.completedAt);
            const end = new Date(completedLevel.testProgress.lastAttemptAt);
            return total + Math.floor((end - start) / (1000 * 60)); // Convert to minutes
          }, 0) || 0
        },
        exercise: {
          completed: completedLevel?.completedSections?.exercise || false,
          startTime: completedLevel?.exerciseSubmissions?.[0]?.submittedAt?.toISOString() || null,
          endTime: completedLevel?.completedSections?.exercise ? completedLevel?.exerciseSubmissions?.slice(-1)[0]?.submittedAt?.toISOString() : null,
          title: exerciseItems[0]?.title || `Level ${order} Exercise`,
          description: exerciseItems[0]?.description || 'Complete the practical exercises for this level',
          content: exerciseItems.map(item => ({
            id: item._id.toString(),
            title: item.title,
            content: item.content,
            description: item.description || '',
            resources: item.resources || []
          })),
          timeSpent: completedLevel?.exerciseSubmissions?.length * 30 || 0 // Estimate 30 minutes per submission
        }
      };
    });

    // Get daily activity data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dailyActivity = progress?.dailyActivity || [];
    const recentActivity = dailyActivity
      .filter(day => new Date(day.date) >= thirtyDaysAgo)
      .map(day => ({
        date: day.date.toISOString(),
        totalMinutes: day.totalMinutes,
        activities: day.activities,
        isPresent: day.isPresent
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fill in missing dates with zero activity
    const allDates = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existingActivity = recentActivity.find(a => a.date.startsWith(dateStr));
      if (existingActivity) {
        allDates.push(existingActivity);
      } else {
        allDates.push({
          date: new Date(d).toISOString(),
          totalMinutes: 0,
          activities: [],
          isPresent: false
        });
      }
    }

    // Calculate performance metrics
    const performance = {
      performance: Math.min(100, (progress?.totalPoints || 0) / 10),
      potential: Math.min(100, ((progress?.completedLevels?.length || 0) / levelOrders.length) * 100),
      contribution: Math.min(100, (progress?.dailyActivity?.filter(d => d.isPresent)?.length || 0) / 30 * 100),
      creativity: Math.min(100, (progress?.completedLevels?.reduce((total, level) => 
        total + (level.exerciseSubmissions?.length || 0), 0) || 0) * 10),
      skill: Math.min(100, progress?.completedLevels?.reduce((total, level) => 
        total + (level.testProgress?.attempts?.slice(-1)[0]?.score || 0), 0) / 
        (progress?.completedLevels?.length || 1)),
      teamwork: Math.min(100, (progress?.attendanceStats?.currentStreak || 0) * 5)
    };

    // Calculate summary stats
    const summaryStats = {
      totalLevels: levelOrders.length,
      completedLevels: progress?.completedLevels?.filter(l => l.completedSections?.exercise)?.length || 0,
      currentLevel: progress?.currentLevel || 1,
      completionRate: ((progress?.completedLevels?.filter(l => l.completedSections?.exercise)?.length || 0) / levelOrders.length) * 100,
      consistency: (progress?.attendanceStats?.presentDays || 0) / (progress?.attendanceStats?.totalDays || 1) * 100,
      progress: ((progress?.currentLevel || 1) / levelOrders.length) * 100,
      leaderboard: progress?.totalPoints || 0
    };

    // Build response object
    const portfolioData = {
      ...student,
      performance,
      summaryStats,
      learningTimeline,
      dailyActivity: allDates,
      attendanceStats: progress?.attendanceStats || {
        totalDays: 0,
        presentDays: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      skills: getSkillsForTrack(normalizedCareerTrack),
      recommendedRoles: getRecommendedRoles(normalizedCareerTrack),
      trackInfo: track,
      enrolledDate: progress?.createdAt || student.createdAt
    };

    const response = {
      success: true,
      data: {
        student: portfolioData
      }
    };
    
    console.log('✅ Portfolio response prepared successfully');
    console.log('📊 Response summary:', {
      studentName: portfolioData.name,
      careerTrack: portfolioData.careerTrack,
      timelineLevels: portfolioData.learningTimeline?.length || 0,
      dailyActivityDays: portfolioData.dailyActivity?.length || 0,
      hasSkills: !!portfolioData.skills?.length,
      hasRoles: !!portfolioData.recommendedRoles?.length
    });
    
    return res.json(response);

  } catch (error) {
    console.error('❌ Error in getStudentPortfolio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching portfolio data',
      error: error.message
    });
  }
};