import Curriculum from '../models/Curriculum.js';
import { validationResult } from 'express-validator';

// @desc    Get all curriculum items
// @route   GET /api/curriculum
// @access  Private/Admin
const getAllCurriculumItems = async (req, res) => {
  try {
    const { type, careerTrack, isActive, search, sortBy = 'order', sortOrder = 'asc' } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (careerTrack) filter.careerTrack = careerTrack;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    let query = Curriculum.find(filter);
    
    // Text search
    if (search) {
      query = query.find({
        $text: { $search: search }
      });
    }
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);
    
    // Populate user information
    query = query.populate('metadata.createdBy', 'name email')
                 .populate('metadata.lastModifiedBy', 'name email');
    
    const curriculumItems = await query.exec();
    
    res.status(200).json({
      success: true,
      count: curriculumItems.length,
      data: curriculumItems
    });
  } catch (error) {
    console.error('Get curriculum items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get curriculum item by ID
// @route   GET /api/curriculum/:id
// @access  Private/Admin
const getCurriculumItemById = async (req, res) => {
  try {
    const curriculumItem = await Curriculum.findById(req.params.id)
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastModifiedBy', 'name email');
    
    if (!curriculumItem) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: curriculumItem
    });
  } catch (error) {
    console.error('Get curriculum item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new curriculum item
// @route   POST /api/curriculum
// @access  Private/Admin
const createCurriculumItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      title,
      description,
      type,
      content,
      order,
      isActive = true,
      careerTrack,
      difficulty = 'beginner',
      estimatedDuration = 30,
      tags = [],
      prerequisites = [],
      learningObjectives = [],
      resources = []
    } = req.body;
    
    // Set metadata
    const metadata = {
      createdBy: req.user.id,
      version: 1
    };
    
    const curriculumItem = await Curriculum.create({
      title,
      description,
      type,
      content,
      order,
      isActive,
      careerTrack,
      difficulty,
      estimatedDuration,
      tags,
      prerequisites,
      learningObjectives,
      resources,
      metadata
    });
    
    await curriculumItem.populate('metadata.createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Curriculum item created successfully',
      data: curriculumItem
    });
  } catch (error) {
    console.error('Create curriculum item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update curriculum item
// @route   PUT /api/curriculum/:id
// @access  Private/Admin
const updateCurriculumItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const curriculumItem = await Curriculum.findById(req.params.id);
    
    if (!curriculumItem) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum item not found'
      });
    }
    
    // Update metadata
    req.body.metadata = {
      ...curriculumItem.metadata,
      lastModifiedBy: req.user.id
    };
    
    const updatedItem = await Curriculum.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('metadata.createdBy', 'name email')
     .populate('metadata.lastModifiedBy', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Curriculum item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update curriculum item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete curriculum item
// @route   DELETE /api/curriculum/:id
// @access  Private/Admin
const deleteCurriculumItem = async (req, res) => {
  try {
    const curriculumItem = await Curriculum.findById(req.params.id);
    
    if (!curriculumItem) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum item not found'
      });
    }
    
    await Curriculum.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Curriculum item deleted successfully'
    });
  } catch (error) {
    console.error('Delete curriculum item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get curriculum statistics
// @route   GET /api/curriculum/stats
// @access  Private/Admin
const getCurriculumStats = async (req, res) => {
  try {
    const stats = await Curriculum.getStatistics();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get curriculum stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get curriculum by type and career track
// @route   GET /api/curriculum/type/:type/track/:careerTrack
// @access  Private
const getCurriculumByTypeAndTrack = async (req, res) => {
  try {
    const { type, careerTrack } = req.params;
    const { includeInactive = false } = req.query;
    
    const curriculumItems = await Curriculum.getByTypeAndTrack(type, careerTrack, { includeInactive });
    
    res.status(200).json({
      success: true,
      count: curriculumItems.length,
      data: curriculumItems
    });
  } catch (error) {
    console.error('Get curriculum by type and track error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update curriculum order
// @route   PUT /api/curriculum/bulk-order
// @access  Private/Admin
const updateCurriculumOrder = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    const updatePromises = items.map(item => 
      Curriculum.findByIdAndUpdate(item.id, { order: item.order })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Curriculum order updated successfully'
    });
  } catch (error) {
    console.error('Update curriculum order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle curriculum item active status
// @route   PATCH /api/curriculum/:id/toggle
// @access  Private/Admin
const toggleCurriculumStatus = async (req, res) => {
  try {
    const curriculumItem = await Curriculum.findById(req.params.id);
    
    if (!curriculumItem) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum item not found'
      });
    }
    
    curriculumItem.isActive = !curriculumItem.isActive;
    curriculumItem.metadata.lastModifiedBy = req.user.id;
    
    await curriculumItem.save();
    
    await curriculumItem.populate('metadata.createdBy', 'name email')
                      .populate('metadata.lastModifiedBy', 'name email');
    
    res.status(200).json({
      success: true,
      message: `Curriculum item ${curriculumItem.isActive ? 'activated' : 'deactivated'} successfully`,
      data: curriculumItem
    });
  } catch (error) {
    console.error('Toggle curriculum status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  getAllCurriculumItems,
  getCurriculumItemById,
  createCurriculumItem,
  updateCurriculumItem,
  deleteCurriculumItem,
  getCurriculumStats,
  getCurriculumByTypeAndTrack,
  updateCurriculumOrder,
  toggleCurriculumStatus
}; 