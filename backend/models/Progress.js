import mongoose from 'mongoose';
import { MODULE_STATUS, TASK_STATUS } from '../utils/constants.js';

const moduleProgressSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(MODULE_STATUS),
    default: MODULE_STATUS.LOCKED
  },
  completedLessons: [{
    lessonId: String,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: Date,
  completedAt: Date,
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  }
});

const taskProgressSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TASK_STATUS),
    default: TASK_STATUS.LOCKED
  },
  startedAt: Date,
  submittedAt: Date,
  completedAt: Date,
  score: Number,
  attempts: {
    type: Number,
    default: 0
  }
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  careerTrack: {
    type: String,
    enum: ['ai-ml', 'fullstack', 'ui-ux', 'data-science'],
    required: true
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  moduleProgress: [moduleProgressSchema],
  taskProgress: [taskProgressSchema],
  achievements: [{
    id: String,
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  weeklyGoal: {
    target: {
      type: Number,
      default: 5 // hours per week
    },
    current: {
      type: Number,
      default: 0
    },
    weekStart: {
      type: Date,
      default: () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day;
        return new Date(now.setDate(diff));
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
progressSchema.index({ user: 1, careerTrack: 1 });
progressSchema.index({ lastActive: -1 });

// Virtual for completion percentage
progressSchema.virtual('completionPercentage').get(function() {
  // This would be calculated based on completed modules/tasks
  return Math.min(Math.round((this.moduleProgress.filter(mp => mp.status === MODULE_STATUS.COMPLETED).length / 10) * 100), 100);
});

// Virtual for completed modules count
progressSchema.virtual('completedModulesCount').get(function() {
  return this.moduleProgress.filter(mp => mp.status === MODULE_STATUS.COMPLETED).length;
});

// Virtual for completed tasks count
progressSchema.virtual('completedTasksCount').get(function() {
  return this.taskProgress.filter(tp => tp.status === TASK_STATUS.COMPLETED).length;
});

// Method to update streak
progressSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.lastActive);
  
  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  lastActive.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Consecutive day
    this.streakDays += 1;
  } else if (diffDays > 1) {
    // Streak broken
    this.streakDays = 1;
  }
  // If diffDays === 0, same day, no change needed
  
  this.lastActive = new Date();
  return this.save();
};

// Method to update last active
progressSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('Progress', progressSchema);