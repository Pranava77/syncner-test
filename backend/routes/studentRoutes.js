import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Track from '../models/Track.js';
import Curriculum from '../models/Curriculum.js';
import { normalizeCareerTrack } from '../utils/careerTrackUtils.js';

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
    
    console.log('👤 Student found:', student.name, 'Career Track:', student.careerTrack);

    // Get student progress
    const progress = await UserProgress.findOne({ user: studentId }).lean();
    console.log('📊 Student progress data:', progress ? 'Found' : 'Not found', progress?.completedLevels?.length || 0, 'completed levels');
    
    // Normalize career track to handle legacy "fullstack" vs "full-stack"
    const normalizedCareerTrack = normalizeCareerTrack(student.careerTrack);
    console.log('🔄 Normalized career track:', student.careerTrack, '->', normalizedCareerTrack);
    
    // Get track information - try multiple possible names
    let track = await Track.findOne({ name: normalizedCareerTrack }).lean();
    if (!track && normalizedCareerTrack) {
      // Try with different formatting
      const altFormats = [
        normalizedCareerTrack.toLowerCase().replace(/\s+/g, '-'),
        normalizedCareerTrack.toLowerCase().replace(/[\s-]/g, ''),
        normalizedCareerTrack
      ];
      for (const format of altFormats) {
        track = await Track.findOne({ name: format }).lean();
        if (track) break;
      }
    }
    console.log('🎯 Track data for', normalizedCareerTrack, ':', track ? `Found with ${track.levels?.length || 0} levels` : 'Not found');
    
    // Get ALL curriculum items for this career track to determine total levels
    const curriculumItems = await Curriculum.find({ 
      careerTrack: normalizedCareerTrack, 
      isActive: true 
    }).sort({ order: 1 }).lean();
    
    // Get unique level orders from curriculum
    const levelOrders = [...new Set(curriculumItems.map(item => item.order))].sort((a, b) => a - b);
    const totalLevels = levelOrders.length;
    
    console.log('📚 Curriculum items found:', curriculumItems.length, 'for track:', normalizedCareerTrack);
    console.log('🎯 Level orders found:', levelOrders, 'Total levels:', totalLevels);
    
    // Calculate summary statistics with real data
    const completedLevels = progress?.completedLevels?.length || 0;
    const currentLevel = progress?.currentLevel || 1;
    
    console.log('📈 Summary stats calculated:', { totalLevels, completedLevels, currentLevel });
    

    
    const summaryStats = {
      totalLevels,
      completedLevels,
      currentLevel,
      completionRate: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0
    };

    // Build complete learning timeline with ALL levels from curriculum
    const learningTimeline = levelOrders.map(levelOrder => {
      // Find progress data for this level
      const levelProgress = progress?.completedLevels?.find(
        level => level.levelOrder === levelOrder
      );
      
      // Determine level status
      let status = 'not-started';
      if (levelProgress) {
        const allSectionsCompleted = levelProgress.completedSections?.learn && 
                                   levelProgress.completedSections?.test && 
                                   levelProgress.completedSections?.exercise;
        status = allSectionsCompleted ? 'completed' : 'in-progress';
      } else if (levelOrder === 1) {
        status = 'in-progress'; // First level is always accessible
      }
      
      // Get level title from curriculum
      const levelCurriculumItem = curriculumItems.find(item => 
        item.order === levelOrder && item.type === 'syllabus'
      ) || curriculumItems.find(item => item.order === levelOrder);
      
      const levelTitle = levelCurriculumItem?.title || `Level ${levelOrder}`;
      
      return {
        level: levelOrder,
        courseName: levelTitle,
        status: status,
        learn: { 
          completed: levelProgress?.completedSections?.learn || false, 
          startTime: levelProgress?.learnProgress?.timeSpent ? levelProgress?.completedAt : null, 
          endTime: levelProgress?.learnProgress?.isCompleted ? levelProgress?.completedAt : null 
        },
        test: { 
          completed: levelProgress?.completedSections?.test || false, 
          score: levelProgress?.testProgress?.attempts?.[0]?.score || 0, 
          attempts: levelProgress?.testProgress?.attempts?.length || 0, 
          startTime: levelProgress?.testProgress?.lastAttemptAt || null, 
          endTime: levelProgress?.testProgress?.isCompleted ? levelProgress?.completedAt : null 
        },
        exercise: { 
          completed: levelProgress?.completedSections?.exercise || false, 
          startTime: levelProgress?.exerciseSubmissions?.[0]?.submittedAt || null, 
          endTime: levelProgress?.completedSections?.exercise ? levelProgress?.completedAt : null 
        }
      };
    });
    
    console.log('📚 Built learning timeline with', learningTimeline.length, 'levels:', learningTimeline.map(l => ({ level: l.level, status: l.status, title: l.courseName })));
    
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
