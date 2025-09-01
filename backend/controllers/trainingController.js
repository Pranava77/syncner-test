import Curriculum from '../models/Curriculum.js';
import { CAREER_TRACKS } from '../utils/constants.js';
import { normalizeCareerTrack, isValidCareerTrack, getCareerTrackErrorMessage } from '../utils/careerTrackUtils.js';
import { groupCurriculumIntoLevels } from '../utils/levelUtils.js';




// @desc    Get all levels (grouped from curriculum)
// @route   GET /api/training/levels
// @access  Private
export const getAllLevels = async (req, res) => {
  try {
    console.log('Training controller: getAllLevels called');
    console.log('Training controller: User:', req.user);
    console.log('Training controller: Query params:', req.query);
    
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
    
    console.log(`Found ${curriculumItems.length} curriculum items for filter:`, filter);
    
    // Group curriculum items into levels
    let levels = [];
    if (curriculumItems && curriculumItems.length > 0) {
      levels = groupCurriculumIntoLevels(curriculumItems);
      console.log(`Grouped into ${levels.length} levels from curriculum items`);
    }
    
    // Sort by order and filter active ones
    const finalLevels = levels
      .filter(level => level.isActive)
      .sort((a, b) => a.order - b.order);
    
    console.log(`Final result: ${finalLevels.length} levels:`, finalLevels.map(l => ({ id: l.id, title: l.title, careerTrack: l.careerTrack })));

    res.status(200).json({ success: true, data: finalLevels });
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
    console.log('Training controller: getLevelById called with ID:', req.params.id);
    
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
      console.log('Training controller: No curriculum item found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found' 
      });
    }

    console.log('Training controller: Found representative item:', {
      id: representativeItem._id,
      title: representativeItem.title,
      careerTrack: representativeItem.careerTrack,
      type: representativeItem.type
    });

    // Find all items that constitute this level (same order and career track)
    const curriculumItems = await Curriculum.find({
      order: representativeItem.order,
      careerTrack: representativeItem.careerTrack,
      isActive: true
    }).sort({ order: 'asc' });

    console.log('Training controller: Found curriculum items for level:', curriculumItems.length);

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
    console.log('Training controller: Returning level:', {
      id: level.id,
      title: level.title,
      careerTrack: level.careerTrack,
      learnCount: level.learn.length,
      testCount: level.test.length,
      exerciseCount: level.exercise.length
    });

    res.status(200).json({ success: true, data: level });
  } catch (error) {
    console.error('Get level by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching level',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
