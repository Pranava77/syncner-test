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
    // New fields for learn section tracking
    learnProgress: {
      timeSpent: {
        type: Number,
        default: 0 // in seconds
      },
      linksAccessed: {
        type: [String],
        default: []
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    },
    // New fields for test section tracking
    testProgress: {
      attempts: [{
        attemptNumber: {
          type: Number,
          required: true
        },
        score: {
          type: Number,
          required: true
        },
        passed: {
          type: Boolean,
          required: true
        },
        answers: [{
          questionIndex: Number,
          selectedOption: Number
        }],
        completedAt: {
          type: Date,
          default: Date.now
        }
      }],
      lastAttemptAt: Date,
      isCompleted: {
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
      },
      links: [String] // Store submitted links
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
  
  // Check if previous level exists and has exercise completed
  const previousLevel = this.completedLevels.find(
    level => level.levelOrder === levelOrder - 1
  );
  
  // Level is unlocked only if previous level exists AND its exercise section is completed
  return previousLevel && previousLevel.completedSections && previousLevel.completedSections.exercise === true;
};

// Method to check if test is unlocked (learn must be completed)
userProgressSchema.methods.isTestUnlocked = function(levelId) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  return level && level.learnProgress && level.learnProgress.isCompleted;
};

// Method to check if exercise is unlocked (test must be passed)
userProgressSchema.methods.isExerciseUnlocked = function(levelId) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  return level && level.testProgress && level.testProgress.isCompleted;
};

// Method to check if user can retake test (1-minute cooldown)
userProgressSchema.methods.canRetakeTest = function(levelId) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (!level || !level.testProgress || level.testProgress.attempts.length >= 3) {
    return false;
  }
  
  if (level.testProgress.lastAttemptAt) {
    const minutesSinceLastAttempt = (Date.now() - level.testProgress.lastAttemptAt.getTime()) / (1000 * 60);
    return minutesSinceLastAttempt >= 1;
  }
  
  return true;
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

// Method to update learn progress
userProgressSchema.methods.updateLearnProgress = function(levelId, timeSpent, linksAccessed) {
  let level = this.completedLevels.find(l => l.levelId === levelId);
  
  if (!level) {
    // Create new level entry if it doesn't exist
    level = {
      levelId,
      levelOrder: 0, // Will be set when marking as completed
      completedSections: { learn: false, exercise: false, test: false },
      learnProgress: { timeSpent: 0, linksAccessed: [], isCompleted: false },
      testProgress: { attempts: [], isCompleted: false },
      exerciseSubmissions: []
    };
    this.completedLevels.push(level);
  }
  
  if (!level.learnProgress) {
    level.learnProgress = { timeSpent: 0, linksAccessed: [], isCompleted: false };
  }
  
  level.learnProgress.timeSpent = timeSpent;
  
  // Set links accessed (frontend sends complete array)
  if (linksAccessed && Array.isArray(linksAccessed)) {
    level.learnProgress.linksAccessed = linksAccessed;
  }
  
  // Mark as completed if time spent >= 5 minutes (300 seconds) and at least 2 links accessed
  if (level.learnProgress.timeSpent >= 300 && level.learnProgress.linksAccessed.length >= 2) {
    level.learnProgress.isCompleted = true;
    level.completedSections.learn = true;
  }
  
  this.lastActivity = new Date();
};

// Method to submit test attempt
userProgressSchema.methods.submitTestAttempt = function(levelId, score, answers) {
  let level = this.completedLevels.find(l => l.levelId === levelId);
  
  if (!level) {
    level = {
      levelId,
      levelOrder: 0,
      completedSections: { learn: false, exercise: false, test: false },
      learnProgress: { timeSpent: 0, linksAccessed: [], isCompleted: false },
      testProgress: { attempts: [], isCompleted: false },
      exerciseSubmissions: []
    };
    this.completedLevels.push(level);
  }
  
  if (!level.testProgress) {
    level.testProgress = { attempts: [], isCompleted: false };
  }
  
  const attemptNumber = level.testProgress.attempts.length + 1;
  const passed = score >= 60; // 60% threshold
  
  level.testProgress.attempts.push({
    attemptNumber,
    score,
    passed,
    answers,
    completedAt: new Date()
  });
  
  level.testProgress.lastAttemptAt = new Date();
  
  // Mark test as completed if passed
  if (passed) {
    level.testProgress.isCompleted = true;
    level.completedSections.test = true;
  }
  
  this.lastActivity = new Date();
};

// Method to submit exercise
userProgressSchema.methods.submitExercise = function(levelId, exerciseTitle, links) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (level) {
    level.exerciseSubmissions.push({
      exerciseTitle,
      submittedAt: new Date(),
      status: 'submitted',
      links: links || []
    });
  }
};

// Method to check if exercise links are submitted
userProgressSchema.methods.hasExerciseLinks = function(levelId) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  return level && level.exerciseSubmissions && level.exerciseSubmissions.length > 0;
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