import express from 'express';
import { getAllTasks, getTaskById, submitTask, createTask, updateTask, deleteTask, getUpcomingTasks, getAllStudentTasks } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';
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

// Public routes
router.get('/', getAllTasks);

// Get all submissions (for admin) - must come before /:id route
router.get('/submissions', protect, requireAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'name email')
      .populate('task', 'title difficulty')
      .sort({ submittedAt: -1 });
    // Map submissions to expected frontend format
    const mapped = submissions.map(sub => ({
      id: sub._id,
      taskId: sub.task?._id || '',
      taskTitle: sub.task?.title || '',
      taskDifficulty: sub.task?.difficulty || '',
      studentName: sub.student?.name || '',
      studentEmail: sub.student?.email || '',
      submittedAt: sub.submittedAt,
      status: sub.status,
      description: sub.description,
      liveUrl: sub.liveUrl,
      githubUrl: sub.githubUrl,
      notes: sub.notes,
      files: sub.files,
      score: sub.score,
      feedback: sub.feedback,
      reviewedAt: sub.reviewedAt,
      reviewedBy: sub.reviewedBy
    }));
    res.status(200).json({
      success: true,
      data: { submissions: mapped }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Move these two routes above /:id
router.get('/upcoming', protect, getUpcomingTasks);
router.get('/all', protect, getAllStudentTasks);

router.get('/:id', getTaskById);

// Admin routes
router.post('/', protect, requireAdmin, createTask);
router.put('/:id', protect, requireAdmin, updateTask);
router.delete('/:id', protect, requireAdmin, deleteTask);

// Submit a task solution
router.post('/:id/submit', protect, submitTask);

export default router; 