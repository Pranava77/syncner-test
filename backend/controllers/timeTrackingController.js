import UserProgress from '../models/UserProgress.js';

// Start time tracking for a section
export const startTimeTracking = async (req, res) => {
  try {
    const { levelId, section } = req.body;
    const userId = req.user.id;

    if (!levelId || !section) {
      return res.status(400).json({
        success: false,
        message: 'Level ID and section are required'
      });
    }

    if (!['learn', 'test', 'exercise'].includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Section must be learn, test, or exercise'
      });
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ user: userId });
    
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Find or create level entry
    let level = userProgress.completedLevels.find(l => l.levelId === levelId);
    
    if (!level) {
      // Create new level entry
      level = {
        levelId,
        levelOrder: 0, // Will be set when marking as completed
        completedSections: { learn: false, exercise: false, test: false },
        learnProgress: { startTime: null, endTime: null, timeSpent: 0, linksAccessed: [], isCompleted: false },
        testProgress: { startTime: null, endTime: null, timeSpent: 0, attempts: [], isCompleted: false },
        exerciseSubmissions: []
      };
      userProgress.completedLevels.push(level);
    }

    // Set start time for the section
    const now = new Date();
    
    if (section === 'learn') {
      if (!level.learnProgress) {
        level.learnProgress = { startTime: null, endTime: null, timeSpent: 0, linksAccessed: [], isCompleted: false };
      }
      level.learnProgress.startTime = now;
    } else if (section === 'test') {
      if (!level.testProgress) {
        level.testProgress = { startTime: null, endTime: null, timeSpent: 0, attempts: [], isCompleted: false };
      }
      level.testProgress.startTime = now;
    } else if (section === 'exercise') {
      // For exercise, we'll create a new submission entry
      level.exerciseSubmissions.push({
        exerciseTitle: 'Exercise Session',
        startTime: now,
        endTime: null,
        timeSpent: 0,
        submittedAt: now,
        status: 'submitted',
        links: []
      });
    }

    await userProgress.save();

    res.status(200).json({
      success: true,
      message: `Time tracking started for ${section} section`,
      startTime: now
    });

  } catch (error) {
    console.error('Time tracking start error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting time tracking'
    });
  }
};

// Stop time tracking for a section
export const stopTimeTracking = async (req, res) => {
  try {
    const { levelId, section } = req.body;
    const userId = req.user.id;

    if (!levelId || !section) {
      return res.status(400).json({
        success: false,
        message: 'Level ID and section are required'
      });
    }

    if (!['learn', 'test', 'exercise'].includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Section must be learn, test, or exercise'
      });
    }

    // Find user progress
    const userProgress = await UserProgress.findOne({ user: userId });
    
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Find level entry
    const level = userProgress.completedLevels.find(l => l.levelId === levelId);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    const now = new Date();
    let timeSpent = 0;

    if (section === 'learn' && level.learnProgress?.startTime) {
      level.learnProgress.endTime = now;
      timeSpent = Math.floor((now - level.learnProgress.startTime) / 1000); // Convert to seconds
      level.learnProgress.timeSpent = (level.learnProgress.timeSpent || 0) + timeSpent;
    } else if (section === 'test' && level.testProgress?.startTime) {
      level.testProgress.endTime = now;
      timeSpent = Math.floor((now - level.testProgress.startTime) / 1000); // Convert to seconds
      level.testProgress.timeSpent = (level.testProgress.timeSpent || 0) + timeSpent;
    } else if (section === 'exercise' && level.exerciseSubmissions?.length > 0) {
      // Find the most recent exercise submission
      const latestSubmission = level.exerciseSubmissions[level.exerciseSubmissions.length - 1];
      if (latestSubmission.startTime && !latestSubmission.endTime) {
        latestSubmission.endTime = now;
        timeSpent = Math.floor((now - latestSubmission.startTime) / 1000); // Convert to seconds
        latestSubmission.timeSpent = (latestSubmission.timeSpent || 0) + timeSpent;
      }
    }

    await userProgress.save();

    res.status(200).json({
      success: true,
      message: `Time tracking stopped for ${section} section`,
      endTime: now,
      timeSpent
    });

  } catch (error) {
    console.error('Time tracking stop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while stopping time tracking'
    });
  }
};

// Pause time tracking for a section (optional - for future use)
export const pauseTimeTracking = async (req, res) => {
  try {
    const { levelId, section } = req.body;
    const userId = req.user.id;

    if (!levelId || !section) {
      return res.status(400).json({
        success: false,
        message: 'Level ID and section are required'
      });
    }

    // For now, just return success - pause functionality can be implemented later
    res.status(200).json({
      success: true,
      message: `Time tracking paused for ${section} section`
    });

  } catch (error) {
    console.error('Time tracking pause error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while pausing time tracking'
    });
  }
};
