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

export { reviewSubmission }; 