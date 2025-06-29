import Task from '../models/Task.js';
import Submission from '../models/Submission.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
const getAllTasks = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.track) {
      filter.careerTrack = req.query.track;
    }
    const tasks = await Task.find(filter);
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit task
// @route   POST /api/tasks/:id/submit
// @access  Private
const submitTask = async (req, res) => {
  try {
    const { content, files } = req.body;
    
    const submission = await Submission.create({
      user: req.user.id,
      task: req.params.id,
      content,
      files: files || []
    });
    
    res.status(201).json({
      success: true,
      message: 'Task submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getAllTasks,
  getTaskById,
  submitTask
}; 