import Track from '../models/Track.js';

// @desc    Get all tracks
// @route   GET /api/tracks
// @access  Public
const getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ isActive: true }).populate('levels');
    
    res.status(200).json({
      success: true,
      data: tracks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get track by ID
// @route   GET /api/tracks/:id
// @access  Public
const getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate('levels');
    
    if (!track) {
      return res.status(404).json({
        success: false,
        message: 'Track not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: track
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getAllTracks,
  getTrackById
}; 