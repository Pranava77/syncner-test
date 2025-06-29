import Module from '../models/Module.js';

// @desc    Get all modules
// @route   GET /api/training/modules
// @access  Public
const getAllModules = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.track) {
      filter.careerTrack = req.query.track;
    }
    const modules = await Module.find(filter);
    res.status(200).json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get module by ID
// @route   GET /api/training/modules/:id
// @access  Public
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findOne({ id: req.params.id });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getAllModules,
  getModuleById
}; 