import Curriculum from '../models/Curriculum.js';
import { CAREER_TRACKS } from '../utils/constants.js';
import { normalizeCareerTrack, isValidCareerTrack, getCareerTrackErrorMessage } from '../utils/careerTrackUtils.js';

// Helper function to group curriculum items into levels
const groupCurriculumIntoLevels = (items) => {
  const levelsMap = new Map();

  items.forEach(item => {
    // Use order and career track as the key to group items by level
    const key = `${item.careerTrack}_${item.order}`;

    if (!levelsMap.has(key)) {
      // Find the syllabus item for this level to get the base title and description
      const syllabusItem = items.find(i => 
        i.careerTrack === item.careerTrack && 
        i.order === item.order && 
        i.type === 'syllabus'
      );
      
      // Use syllabus item if available, otherwise use the current item
      const baseItem = syllabusItem || item;
      
      levelsMap.set(key, {
        id: baseItem._id.toString(), // Convert ObjectId to string for consistency
        title: baseItem.title,
        description: baseItem.description,
        difficulty: baseItem.difficulty,
        duration: baseItem.formattedDuration || `${Math.floor(baseItem.estimatedDuration / 60)}h ${baseItem.estimatedDuration % 60}m`,
        careerTrack: baseItem.careerTrack,
        skills: baseItem.tags || [], // Map tags to skills
        prerequisites: baseItem.prerequisites || [],
        readFirst: baseItem.readFirst || {
          brief: '',
          whyLearn: '',
          whereUsed: '',
          customExample: ''
        },
        order: baseItem.order,
        isActive: baseItem.isActive,
        estimatedHours: Math.ceil(baseItem.estimatedDuration / 60), // Convert minutes to hours, round up
        learn: [],
        test: [],
        exercise: [],
        createdAt: baseItem.createdAt,
        updatedAt: baseItem.updatedAt
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

    // For exercise items, process resources properly
    if (item.type === 'exercise') {
      // Convert resources to the format expected by frontend
      if (item.resources && Array.isArray(item.resources)) {
        contentItem.resources = item.resources.map(resource => {
          if (typeof resource === 'string') {
            return resource;
          } else if (resource && typeof resource === 'object') {
            // If it's an object with title and url, format it as a string
            return resource.title ? `${resource.title}: ${resource.url || resource.description || ''}` : resource.url || resource.description || '';
          }
          return String(resource);
        });
      }
    }

    // For test items, parse the content to extract options and answer
    if (item.type === 'test') {
      console.log('Parsing test content:', item.content);
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
      
      console.log('Parsed test item:', {
        question: contentItem.question,
        options: contentItem.options,
        answer: contentItem.answer
      });
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
      case 'syllabus':
        // Syllabus items are used as base for the level, not added to content arrays
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
  
  console.log('Grouping debug - Input items:', items.map(item => ({
    id: item._id,
    title: item.title,
    type: item.type,
    order: item.order,
    careerTrack: item.careerTrack
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

    const curriculumItems = await Curriculum.find(filter).sort({ order: 'asc' });
    
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
