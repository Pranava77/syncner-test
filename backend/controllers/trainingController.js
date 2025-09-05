import Curriculum from '../models/Curriculum.js';
import { CAREER_TRACKS } from '../utils/constants.js';
import { normalizeCareerTrack, isValidCareerTrack, getCareerTrackErrorMessage } from '../utils/careerTrackUtils.js';
import { groupCurriculumIntoLevels } from '../utils/levelUtils.js';




// @desc    Get all levels (grouped from curriculum)
// @route   GET /api/training/levels
// @access  Private
export const getAllLevels = async (req, res) => {
  try {
    
    const { track } = req.query;
    const filter = { isActive: true };
    
    // Validate and normalize career track if provided
    if (track) {
      const normalizedTrack = normalizeCareerTrack(track);
      
      if (!isValidCareerTrack(track)) {
        return res.status(400).json({ 
          success: false, 
          message: getCareerTrackErrorMessage()
        });
      }
      
      // Use the normalized track value
      filter.careerTrack = normalizedTrack;
    }

    // Ensure deterministic ordering within a level: first by level order, then by creation time
    const curriculumItems = await Curriculum.find(filter).sort({ order: 1, createdAt: 1 });
    
    
    // Group curriculum items into levels
    let levels = [];
    if (curriculumItems && curriculumItems.length > 0) {
      levels = groupCurriculumIntoLevels(curriculumItems);
    }
    
    // Sort by order and filter active ones
    const finalLevels = levels
      .filter(level => level.isActive)
      .sort((a, b) => a.order - b.order);
    

    res.status(200).json({ success: true, data: finalLevels });
  } catch (error) {
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

    // First, try to find the curriculum item by ID
    const representativeItem = await Curriculum.findById(id);

    if (!representativeItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found' 
      });
    }


    // Find all items that constitute this level (same order and career track)
    const curriculumItems = await Curriculum.find({
      order: representativeItem.order,
      careerTrack: representativeItem.careerTrack,
      isActive: true
    }).sort({ order: 'asc' });


    if (!curriculumItems || curriculumItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active curriculum items found for this level' 
      });
    }

    // Group the items into a level
    const levels = groupCurriculumIntoLevels(curriculumItems);

    if (levels.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found' 
      });
    }

    const level = levels[0];

    res.status(200).json({ success: true, data: level });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching level',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
