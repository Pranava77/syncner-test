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

// Helper function to get recommended roles for a career track
const getRecommendedRoles = (track) => {
  const roles = {
    'full-stack': ['Full Stack Developer', 'Software Engineer', 'Web Developer', 'Application Developer'],
    'ai-ml': ['ML Engineer', 'AI Developer', 'Data Scientist', 'Research Engineer'],
    'ui-ux': ['UI Designer', 'UX Designer', 'Product Designer', 'Interaction Designer'],
    'data-science': ['Data Scientist', 'Data Analyst', 'Business Intelligence Analyst', 'Data Engineer']
  };
  return roles[track] || ['Software Developer', 'Technical Analyst', 'Technology Consultant'];
};

// @desc    Get student portfolio data
// @route   GET /api/student/portfolio/:studentId
// @access  Private (Student: own data only, Staff/Admin: any student)
export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('🎯 Portfolio request for student:', studentId);
    console.log('👤 Requesting user:', req.user._id, 'Role:', req.user.role);
    
    // Authorization check
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own portfolio.'
      });
    }

    // Get student data
    const student = await User.findById(studentId)
      .select('-password')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID. User is not a student.'
      });
    }

    console.log('👤 Student found:', student.name, 'Career Track:', student.careerTrack);

    // Get student progress
    const progress = await UserProgress.findOne({ user: studentId })
      .lean();
    
    console.log('📊 Progress data found:', progress ? 'Yes' : 'No');

    // Normalize career track
    const normalizedCareerTrack = normalizeCareerTrack(student.careerTrack);
    console.log('🔄 Normalized track:', student.careerTrack, '->', normalizedCareerTrack);

    // Get track information
    const track = await Track.findOne({ name: normalizedCareerTrack })
      .lean();

    // Get curriculum items for learning timeline
    const curriculumItems = await Curriculum.find({
      careerTrack: normalizedCareerTrack,
      isActive: true
    })
    .sort({ order: 1 })
    .lean();

    // Get unique level orders
    const levelOrders = [...new Set(curriculumItems.map(item => item.order))].sort((a, b) => a - b);
    const totalLevels = levelOrders.length;

    console.log('📚 Found', curriculumItems.length, 'curriculum items across', totalLevels, 'levels');

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
        status: completedLevel?.completedSections?.exercise ? 'completed' :
                completedLevel ? 'in-progress' : 'not-started',
        learn: {
          completed: completedLevel?.completedSections?.learn || false,
          startTime: completedLevel?.learnProgress?.timeSpent ? new Date(completedLevel.completedAt).toISOString() : null,
          endTime: completedLevel?.completedSections?.learn ? new Date(completedLevel.completedAt).toISOString() : null
        },
        test: {
          completed: completedLevel?.completedSections?.test || false,
          score: completedLevel?.testProgress?.attempts?.slice(-1)[0]?.score || 0,
          attempts: completedLevel?.testProgress?.attempts?.length || 0,
          startTime: completedLevel?.testProgress?.attempts?.[0]?.completedAt?.toISOString() || null,
          endTime: completedLevel?.testProgress?.isCompleted ? completedLevel?.testProgress?.lastAttemptAt?.toISOString() : null
        },
        exercise: {
          completed: completedLevel?.completedSections?.exercise || false,
          startTime: completedLevel?.exerciseSubmissions?.[0]?.submittedAt?.toISOString() || null,
          endTime: completedLevel?.completedSections?.exercise ? completedLevel?.completedAt?.toISOString() : null
        }
      };
    });

    // Calculate summary stats
    const completedLevels = learningTimeline.filter(l => l.status === 'completed').length;
    const inProgressLevels = learningTimeline.filter(l => l.status === 'in-progress').length;
    const currentLevel = progress?.currentLevel || 1;
    const completionRate = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    // Calculate performance metrics
    const performance = {
      performance: completionRate,
      potential: Math.min(100, Math.round((completedLevels + inProgressLevels) / totalLevels * 100)),
      contribution: Math.round((progress?.totalPoints || 0) / 100),
      creativity: Math.round(((progress?.completedLevels || [])
        .reduce((sum, level) => sum + (level.exerciseSubmissions || []).length, 0) / totalLevels) * 100),
      skill: Math.round(((progress?.completedLevels || [])
        .reduce((sum, level) => sum + (level.testProgress?.attempts?.slice(-1)[0]?.score || 0), 0) / (completedLevels || 1)) || 0),
      teamwork: Math.round((progress?.attendanceStats?.presentDays || 0) / (progress?.attendanceStats?.totalDays || 1) * 100) || 0
    };

    // Build track info
    const trackInfo = track ? {
      name: track.name,
      displayName: track.displayName,
      description: track.description,
      duration: track.duration,
      difficulty: track.difficulty,
      averageSalary: track.averageSalary,
      careerPaths: track.careerPaths,
      prerequisites: track.prerequisites
    } : null;

    // Build final portfolio data
    const studentDetails = {
      ...student,
      performance,
      summaryStats: {
        totalLevels,
        completedLevels,
        currentLevel,
        completionRate,
        consistency: performance.teamwork,
        progress: completionRate,
        leaderboard: student.totalPoints || 0
      },
      learningTimeline,
      attendanceStats: progress?.attendanceStats || {
        totalDays: 0,
        presentDays: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      skills: getSkillsForTrack(normalizedCareerTrack),
      recommendedRoles: getRecommendedRoles(normalizedCareerTrack),
      trackInfo,
      enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'N/A'
    };

    console.log('✅ Portfolio data built successfully');
    
    res.status(200).json({
      success: true,
      data: {
        student: studentDetails
      }
    });
  } catch (error) {
    console.error('❌ Error fetching student portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
