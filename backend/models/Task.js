import mongoose from 'mongoose';
import { DIFFICULTY_LEVELS, CAREER_TRACKS } from '../utils/constants.js';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'fullstack', 'design', 'data'],
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    enum: Object.values(DIFFICULTY_LEVELS),
    required: true
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [10, 'Points must be at least 10'],
    max: [1000, 'Points cannot exceed 1000']
  },
  estimatedTime: {
    type: String,
    required: [true, 'Estimated time is required']
  },
  careerTrack: {
    type: String,
    enum: Object.values(CAREER_TRACKS),
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  deliverables: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  resources: [{
    type: String
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ careerTrack: 1, difficulty: 1 });
taskSchema.index({ category: 1, isActive: 1 });
taskSchema.index({ points: -1 });
taskSchema.index({ order: 1 });

// Virtual for submission count
taskSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'task',
  count: true
});

// Virtual for average score
taskSchema.virtual('averageScore').get(function() {
  // This would be calculated from submissions
  return 0; // Placeholder
});

export default mongoose.model('Task', taskSchema);