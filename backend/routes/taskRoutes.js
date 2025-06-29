import express from 'express';
import { getAllTasks, getTaskById, submitTask } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import Submission from '../models/Submission.js';

const router = express.Router();

// Helper middleware to handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all tasks
router.get('/', protect, getAllTasks);

// Get all submissions (for admin)
router.get('/submissions', protect, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'name email')
      .populate('task', 'title difficulty')
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Submit a task solution
router.post('/:id/submit', protect, submitTask);

// Get a specific task by ID (this should be last to avoid conflicts)
router.get('/:id', protect, getTaskById);

export default router; 