import Submission from '../models/Submission.js';

// @desc    Review a submission (admin)
// @route   PATCH /api/submissions/:id/review
// @access  Private/Admin
const reviewSubmission = async (req, res) => {
  try {
    const { score, feedback, status } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (score !== undefined) submission.score = score;
    if (feedback !== undefined) submission.feedback = feedback;
    if (status !== undefined) submission.status = status;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();
    res.status(200).json({ success: true, message: 'Submission reviewed', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all submissions (admin)
// @route   GET /api/submissions
// @access  Private/Admin
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('task', 'title')
      .populate('student', 'name email');
    const mapped = submissions.map(sub => ({
      id: sub._id,
      taskTitle: sub.task?.title || '',
      task: sub.task ? { title: sub.task.title } : undefined,
      studentName: sub.student?.name || '',
      studentEmail: sub.student?.email || '',
      status: sub.status,
      score: sub.score,
      feedback: sub.feedback,
      description: sub.description,
      liveUrl: sub.liveUrl,
      githubUrl: sub.githubUrl,
      notes: sub.notes,
      files: sub.files,
      submittedAt: sub.submittedAt,
      reviewedAt: sub.reviewedAt,
      reviewedBy: sub.reviewedBy,
    }));
    res.status(200).json({ success: true, submissions: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { reviewSubmission, getAllSubmissions }; 