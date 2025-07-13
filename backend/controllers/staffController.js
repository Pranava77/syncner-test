import Staff from '../models/Staff.js';
import { validationResult } from 'express-validator';

// GET /api/staff - List all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/staff/:id - Get staff by ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/staff - Create new staff
export const createStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/staff/:id - Update staff
export const updateStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/staff/:id - Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.status(200).json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 