import express from 'express';
import Submission from '../models/Submission.js';
import { protect } from '../middleware/auth.js';
import { reviewSubmission } from '../controllers/submissionController.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = express.Router();

// Get all submissions for the logged-in student
router.get('/my', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate('task', 'title')
      .sort({ submittedAt: -1 });
    const mapped = submissions.map(sub => ({
      id: sub._id,
      taskTitle: sub.task?.title || '',
      status: sub.status,
      score: sub.score,
      feedback: sub.feedback,
      submittedAt: sub.submittedAt,
    }));
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Review a submission (admin)
router.patch('/:id/review', protect, requireAdmin, reviewSubmission);

export default router; 