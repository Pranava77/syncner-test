import Curriculum from '../models/Curriculum.js';
import { CAREER_TRACKS } from '../utils/constants.js';

// Helper function to group curriculum items into levels
const groupCurriculumIntoLevels = (items) => {
  const levelsMap = new Map();

  items.forEach(item => {
    // Use a composite key to uniquely identify a level
    const key = `${item.careerTrack}_${item.title}`.toLowerCase();

    if (!levelsMap.has(key)) {
      levelsMap.set(key, {
        id: item._id, // Use the first item's ID as the level's ID
        title: item.title,
        description: item.description,
        difficulty: item.difficulty,
        duration: item.formattedDuration, // Assuming a virtual or method exists
        careerTrack: item.careerTrack,
        skills: item.tags, // Map tags to skills
        prerequisites: item.prerequisites,
        order: item.order,
        isActive: item.isActive,
        estimatedHours: item.estimatedDuration / 60, // Convert minutes to hours
        learn: [],
        test: [],
        exercise: [],
      });
    }

    const level = levelsMap.get(key);

    switch (item.type) {
      case 'learn':
        level.learn.push({ ...item.toObject() });
        break;
      case 'test':
        level.test.push({ ...item.toObject() });
        break;
      case 'exercise':
        level.exercise.push({ ...item.toObject() });
        break;
      default:
        break;
    }
  });

  return Array.from(levelsMap.values());
};

// @desc    Get all levels (grouped from curriculum)
// @route   GET /api/training/levels
// @access  Private
export const getAllLevels = async (req, res) => {
  try {
    const { track } = req.query;
    const filter = { isActive: true };
    
    // Validate career track if provided
    if (track && !Object.values(CAREER_TRACKS).includes(track)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid career track. Must be one of: full-stack, ai-ml, ui-ux, data-science' 
      });
    }
    
    if (track) {
      filter.careerTrack = track;
    }

    const curriculumItems = await Curriculum.find(filter).sort({ order: 'asc' });
    
    if (!curriculumItems || curriculumItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No curriculum items found for the specified criteria' 
      });
    }
    
    const levels = groupCurriculumIntoLevels(curriculumItems);

    res.status(200).json({ success: true, data: levels });
  } catch (error) {
    console.error('Get all levels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching levels',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get a single level by its representative ID
// @route   GET /api/training/levels/:id
// @access  Private
export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Level ID is required' 
      });
    }

    const representativeItem = await Curriculum.findById(id);

    if (!representativeItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found' 
      });
    }

    // Find all items that constitute this level
    const curriculumItems = await Curriculum.find({
      title: representativeItem.title,
      careerTrack: representativeItem.careerTrack,
      isActive: true
    });

    if (!curriculumItems || curriculumItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active curriculum items found for this level' 
      });
    }

    const levels = groupCurriculumIntoLevels(curriculumItems);

    if (levels.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found' 
      });
    }

    res.status(200).json({ success: true, data: levels[0] });
  } catch (error) {
    console.error('Get level by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching level',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
