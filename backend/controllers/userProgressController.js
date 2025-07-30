import UserProgress from '../models/UserProgress.js';

// @desc    Get user progress for a career track
// @route   GET /api/progress/:careerTrack
// @access  Private
export const getUserProgress = async (req, res) => {
  try {
    const { careerTrack } = req.params;
    const userId = req.user._id;

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark level section as completed
// @route   POST /api/progress/complete
// @access  Private
export const markLevelCompleted = async (req, res) => {
  try {
    const { levelId, levelOrder, section } = req.body;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    if (!levelId || !levelOrder || !section) {
      return res.status(400).json({
        success: false,
        message: 'Level ID, level order, and section are required'
      });
    }

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    progress.markLevelCompleted(levelId, levelOrder, section);
    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: `${section} section completed for level ${levelOrder}`
    });
  } catch (error) {
    console.error('Mark level completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking level as completed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Submit exercise
// @route   POST /api/progress/submit-exercise
// @access  Private
export const submitExercise = async (req, res) => {
  try {
    const { levelId, exerciseTitle } = req.body;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    if (!levelId || !exerciseTitle) {
      return res.status(400).json({
        success: false,
        message: 'Level ID and exercise title are required'
      });
    }

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    progress.submitExercise(levelId, exerciseTitle);
    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Exercise submitted successfully'
    });
  } catch (error) {
    console.error('Submit exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting exercise',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Check if level is unlocked
// @route   GET /api/progress/unlocked/:levelOrder
// @access  Private
export const checkLevelUnlocked = async (req, res) => {
  try {
    const { levelOrder } = req.params;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    const isUnlocked = progress.isLevelUnlocked(parseInt(levelOrder));

    res.status(200).json({
      success: true,
      data: {
        isUnlocked,
        currentLevel: progress.currentLevel,
        completedLevels: progress.completedLevels
      }
    });
  } catch (error) {
    console.error('Check level unlocked error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking level status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all levels with unlock status
// @route   GET /api/progress/levels-status
// @access  Private
export const getLevelsStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { careerTrack } = req.user;

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    
    // Get all levels for the career track (this would need to be passed or fetched)
    const { levels } = req.query;
    let allLevels = [];
    
    if (levels) {
      try {
        allLevels = JSON.parse(levels);
      } catch (e) {
        console.error('Error parsing levels:', e);
      }
    }

    const levelsWithStatus = allLevels.map(level => ({
      ...level,
      isUnlocked: progress.isLevelUnlocked(level.order),
      isCompleted: progress.completedLevels.some(
        completed => completed.levelId === level.id
      ),
      completedSections: progress.completedLevels.find(
        completed => completed.levelId === level.id
      )?.completedSections || {
        learn: false,
        exercise: false,
        test: false
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        levels: levelsWithStatus,
        currentLevel: progress.currentLevel,
        totalPoints: progress.totalPoints
      }
    });
  } catch (error) {
    console.error('Get levels status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting levels status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 