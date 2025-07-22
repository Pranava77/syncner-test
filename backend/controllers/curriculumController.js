import Curriculum from '../models/Curriculum.js';
import { validationResult } from 'express-validator';

// @desc    Get all curriculum items
// @route   GET /api/curriculum
// @access  Private/Admin
const getAllCurriculumItems = async (req, res) => {
  try {
    const { careerTrack, isActive, search, sortBy = 'order', sortOrder = 'asc' } = req.query;
    
    const filter = {};
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

// --- LEARN CRUD ---
// Add learn item
const addLearn = async (req, res) => {
  try {
    const { id } = req.params; // curriculum id
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    const learnItem = req.body;
    curriculum.learn.push(learnItem);
    await curriculum.save();
    res.status(201).json({ success: true, message: 'Learn item added', data: curriculum.learn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update learn item
const updateLearn = async (req, res) => {
  try {
    const { id, learnIdx } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    if (!curriculum.learn[learnIdx]) return res.status(404).json({ success: false, message: 'Learn item not found' });
    curriculum.learn[learnIdx] = { ...curriculum.learn[learnIdx].toObject(), ...req.body };
    await curriculum.save();
    res.status(200).json({ success: true, message: 'Learn item updated', data: curriculum.learn[learnIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete learn item
const deleteLearn = async (req, res) => {
  try {
    const { id, learnIdx } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    if (!curriculum.learn[learnIdx]) return res.status(404).json({ success: false, message: 'Learn item not found' });
    curriculum.learn.splice(learnIdx, 1);
    await curriculum.save();
    res.status(200).json({ success: true, message: 'Learn item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- TEST CRUD ---
const addTest = async (req, res) => {
  try {
    const { id } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    const testItem = req.body;
    curriculum.test.push(testItem);
    await curriculum.save();
    res.status(201).json({ success: true, message: 'Test item added', data: curriculum.test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateTest = async (req, res) => {
  try {
    const { id, testIdx } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    if (!curriculum.test[testIdx]) return res.status(404).json({ success: false, message: 'Test item not found' });
    curriculum.test[testIdx] = { ...curriculum.test[testIdx].toObject(), ...req.body };
    await curriculum.save();
    res.status(200).json({ success: true, message: 'Test item updated', data: curriculum.test[testIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteTest = async (req, res) => {
  try {
    const { id, testIdx } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    if (!curriculum.test[testIdx]) return res.status(404).json({ success: false, message: 'Test item not found' });
    curriculum.test.splice(testIdx, 1);
    await curriculum.save();
    res.status(200).json({ success: true, message: 'Test item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- EXERCISE CRUD ---
const addExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    const exerciseItem = req.body;
    curriculum.exercise.push(exerciseItem);
    await curriculum.save();
    res.status(201).json({ success: true, message: 'Exercise item added', data: curriculum.exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateExercise = async (req, res) => {
  try {
    const { id, exerciseIdx } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    if (!curriculum.exercise[exerciseIdx]) return res.status(404).json({ success: false, message: 'Exercise item not found' });
    curriculum.exercise[exerciseIdx] = { ...curriculum.exercise[exerciseIdx].toObject(), ...req.body };
    await curriculum.save();
    res.status(200).json({ success: true, message: 'Exercise item updated', data: curriculum.exercise[exerciseIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteExercise = async (req, res) => {
  try {
    const { id, exerciseIdx } = req.params;
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    if (!curriculum.exercise[exerciseIdx]) return res.status(404).json({ success: false, message: 'Exercise item not found' });
    curriculum.exercise.splice(exerciseIdx, 1);
    await curriculum.save();
    res.status(200).json({ success: true, message: 'Exercise item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAllCurriculumItems,
  getCurriculumItemById,
  createCurriculumItem,
  updateCurriculumItem,
  deleteCurriculumItem,
  addLearn, updateLearn, deleteLearn,
  addTest, updateTest, deleteTest,
  addExercise, updateExercise, deleteExercise
}; 