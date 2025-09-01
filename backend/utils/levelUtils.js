/**
 * Helper function to group curriculum items into levels
 * @param {Array} items - Array of curriculum items to group
 * @returns {Array} Grouped curriculum items by level
 */
export const groupCurriculumIntoLevels = (items) => {
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
      
      // Find any existing item for this level to get the base info
      const existingItem = items.find(i => 
        i.careerTrack === item.careerTrack && 
        i.order === item.order
      );
      
      // Use syllabus item if available, otherwise use any existing item, or finally the current item
      const baseItem = syllabusItem || existingItem || item;
      
      // Create a new level with default values if no syllabus exists
      levelsMap.set(key, {
        id: baseItem._id.toString(), // Convert ObjectId to string for consistency
        title: baseItem.title || `Level ${baseItem.order}`,
        description: baseItem.description || `Level ${baseItem.order} content`,
        difficulty: baseItem.difficulty || 'beginner',
        duration: baseItem.formattedDuration || `${Math.floor(baseItem.estimatedDuration || 30) / 60}h ${(baseItem.estimatedDuration || 30) % 60}m`,
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
        isActive: baseItem.isActive !== undefined ? baseItem.isActive : true,
        estimatedHours: Math.ceil((baseItem.estimatedDuration || 30) / 60), // Convert minutes to hours, round up
        learn: [],
        test: [],
        exercise: [],
        createdAt: baseItem.createdAt || new Date(),
        updatedAt: baseItem.updatedAt || new Date()
      });
    }

    const level = levelsMap.get(key);

    // Create a clean object for each content item
    const contentItem = {
      id: item._id.toString(),
      type: item.type,
      title: item.title || '',
      content: item.content || '',
      order: item.order,
      externalLink: item.externalLink || '', // Include externalLink for learn content
      description: item.description || '',
      resources: item.resources || []
    };

    // For learn items, include external link if available
    if (item.type === 'learn' && item.externalLink) {
      contentItem.externalLink = item.externalLink;
    }

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

    // Add the content item to the appropriate section
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
  return Array.from(levelsMap.values())
    .filter(level => level.isActive)
    .sort((a, b) => a.order - b.order);
};
