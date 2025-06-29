import Resume from '../models/Resume.js';

// @desc    Get user resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create or update resume
// @route   POST /api/resume
// @access  Private
const upsertResume = async (req, res) => {
  try {
    const resumeData = { ...req.body, user: req.user.id };
    
    const resume = await Resume.findOneAndUpdate(
      { user: req.user.id },
      resumeData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Resume saved successfully',
      data: resume
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getResume,
  upsertResume
}; 