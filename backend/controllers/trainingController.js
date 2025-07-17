import Level from '../models/Level.js';

// @desc    Get all levels
// @route   GET /api/training/levels
// @access  Public
const getAllLevels = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.track) {
      filter.careerTrack = req.query.track;
    }
    const levels = await Level.find(filter);
    res.status(200).json({
      success: true,
      data: levels
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get level by ID
// @route   GET /api/training/levels/:id
// @access  Public
const getLevelById = async (req, res) => {
  try {
    let level;
    if (req.params.id === 'current') {
      // Return the first active level (sorted by order or createdAt)
      level = await Level.findOne({ isActive: true }).sort({ order: 1, createdAt: 1 });
    } else {
      level = await Level.findById(req.params.id);
    }
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }
    res.status(200).json({
      success: true,
      data: level
    });
  } catch (error) {
    console.error('Get level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a new level
// @route   POST /api/training/levels
// @access  Private/Admin
const createLevel = async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      data: level
    });
  } catch (error) {
    console.error('Create level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a level
// @route   PUT /api/training/levels/:id
// @access  Private/Admin
const updateLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Level updated successfully',
      data: level
    });
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a level
// @route   DELETE /api/training/levels/:id
// @access  Private/Admin
const deleteLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndDelete(req.params.id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Level deleted successfully'
    });
  } catch (error) {
    console.error('Delete level error:', error);
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
    const { id } = req.params; // level id
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    const learnItem = req.body;
    level.learn.push(learnItem);
    await level.save();
    res.status(201).json({ success: true, message: 'Learn item added', data: level.learn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update learn item
const updateLearn = async (req, res) => {
  try {
    const { id, learnIdx } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    if (!level.learn[learnIdx]) return res.status(404).json({ success: false, message: 'Learn item not found' });
    level.learn[learnIdx] = { ...level.learn[learnIdx].toObject(), ...req.body };
    await level.save();
    res.status(200).json({ success: true, message: 'Learn item updated', data: level.learn[learnIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete learn item
const deleteLearn = async (req, res) => {
  try {
    const { id, learnIdx } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    if (!level.learn[learnIdx]) return res.status(404).json({ success: false, message: 'Learn item not found' });
    level.learn.splice(learnIdx, 1);
    await level.save();
    res.status(200).json({ success: true, message: 'Learn item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- TEST CRUD ---
const addTest = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    const testItem = req.body;
    level.test.push(testItem);
    await level.save();
    res.status(201).json({ success: true, message: 'Test item added', data: level.test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateTest = async (req, res) => {
  try {
    const { id, testIdx } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    if (!level.test[testIdx]) return res.status(404).json({ success: false, message: 'Test item not found' });
    level.test[testIdx] = { ...level.test[testIdx].toObject(), ...req.body };
    await level.save();
    res.status(200).json({ success: true, message: 'Test item updated', data: level.test[testIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteTest = async (req, res) => {
  try {
    const { id, testIdx } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    if (!level.test[testIdx]) return res.status(404).json({ success: false, message: 'Test item not found' });
    level.test.splice(testIdx, 1);
    await level.save();
    res.status(200).json({ success: true, message: 'Test item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- EXERCISE CRUD ---
const addExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    const exerciseItem = req.body;
    level.exercise.push(exerciseItem);
    await level.save();
    res.status(201).json({ success: true, message: 'Exercise item added', data: level.exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateExercise = async (req, res) => {
  try {
    const { id, exerciseIdx } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    if (!level.exercise[exerciseIdx]) return res.status(404).json({ success: false, message: 'Exercise item not found' });
    level.exercise[exerciseIdx] = { ...level.exercise[exerciseIdx].toObject(), ...req.body };
    await level.save();
    res.status(200).json({ success: true, message: 'Exercise item updated', data: level.exercise[exerciseIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteExercise = async (req, res) => {
  try {
    const { id, exerciseIdx } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    if (!level.exercise[exerciseIdx]) return res.status(404).json({ success: false, message: 'Exercise item not found' });
    level.exercise.splice(exerciseIdx, 1);
    await level.save();
    res.status(200).json({ success: true, message: 'Exercise item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAllLevels,
  getLevelById,
  createLevel,
  updateLevel,
  deleteLevel,
  addLearn, updateLearn, deleteLearn,
  addTest, updateTest, deleteTest,
  addExercise, updateExercise, deleteExercise
}; 