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
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('type')
    .isIn(['syllabus', 'learn', 'test', 'exercise'])
    .withMessage('Type must be syllabus, learn, test, or exercise'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
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
router.post('/content', protect, authorize('admin'), curriculumValidation, createContentItem);
router.put('/content/:id', protect, authorize('admin'), curriculumValidation, updateContentItem);
router.delete('/content/:id', protect, authorize('admin'), deleteContentItem);

// Item routes (after bulk-order to avoid PUT /bulk-order hitting PUT /:id)
router.get('/:id', protect, authorize('admin'), getCurriculumItemById);
router.post('/', protect, authorize('admin'), curriculumValidation, createCurriculumItem);
router.put('/:id', protect, authorize('admin'), curriculumValidation, updateCurriculumItem);
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