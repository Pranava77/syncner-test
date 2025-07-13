import express from 'express';
import { body } from 'express-validator';
import { getAllStaff, getStaffById, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const staffValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('role').trim().notEmpty().withMessage('Role is required').isIn(['admin', 'teacher', 'staff']).withMessage('Role must be admin, teacher, or staff'),
];

// GET /api/staff - List all staff (public or protected)
router.get('/', protect, getAllStaff);

// GET /api/staff/:id - Get staff by ID (public or protected)
router.get('/:id', protect, getStaffById);

// POST /api/staff - Create new staff (admin only)
router.post('/', protect, authorize('admin'), staffValidation, createStaff);

// PUT /api/staff/:id - Update staff (admin only)
router.put('/:id', protect, authorize('admin'), staffValidation, updateStaff);

// DELETE /api/staff/:id - Delete staff (admin only)
router.delete('/:id', protect, authorize('admin'), deleteStaff);

export default router; 