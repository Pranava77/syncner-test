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

// @desc    Update learn progress
// @route   POST /api/progress/learn-progress
// @access  Private
export const updateLearnProgress = async (req, res) => {
  try {
    const { levelId, timeSpent, linksAccessed } = req.body;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    if (!levelId) {
      return res.status(400).json({
        success: false,
        message: 'Level ID is required'
      });
    }

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    progress.updateLearnProgress(levelId, timeSpent || 0, linksAccessed || []);
    await progress.save();

    // Get the updated level progress
    const level = progress.completedLevels.find(l => l.levelId === levelId);
    const learnProgress = level ? level.learnProgress : null;

    res.status(200).json({
      success: true,
      data: {
        learnProgress,
        isCompleted: learnProgress ? learnProgress.isCompleted : false
      },
      message: 'Learn progress updated successfully'
    });
  } catch (error) {
    console.error('Update learn progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating learn progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Submit test attempt
// @route   POST /api/progress/test-attempt
// @access  Private
export const submitTestAttempt = async (req, res) => {
  try {
    const { levelId, score, answers } = req.body;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    if (!levelId || score === undefined || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Level ID, score, and answers are required'
      });
    }

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    
    // Check if user can retake test
    if (!progress.canRetakeTest(levelId)) {
      const level = progress.completedLevels.find(l => l.levelId === levelId);
      const attempts = level ? level.testProgress.attempts.length : 0;
      
      if (attempts >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts reached. Please wait 24 hours before retaking.',
          data: {
            attempts: attempts,
            maxAttempts: 3,
            canRetake: false
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please wait 24 hours before retaking the test.',
          data: {
            attempts: attempts,
            maxAttempts: 3,
            canRetake: false
          }
        });
      }
    }

    progress.submitTestAttempt(levelId, score, answers);
    await progress.save();

    // Get the updated test progress
    const level = progress.completedLevels.find(l => l.levelId === levelId);
    const testProgress = level ? level.testProgress : null;
    const passed = score >= 60;

    res.status(200).json({
      success: true,
      data: {
        score,
        passed,
        attempts: testProgress ? testProgress.attempts.length : 1,
        maxAttempts: 3,
        canRetake: progress.canRetakeTest(levelId)
      },
      message: passed ? 'Test passed! Exercise unlocked.' : 'Test failed. You can retry after 24 hours.'
    });
  } catch (error) {
    console.error('Submit test attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting test attempt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Check test unlock status
// @route   GET /api/progress/test-unlocked/:levelId
// @access  Private
export const checkTestUnlocked = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    const isUnlocked = progress.isTestUnlocked(levelId);
    
    // Get learn progress details
    const level = progress.completedLevels.find(l => l.levelId === levelId);
    const learnProgress = level ? level.learnProgress : null;
    const testProgress = level ? level.testProgress : null;

    res.status(200).json({
      success: true,
      data: {
        isUnlocked,
        learnProgress,
        testProgress,
        timeRequired: 300, // 5 minutes in seconds
        timeSpent: learnProgress ? learnProgress.timeSpent : 0,
        linksRequired: 1,
        linksAccessed: learnProgress ? learnProgress.linksAccessed.length : 0,
        attempts: testProgress ? testProgress.attempts.length : 0,
        maxAttempts: 3,
        canRetake: progress.canRetakeTest(levelId)
      }
    });
  } catch (error) {
    console.error('Check test unlocked error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking test unlock status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Check exercise unlock status
// @route   GET /api/progress/exercise-unlocked/:levelId
// @access  Private
export const checkExerciseUnlocked = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    const isUnlocked = progress.isExerciseUnlocked(levelId);
    
    // Get test progress details
    const level = progress.completedLevels.find(l => l.levelId === levelId);
    const testProgress = level ? level.testProgress : null;

    res.status(200).json({
      success: true,
      data: {
        isUnlocked,
        testProgress,
        attempts: testProgress ? testProgress.attempts.length : 0,
        maxAttempts: 3,
        canRetake: progress.canRetakeTest(levelId)
      }
    });
  } catch (error) {
    console.error('Check exercise unlocked error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking exercise unlock status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Check exercise links status
// @route   GET /api/progress/exercise-links/:levelId
// @access  Private
export const checkExerciseLinks = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    const hasLinks = progress.hasExerciseLinks(levelId);
    
    // Get exercise submissions
    const level = progress.completedLevels.find(l => l.levelId === levelId);
    const exerciseSubmissions = level ? level.exerciseSubmissions : [];

    res.status(200).json({
      success: true,
      data: {
        hasLinks,
        exerciseSubmissions,
        canUnlockNextLevel: hasLinks
      }
    });
  } catch (error) {
    console.error('Check exercise links error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking exercise links',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Submit exercise
// @route   POST /api/progress/submit-exercise
// @access  Private
export const submitExercise = async (req, res) => {
  try {
    const { levelId, exerciseTitle, links } = req.body;
    const userId = req.user._id;
    const { careerTrack } = req.user;

    if (!levelId || !exerciseTitle) {
      return res.status(400).json({
        success: false,
        message: 'Level ID and exercise title are required'
      });
    }

    const progress = await UserProgress.getOrCreate(userId, careerTrack);
    progress.submitExercise(levelId, exerciseTitle, links);
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