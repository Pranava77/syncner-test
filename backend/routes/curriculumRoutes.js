import express from 'express';
import { body } from 'express-validator';
import {
  getAllCurriculumItems,
  getCurriculumItemById,
  createCurriculumItem,
  updateCurriculumItem,
  deleteCurriculumItem,
  getCurriculumStats,
  getCurriculumByTypeAndTrack,
  updateCurriculumOrder,
  toggleCurriculumStatus,
  getContentByType,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  invalidateCache
} from '../controllers/curriculumController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const curriculumValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('type')
    .isIn(['syllabus', 'learn', 'test', 'exercise'])
    .withMessage('Type must be syllabus, learn, test, or exercise'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('externalLink')
    .optional()
    .isURL()
    .withMessage('External link must be a valid URL'),
  body('careerTrack')
    .isIn(['full-stack', 'ai-ml', 'ui-ux', 'data-science'])
    .withMessage('Career track must be full-stack, ai-ml, ui-ux, or data-science'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Estimated duration must be between 1 and 1440 minutes'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  body('learningObjectives')
    .optional()
    .isArray()
    .withMessage('Learning objectives must be an array'),
  body('readFirst')
    .optional()
    .isObject()
    .withMessage('Read first must be an object'),
  body('readFirst.brief')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Brief must be between 1 and 500 characters'),
  body('readFirst.whyLearn')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Why learn must be between 1 and 500 characters'),
  body('readFirst.whereUsed')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Where used must be between 1 and 500 characters'),
  body('readFirst.customExample')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Custom example must be between 1 and 1000 characters'),
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  body('resources.*.title')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Resource title is required'),
  body('resources.*.type')
    .optional()
    .isIn(['video', 'article', 'document', 'external'])
    .withMessage('Resource type must be video, article, document, or external')
];

// Custom validation for different content types
const customContentValidation = (req, res, next) => {
  const { type, content, question, options, answer, description, externalLink } = req.body;
  
  // Debug logging
  console.log('Custom validation - Request body:', req.body);
  console.log('Custom validation - Type:', type);
  console.log('Custom validation - Content:', content);
  
  if (type === 'learn') {
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Learn content must be at least 10 characters'
      });
    }
    // Validate external link if provided
    if (externalLink && externalLink.trim()) {
      try {
        new URL(externalLink);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'External link must be a valid URL'
        });
      }
    }
  } else if (type === 'test') {
    console.log('Custom validation - Processing test type');
    console.log('Custom validation - Test content:', content);
    
    // For test items, validate that content contains the required structure
    if (!content || content.trim().length < 10) {
      console.log('Custom validation - Test content too short:', content?.length || 0);
      return res.status(400).json({
        success: false,
        message: 'Test content must be at least 10 characters'
      });
    }
    
    // Check if content contains question and options structure
    const lines = content.split('\n');
    const question = lines[0];
    console.log('Custom validation - Test question:', question);
    console.log('Custom validation - Test lines:', lines);
    
    if (!question || question.trim().length < 5) {
      console.log('Custom validation - Test question too short:', question?.length || 0);
      return res.status(400).json({
        success: false,
        message: 'Test question must be at least 5 characters'
      });
    }
    
    // Check if content has at least 2 options (A) and (B)
    const hasOptions = lines.some(line => 
      line.trim().startsWith('A)') || line.trim().startsWith('B)')
    );
    console.log('Custom validation - Has options:', hasOptions);
    
    if (!hasOptions) {
      console.log('Custom validation - Missing options');
      return res.status(400).json({
        success: false,
        message: 'Test must have at least 2 options (A and B)'
      });
    }
    
    console.log('Custom validation - Test validation passed');
  } else if (type === 'exercise') {
    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Exercise description must be at least 10 characters'
      });
    }
  }
  
  next();
};

// Public routes (for students to view curriculum)
router.get('/type/:type/track/:careerTrack', protect, getCurriculumByTypeAndTrack);

// Admin routes
router.get('/', protect, authorize('admin'), getAllCurriculumItems);
router.get('/stats', protect, authorize('admin'), getCurriculumStats);
router.post('/invalidate-cache', protect, authorize('admin'), invalidateCache);

// Bulk operations MUST come before parameterized ':id' routes to avoid conflicts
router.put('/bulk-order', protect, authorize('admin'), [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.id').isMongoId().withMessage('Invalid item ID'),
  body('items.*.order').isInt({ min: 1 }).withMessage('Order must be a positive integer')
], updateCurriculumOrder);

// Bulk delete all items for a level (track + order)
import { deleteLevelByTrackAndOrder } from '../controllers/curriculumController.js';
import { reorderLevelsByTrack } from '../controllers/curriculumController.js';
router.delete('/level', protect, authorize('admin'), deleteLevelByTrackAndOrder);
router.put('/level/reorder', protect, authorize('admin'), reorderLevelsByTrack);

// Content-specific routes
router.get('/content/:type', protect, authorize('admin'), getContentByType);
router.get('/content/:type/track/:careerTrack', protect, authorize('admin'), getContentByType);
router.post('/content', protect, authorize('admin'), curriculumValidation, customContentValidation, createContentItem);
router.put('/content/:id', protect, authorize('admin'), curriculumValidation, customContentValidation, updateContentItem);
router.delete('/content/:id', protect, authorize('admin'), deleteContentItem);

// Item routes (after bulk-order to avoid PUT /bulk-order hitting PUT /:id)
router.get('/:id', protect, authorize('admin'), getCurriculumItemById);
router.post('/', protect, authorize('admin'), curriculumValidation, customContentValidation, createCurriculumItem);
router.put('/:id', protect, authorize('admin'), curriculumValidation, customContentValidation, updateCurriculumItem);
router.delete('/:id', protect, authorize('admin'), deleteCurriculumItem);

router.patch('/:id/toggle', protect, authorize('admin'), toggleCurriculumStatus);

// Health check for curriculum module
router.get('/health', async (req, res) => {
  try {
    const Curriculum = (await import('../models/Curriculum.js')).default;
    await Curriculum.findOne();
    res.status(200).json({ success: true, message: 'Curriculum service is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Curriculum module health check failed', error: error.message });
  }
});

export default router; 