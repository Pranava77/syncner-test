import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Multer setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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
    // Convert _id to id for each task
    const tasksWithId = tasks.map(task => {
      const obj = task.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });
    res.status(200).json({
      success: true,
      data: tasksWithId
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
    
    const obj = task.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(200).json({
      success: true,
      data: obj
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user.id
    };
    // Ensure assignedTo is an array of user IDs if provided
    if (req.body.assignedTo) {
      taskData.assignedTo = req.body.assignedTo;
    }
    const task = await Task.create(taskData);
    const obj = task.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: obj
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
const updateTask = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.assignedTo) {
      updateData.assignedTo = req.body.assignedTo;
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    const obj = task.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: obj
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit task
// @route   POST /api/tasks/:id/submit
// @access  Private
const submitTask = [
  upload.array('files', 10),
  async (req, res) => {
    try {
      const { description, liveUrl, githubUrl, notes } = req.body;
      let files = [];
      if (req.files && req.files.length > 0) {
        files = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        }));
      }
      const submission = await Submission.create({
        student: req.user.id,
        task: req.params.id,
        description,
        liveUrl,
        githubUrl,
        notes,
        files
      });
      // Convert _id to id for response
      const submissionObj = submission.toObject();
      submissionObj.id = submissionObj._id;
      delete submissionObj._id;
      res.status(201).json({
        success: true,
        message: 'Task submitted successfully',
        data: submissionObj
      });
    } catch (error) {
      console.error('Submit task error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
];

// @desc    Get upcoming tasks for the logged-in user
// @route   GET /api/tasks/upcoming
// @access  Private
const getUpcomingTasks = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const now = new Date();
    const userTrack = req.user.careerTrack;
    const userId = req.user.id;
    const userSubmissions = await Submission.find({ student: userId });
    const submittedTaskIds = userSubmissions.map(sub => sub.task.toString());
    // Find tasks assigned to user or for their track, not already submitted, due in future, active
    const tasks = await Task.find({
      dueDate: { $gte: now },
      isActive: true,
      $or: [
        { assignedTo: userId },
        { careerTrack: userTrack }
      ],
      _id: { $nin: submittedTaskIds }
    }).sort({ dueDate: 1 });
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all tasks for the logged-in student with status
// @route   GET /api/tasks/all
// @access  Private
const getAllStudentTasks = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const now = new Date();
    const userTrack = req.user.careerTrack;
    const userId = req.user.id;
    // Get all tasks assigned to user or for their track
    const tasks = await Task.find({
      isActive: true,
      $or: [
        { assignedTo: userId },
        { careerTrack: userTrack }
      ]
    }).sort({ dueDate: 1 });
    // Get all submissions by this user
    const userSubmissions = await Submission.find({ student: userId });
    const submissionMap = {};
    userSubmissions.forEach(sub => {
      submissionMap[sub.task.toString()] = sub;
    });
    // Map tasks to include status
    const tasksWithStatus = tasks.map(task => {
      const obj = task.toObject();
      obj.id = obj._id;
      delete obj._id;
      const submission = submissionMap[obj.id];
      if (submission) {
        if (submission.status === 'approved' || submission.status === 'reviewed') {
          obj.status = 'Completed';
        } else {
          obj.status = 'Submitted';
        }
      } else if (obj.dueDate && new Date(obj.dueDate) < now) {
        obj.status = 'Overdue';
      } else {
        obj.status = 'Not Started';
      }
      return obj;
    });
    res.status(200).json({
      success: true,
      data: tasksWithStatus
    });
  } catch (error) {
    console.error('Get all student tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  getUpcomingTasks,
  getAllStudentTasks
}; 