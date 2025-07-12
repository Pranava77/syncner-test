import express from 'express';
import Submission from '../models/Submission.js';
import { protect } from '../middleware/auth.js';
import { reviewSubmission, getAllSubmissions } from '../controllers/submissionController.js';
import { authorize } from '../middleware/auth.js';

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
      description: sub.description,
      liveUrl: sub.liveUrl,
      githubUrl: sub.githubUrl,
      notes: sub.notes,
      files: sub.files,
      reviewedAt: sub.reviewedAt,
      reviewedBy: sub.reviewedBy,
      submittedAt: sub.submittedAt,
    }));
    res.status(200).json({ success: true, submissions: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Review a submission (admin)
router.patch('/:id/review', protect, authorize('admin'), reviewSubmission);

// Get all submissions for admin
router.get('/', protect, authorize('admin'), getAllSubmissions);

// Health check for submissions module
router.get('/health', async (req, res) => {
  try {
    await Submission.findOne();
    res.status(200).json({ success: true, message: 'Submissions module is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Submissions module health check failed', error: error.message });
  }
});

export default router; 