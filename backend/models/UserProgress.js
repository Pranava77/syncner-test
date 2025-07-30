import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  careerTrack: {
    type: String,
    required: true,
    enum: ['full-stack', 'ai-ml', 'ui-ux', 'data-science']
  },
  completedLevels: [{
    levelId: {
      type: String,
      required: true
    },
    levelOrder: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    completedSections: {
      learn: {
        type: Boolean,
        default: false
      },
      exercise: {
        type: Boolean,
        default: false
      },
      test: {
        type: Boolean,
        default: false
      }
    },
    exerciseSubmissions: [{
      exerciseTitle: String,
      submittedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['submitted', 'approved', 'rejected'],
        default: 'submitted'
      }
    }]
  }],
  currentLevel: {
    type: Number,
    default: 1
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userProgressSchema.index({ user: 1, careerTrack: 1 });
userProgressSchema.index({ user: 1, 'completedLevels.levelId': 1 });

// Method to check if a level is unlocked
userProgressSchema.methods.isLevelUnlocked = function(levelOrder) {
  if (levelOrder === 1) return true; // First level is always unlocked
  
  // Check if previous level is completed
  const previousLevel = this.completedLevels.find(
    level => level.levelOrder === levelOrder - 1
  );
  
  return previousLevel && previousLevel.completedSections.exercise;
};

// Method to mark level as completed
userProgressSchema.methods.markLevelCompleted = function(levelId, levelOrder, section) {
  const existingLevel = this.completedLevels.find(
    level => level.levelId === levelId
  );
  
  if (existingLevel) {
    existingLevel.completedSections[section] = true;
    existingLevel.completedAt = new Date();
  } else {
    this.completedLevels.push({
      levelId,
      levelOrder,
      completedSections: {
        learn: section === 'learn',
        exercise: section === 'exercise',
        test: section === 'test'
      },
      completedAt: new Date()
    });
  }
  
  // Update current level if this is a higher level
  if (levelOrder > this.currentLevel) {
    this.currentLevel = levelOrder;
  }
  
  this.lastActivity = new Date();
};

// Method to submit exercise
userProgressSchema.methods.submitExercise = function(levelId, exerciseTitle) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (level) {
    level.exerciseSubmissions.push({
      exerciseTitle,
      submittedAt: new Date(),
      status: 'submitted'
    });
  }
};

// Static method to get or create user progress
userProgressSchema.statics.getOrCreate = async function(userId, careerTrack) {
  let progress = await this.findOne({ user: userId, careerTrack });
  
  if (!progress) {
    progress = new this({
      user: userId,
      careerTrack,
      completedLevels: [],
      currentLevel: 1,
      totalPoints: 0
    });
    await progress.save();
  }
  
  return progress;
};

export default mongoose.model('UserProgress', userProgressSchema); 