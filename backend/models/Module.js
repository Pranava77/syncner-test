import mongoose from 'mongoose';
import { DIFFICULTY_LEVELS, LESSON_TYPES, MODULE_STATUS } from '../utils/constants.js';

const lessonSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(LESSON_TYPES),
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  videoUrl: {
    type: String
  },
  resources: [{
    type: String
  }],
  order: {
    type: Number,
    required: true
  }
});

const moduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: Object.values(DIFFICULTY_LEVELS),
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  careerTrack: {
    type: String,
    required: true,
    ref: 'Track'
  },
  skills: [{
    type: String,
    required: true
  }],
  prerequisites: [{
    type: String
  }],
  lessons: [lessonSchema],
  order: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedHours: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes

moduleSchema.index({ careerTrack: 1, order: 1 });
moduleSchema.index({ isActive: 1 });

// Virtual for lesson count
moduleSchema.virtual('lessonCount').get(function() {
  return this.lessons.length;
});

// Virtual for total duration in minutes
moduleSchema.virtual('totalDurationMinutes').get(function() {
  return this.lessons.reduce((total, lesson) => {
    const minutes = parseInt(lesson.duration.match(/\d+/)?.[0] || 0);
    return total + minutes;
  }, 0);
});

export default mongoose.model('Module', moduleSchema);