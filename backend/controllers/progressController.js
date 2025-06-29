import Progress from '../models/Progress.js';

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
const getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id })
      .populate('taskProgress.task');
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user progress
// @route   PATCH /api/progress
// @access  Private
const updateUserProgress = async (req, res) => {
  try {
    const { moduleId, taskId, completed } = req.body;
    
    let progress = await Progress.findOne({ user: req.user.id });
    
    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        careerTrack: 'fullstack' // Default track
      });
    }
    
    // Update based on what was completed
    if (moduleId && completed) {
      // Check if module progress already exists
      const existingModuleProgress = progress.moduleProgress.find(
        mp => mp.module === moduleId
      );
      
      if (!existingModuleProgress) {
        progress.moduleProgress.push({
          module: moduleId,
          status: 'completed',
          completedAt: new Date()
        });
      }
    }
    
    if (taskId && completed) {
      // Check if task progress already exists
      const existingTaskProgress = progress.taskProgress.find(
        tp => tp.task.toString() === taskId
      );
      
      if (!existingTaskProgress) {
        progress.taskProgress.push({
          task: taskId,
          status: 'completed',
          completedAt: new Date()
        });
      }
    }
    
    await progress.save();
    
    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getUserProgress,
  updateUserProgress
}; 