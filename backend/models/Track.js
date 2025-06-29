import mongoose from 'mongoose';
import { CAREER_TRACKS, DIFFICULTY_LEVELS } from '../utils/constants.js';

const trackSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    enum: Object.values(CAREER_TRACKS)
  },
  name: {
    type: String,
    required: [true, 'Track name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Track description is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  difficulty: {
    type: String,
    enum: Object.values(DIFFICULTY_LEVELS),
    required: true
  },
  averageSalary: {
    type: String,
    required: true
  },
  careerPaths: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  prerequisites: [{
    type: String
  }],
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
// trackSchema.index({ id: 1 }); // Removed - id field already has unique: true
trackSchema.index({ isActive: 1, order: 1 });

// Virtual for enrollment count
trackSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for completion rate
trackSchema.virtual('completionRate').get(function() {
  // This would be calculated based on student progress
  return 0; // Placeholder
});

// Virtual for module count
trackSchema.virtual('moduleCount').get(function() {
  return this.modules.length;
});

export default mongoose.model('Track', trackSchema);