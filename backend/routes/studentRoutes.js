import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Track from '../models/Track.js';

const router = express.Router();

// Get student's own portfolio data
router.get('/portfolio/:studentId', protect, authorize('student'), async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('🎯 Student portfolio route called for student:', studentId);
    console.log('👤 Requesting user:', req.user._id, 'Role:', req.user.role);
    
    // Ensure student can only access their own data
    if (req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own portfolio.'
      });
    }

    const student = await User.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student progress
    const progress = await UserProgress.findOne({ user: studentId }).lean();
    
    // Get track information
    const track = await Track.findOne({ name: student.careerTrack }).lean();
    
    // Calculate summary statistics
    const totalLevels = track ? track.levels.length : 10;
    const completedLevels = progress?.completedLevels?.length || 0;
    const currentLevel = progress?.currentLevel || 1;
    
    const summaryStats = {
      totalLevels,
      completedLevels,
      currentLevel,
      completionRate: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0
    };

    // Build learning timeline
    const learningTimeline = (progress?.completedLevels || []).map((level, index) => ({
      level: level.levelOrder,
      courseName: `Level ${level.levelOrder}`,
      status: 'completed',
      learn: { 
        completed: level.completedSections?.learn || false, 
        startTime: level.learnProgress?.timeSpent ? level.completedAt : null, 
        endTime: level.learnProgress?.isCompleted ? level.completedAt : null 
      },
      test: { 
        completed: level.completedSections?.test || false, 
        score: level.testProgress?.attempts?.[0]?.score || 0, 
        attempts: level.testProgress?.attempts?.length || 0, 
        startTime: level.testProgress?.lastAttemptAt || level.completedAt, 
        endTime: level.testProgress?.isCompleted ? level.completedAt : null 
      },
      exercise: { 
        completed: level.completedSections?.exercise || false, 
        startTime: level.exerciseSubmissions?.[0]?.submittedAt || level.completedAt, 
        endTime: level.completedSections?.exercise ? level.completedAt : null 
      }
    })) || [];
    
    // Add current level if not completed
    if (progress?.currentLevel && progress.currentLevel !== 1) {
      // Find the current level progress data
      const currentLevelProgress = progress.completedLevels.find(
        level => level.levelOrder === progress.currentLevel
      );
      
      learningTimeline.unshift({
        level: progress.currentLevel,
        courseName: `Level ${progress.currentLevel}`,
        status: 'in-progress',
        learn: { 
          completed: currentLevelProgress?.completedSections?.learn || false, 
          startTime: currentLevelProgress?.learnProgress?.timeSpent ? currentLevelProgress.completedAt : null, 
          endTime: currentLevelProgress?.learnProgress?.isCompleted ? currentLevelProgress.completedAt : null 
        },
        test: { 
          completed: currentLevelProgress?.completedSections?.test || false, 
          score: currentLevelProgress?.testProgress?.attempts?.[0]?.score || 0, 
          attempts: currentLevelProgress?.testProgress?.attempts?.length || 0, 
          startTime: currentLevelProgress?.testProgress?.lastAttemptAt || null, 
          endTime: currentLevelProgress?.testProgress?.isCompleted ? currentLevelProgress.completedAt : null 
        },
        exercise: { 
          completed: currentLevelProgress?.completedSections?.exercise || false, 
          startTime: currentLevelProgress?.exerciseSubmissions?.[0]?.submittedAt || null, 
          endTime: currentLevelProgress?.completedSections?.exercise ? currentLevelProgress.completedAt : null 
        }
      });
    }
    
    const studentDetails = {
      ...student,
      summaryStats,
      learningTimeline,
      enrolledDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'N/A'
    };
    
    res.status(200).json({
      success: true,
      data: {
        student: studentDetails
      }
    });
  } catch (error) {
    console.error('Error fetching student portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
