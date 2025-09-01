/**
 * Helper function to group curriculum items into levels
 * @param {Array} items - Array of curriculum items to group
 * @returns {Array} Grouped curriculum items by level
 */
export const groupCurriculumIntoLevels = (items) => {
  // Group items by level order
  const levelGroups = items.reduce((groups, item) => {
    const order = item.order || 1;
    if (!groups[order]) {
      groups[order] = {
        order,
        title: `Level ${order}`,
        description: '',
        learn: [],
        test: [],
        exercise: [],
        isActive: true
      };
    }
    
    // Add item to appropriate section based on type
    switch (item.type) {
      case 'learn':
        groups[order].learn.push(item);
        break;
      case 'test':
        groups[order].test.push(item);
        break;
      case 'exercise':
        groups[order].exercise.push(item);
        break;
      default:
        break;
    }
    
    return groups;
  }, {});

  // Convert groups object to array and sort by order
  return Object.values(levelGroups).sort((a, b) => a.order - b.order);
};

/**
 * Helper function to validate curriculum item structure
 * @param {Object} item - Curriculum item to validate
 * @returns {boolean} Whether the item is valid
 */
export const validateCurriculumItem = (item) => {
  const requiredFields = ['title', 'type', 'order'];
  return requiredFields.every(field => item[field] !== undefined);
};

/**
 * Helper function to normalize curriculum item data
 * @param {Object} item - Curriculum item to normalize
 * @returns {Object} Normalized curriculum item
 */
export const normalizeCurriculumItem = (item) => {
  return {
    ...item,
    order: Number(item.order) || 1,
    type: item.type?.toLowerCase(),
    isActive: item.isActive !== false
  };
};
