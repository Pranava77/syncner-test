import Module from '../models/Module.js';

// @desc    Get all modules
// @route   GET /api/training
// @access  Public
const getAllModules = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.track) {
      filter.careerTrack = req.query.track;
    }
    const modules = await Module.find(filter);
    // Convert _id to id for each module
    const modulesWithId = modules.map(module => {
      const obj = module.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });
    res.status(200).json({
      success: true,
      data: modulesWithId
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
// @route   GET /api/training/:id
// @access  Public
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    const obj = module.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(200).json({
      success: true,
      data: obj
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a new module
// @route   POST /api/training
// @access  Private/Admin
const createModule = async (req, res) => {
  try {
    const moduleData = {
      ...req.body,
      id: `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const module = await Module.create(moduleData);
    const obj = module.toObject();
    obj.id = obj._id;
    delete obj._id;
    
    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: obj
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a module
// @route   PUT /api/training/:id
// @access  Private/Admin
const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    const obj = module.toObject();
    obj.id = obj._id;
    delete obj._id;
    
    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: obj
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a module
// @route   DELETE /api/training/:id
// @access  Private/Admin
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
}; 