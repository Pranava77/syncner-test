import mongoose from 'mongoose';
import { CAREER_TRACKS, DIFFICULTY_LEVELS } from '../utils/constants.js';

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Track name is required'],
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Track display name is required'],
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
  levels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
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
  toObject: { virtuals: true },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Indexes

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

// Virtual for level count
trackSchema.virtual('levelCount').get(function() {
  return this.levels.length;
});

export default mongoose.model('Track', trackSchema);