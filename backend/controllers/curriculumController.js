import Curriculum from '../models/Curriculum.js';
import { validationResult } from 'express-validator';
import { normalizeCareerTrack } from '../utils/careerTrackUtils.js';

// @desc    Get all curriculum items
// @route   GET /api/curriculum
// @access  Private/Admin
const getAllCurriculumItems = async (req, res) => {
  try {
    const { type, careerTrack, isActive, search, sortBy = 'order', sortOrder = 'asc' } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (careerTrack) {
      // Normalize the career track value
      filter.careerTrack = normalizeCareerTrack(careerTrack);
    }
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
      readFirst = {},
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
      readFirst,
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

// @desc    Invalidate curriculum cache
// @route   POST /api/curriculum/invalidate-cache
// @access  Private/Admin
const invalidateCache = async (req, res) => {
  try {
    // This endpoint can be used to clear any server-side caches
    // For now, we'll just return success as the main cache clearing happens on the frontend
    
    res.status(200).json({
      success: true,
      message: 'Cache invalidation request received'
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while invalidating cache'
    });
  }
};

// @desc    Delete all curriculum items for a level (by track + order)
// @route   DELETE /api/curriculum/level
// @access  Private/Admin
const deleteLevelByTrackAndOrder = async (req, res) => {
  try {
    const { careerTrack, order } = req.query;

    if (!careerTrack || !order) {
      return res.status(400).json({
        success: false,
        message: 'careerTrack and order are required query parameters'
      });
    }

    const normalizedCareerTrack = normalizeCareerTrack(careerTrack);
    const levelOrder = parseInt(order, 10);
    if (Number.isNaN(levelOrder) || levelOrder < 1) {
      return res.status(400).json({
        success: false,
        message: 'order must be a positive integer'
      });
    }

    // Delete all items for this level (any type) in the specified track and order
    const result = await Curriculum.deleteMany({
      careerTrack: normalizedCareerTrack,
      order: levelOrder,
    });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `Deleted ${result.deletedCount || 0} items for track ${normalizedCareerTrack} level order ${levelOrder}`
    });
  } catch (error) {
    console.error('Bulk delete level by track+order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting level content'
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
    
    // Normalize the career track value
    const normalizedCareerTrack = normalizeCareerTrack(careerTrack);
    
    const curriculumItems = await Curriculum.getByTypeAndTrack(type, normalizedCareerTrack, { includeInactive });
    
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

// @desc    Get content by type and track
// @route   GET /api/curriculum/content/:type
// @access  Private/Admin
const getContentByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { careerTrack, levelTitle, sortBy = 'order', sortOrder = 'asc' } = req.query;
    
    const filter = { type };
    if (careerTrack) {
      // Normalize the career track value
      filter.careerTrack = normalizeCareerTrack(careerTrack);
    }
    if (levelTitle) filter.title = levelTitle;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const content = await Curriculum.find(filter)
      .sort(sortOptions)
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastModifiedBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    console.error('Get content by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create content item
// @route   POST /api/curriculum/content
// @access  Private/Admin
const createContentItem = async (req, res) => {
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
      type,
      content,
      careerTrack,
      difficulty,
      order = 1,
      isActive = true,
      videoUrl,
      resources
    } = req.body;
    
    const curriculumItem = new Curriculum({
      title,
      type,
      content,
      careerTrack,
      difficulty,
      order,
      isActive,
      videoUrl,
      resources,
      metadata: {
        createdBy: req.user.id,
        createdAt: new Date(),
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      }
    });
    
    await curriculumItem.save();
    
    res.status(201).json({
      success: true,
      data: curriculumItem
    });
  } catch (error) {
    console.error('Create content item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update content item
// @route   PUT /api/curriculum/content/:id
// @access  Private/Admin
const updateContentItem = async (req, res) => {
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
        message: 'Content item not found'
      });
    }
    
    const {
      title,
      content,
      order,
      isActive,
      videoUrl,
      resources
    } = req.body;
    
    curriculumItem.title = title || curriculumItem.title;
    curriculumItem.content = content || curriculumItem.content;
    curriculumItem.order = order || curriculumItem.order;
    curriculumItem.isActive = isActive !== undefined ? isActive : curriculumItem.isActive;
    curriculumItem.videoUrl = videoUrl || curriculumItem.videoUrl;
    curriculumItem.resources = resources || curriculumItem.resources;
    curriculumItem.metadata.lastModifiedBy = req.user.id;
    curriculumItem.metadata.lastModifiedAt = new Date();
    
    await curriculumItem.save();
    
    res.status(200).json({
      success: true,
      data: curriculumItem
    });
  } catch (error) {
    console.error('Update content item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete content item
// @route   DELETE /api/curriculum/content/:id
// @access  Private/Admin
const deleteContentItem = async (req, res) => {
  try {
    const curriculumItem = await Curriculum.findById(req.params.id);
    
    if (!curriculumItem) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }
    
    await curriculumItem.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Content item deleted successfully'
    });
  } catch (error) {
    console.error('Delete content item error:', error);
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
  invalidateCache,
  deleteLevelByTrackAndOrder,
  deleteCurriculumItem,
  getCurriculumStats,
  getCurriculumByTypeAndTrack,
  updateCurriculumOrder,
  toggleCurriculumStatus,
  getContentByType,
  createContentItem,
  updateContentItem,
  deleteContentItem
}; 