import { body, param, query } from 'express-validator';
import { USER_ROLES, CAREER_TRACKS, DIFFICULTY_LEVELS } from './constants.js';

// Auth validators
export const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('college')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('College name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role')
];

export const loginValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User validators
export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('careerTrack')
    .optional()
    .isIn(Object.values(CAREER_TRACKS))
    .withMessage('Invalid career track'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('level')
    .optional()
    .isIn(Object.values(DIFFICULTY_LEVELS))
    .withMessage('Invalid level')
];

// Task validators
export const createTaskValidator = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('difficulty')
    .isIn(Object.values(DIFFICULTY_LEVELS))
    .withMessage('Invalid difficulty level'),
  body('points')
    .isInt({ min: 10, max: 1000 })
    .withMessage('Points must be between 10 and 1000'),
  body('estimatedTime')
    .trim()
    .notEmpty()
    .withMessage('Estimated time is required'),
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('At least one requirement is needed'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is needed'),
  body('careerTrack')
    .isIn(Object.values(CAREER_TRACKS))
    .withMessage('Invalid career track')
];

// Submission validators
export const submitTaskValidator = [
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Common validators
export const mongoIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];