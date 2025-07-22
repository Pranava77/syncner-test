import express from 'express';
import { body } from 'express-validator';
import {
  getAllCurriculumItems,
  getCurriculumItemById,
  createCurriculumItem,
  updateCurriculumItem,
  deleteCurriculumItem,
  addLearn,
  updateLearn,
  deleteLearn,
  addTest,
  updateTest,
  deleteTest,
  addExercise,
  updateExercise,
  deleteExercise
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
router.get('/', getAllCurriculumItems);
router.get('/:id', getCurriculumItemById);

// Admin routes
router.post('/', protect, authorize('admin'), curriculumValidation, createCurriculumItem);
router.put('/:id', protect, authorize('admin'), curriculumValidation, updateCurriculumItem);
router.delete('/:id', protect, authorize('admin'), deleteCurriculumItem);

// Content routes
router.post('/:id/learn', protect, authorize('admin'), addLearn);
router.put('/:id/learn/:learnIdx', protect, authorize('admin'), updateLearn);
router.delete('/:id/learn/:learnIdx', protect, authorize('admin'), deleteLearn);

router.post('/:id/test', protect, authorize('admin'), addTest);
router.put('/:id/test/:testIdx', protect, authorize('admin'), updateTest);
router.delete('/:id/test/:testIdx', protect, authorize('admin'), deleteTest);

router.post('/:id/exercise', protect, authorize('admin'), addExercise);
router.put('/:id/exercise/:exerciseIdx', protect, authorize('admin'), updateExercise);
router.delete('/:id/exercise/:exerciseIdx', protect, authorize('admin'), deleteExercise);


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