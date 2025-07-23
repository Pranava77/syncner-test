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
        id: item._id.toString(), // Convert ObjectId to string for consistency
        title: item.title,
        description: item.description,
        difficulty: item.difficulty,
        duration: item.formattedDuration || `${Math.floor(item.estimatedDuration / 60)}h ${item.estimatedDuration % 60}m`,
        careerTrack: item.careerTrack,
        skills: item.tags || [], // Map tags to skills
        prerequisites: item.prerequisites || [],
        order: item.order,
        isActive: item.isActive,
        estimatedHours: Math.ceil(item.estimatedDuration / 60), // Convert minutes to hours, round up
        learn: [],
        test: [],
        exercise: [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }

    const level = levelsMap.get(key);

    // Create a clean object for each content item
    const contentItem = {
      type: item.type,
      title: item.title,
      content: item.content,
      order: item.order,
      videoUrl: item.videoUrl,
      description: item.description,
      resources: item.resources || []
    };

    // For test items, parse the content to extract options and answer
    if (item.type === 'test') {
      const lines = item.content.split('\n');
      const question = lines[0];
      const options = [];
      let answer = '';
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
          options.push(line.substring(2).trim());
        } else if (line.startsWith('Answer:') || line.startsWith('Correct Answer:')) {
          answer = line.split(':')[1]?.trim() || '';
        }
      }
      
      contentItem.question = question;
      contentItem.options = options;
      contentItem.answer = answer || 'A'; // Default to A if no answer specified
    }

    switch (item.type) {
      case 'learn':
        level.learn.push(contentItem);
        break;
      case 'test':
        level.test.push(contentItem);
        break;
      case 'exercise':
        level.exercise.push(contentItem);
        break;
      default:
        break;
    }
  });

  // Sort levels by order and filter active ones
  const levels = Array.from(levelsMap.values())
    .filter(level => level.isActive)
    .sort((a, b) => a.order - b.order);

  console.log('Grouped levels:', levels.map(l => ({
    id: l.id,
    title: l.title,
    careerTrack: l.careerTrack,
    order: l.order,
    learnCount: l.learn.length,
    testCount: l.test.length,
    exerciseCount: l.exercise.length
  })));

  return levels;
};

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
    
    console.log(`Found ${curriculumItems.length} curriculum items for filter:`, filter);
    
    if (!curriculumItems || curriculumItems.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: 'No curriculum items found for the specified criteria' 
      });
    }
    
    const levels = groupCurriculumIntoLevels(curriculumItems);
    console.log(`Grouped into ${levels.length} levels:`, levels.map(l => ({ id: l.id, title: l.title, careerTrack: l.careerTrack })));

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

    // Find all items that constitute this level (same title and career track)
    const curriculumItems = await Curriculum.find({
      title: representativeItem.title,
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
