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
      startTime: {
        type: Date,
        default: null
      },
      endTime: {
        type: Date,
        default: null
      },
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
      startTime: {
        type: Date,
        default: null
      },
      endTime: {
        type: Date,
        default: null
      },
      timeSpent: {
        type: Number,
        default: 0 // in seconds
      },
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
      startTime: {
        type: Date,
        default: null
      },
      endTime: {
        type: Date,
        default: null
      },
      timeSpent: {
        type: Number,
        default: 0 // in seconds
      },
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
  },
  dailyActivity: [{
    date: {
      type: Date,
      required: true
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    activities: [{
      type: String,
      required: true
    }],
    isPresent: {
      type: Boolean,
      default: false
    }
  }],
  attendanceStats: {
    totalDays: {
      type: Number,
      default: 0
    },
    presentDays: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastPresentDate: {
      type: Date
    }
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

// Method to check if learn section is unlocked (always unlocked for first level, or previous level exercise completed)
userProgressSchema.methods.isLearnUnlocked = function(levelId, levelOrder) {
  if (levelOrder === 1) return true; // First level learn is always unlocked
  
  // Check if previous level exists and has exercise completed
  const previousLevel = this.completedLevels.find(
    level => level.levelOrder === levelOrder - 1
  );
  
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
  
  // Check both testProgress.isCompleted and completedSections.test
  return level && (
    (level.testProgress && level.testProgress.isCompleted) || 
    (level.completedSections && level.completedSections.test)
  );
};

// Method to get unlock status for all sections of a level
userProgressSchema.methods.getLevelSectionStatus = function(levelId, levelOrder) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  
  return {
    learn: {
      isUnlocked: this.isLearnUnlocked(levelId, levelOrder),
      isCompleted: level && level.completedSections ? level.completedSections.learn : false,
      progress: level && level.learnProgress ? level.learnProgress : { timeSpent: 0, linksAccessed: [], isCompleted: false }
    },
    test: {
      isUnlocked: this.isTestUnlocked(levelId),
      isCompleted: level && level.completedSections ? level.completedSections.test : false,
      progress: level && level.testProgress ? level.testProgress : { attempts: [], isCompleted: false }
    },
    exercise: {
      isUnlocked: this.isExerciseUnlocked(levelId),
      isCompleted: level && level.completedSections ? level.completedSections.exercise : false,
      submissions: level && level.exerciseSubmissions ? level.exerciseSubmissions : []
    }
  };
};

// Method to check if user can retake test (5-hour cooldown only when all attempts are exhausted)
userProgressSchema.methods.canRetakeTest = function(levelId) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (!level || !level.testProgress) {
    return true; // No attempts yet, can take test
  }
  
  const attempts = level.testProgress.attempts.length;
  
  // If less than 3 attempts, allow retake immediately
  if (attempts < 3) {
    return true;
  }
  
  // If 3 attempts reached, check 5-hour cooldown
  if (attempts >= 3 && level.testProgress.lastAttemptAt) {
    const hoursSinceLastAttempt = (Date.now() - level.testProgress.lastAttemptAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastAttempt >= 5; // 5-hour cooldown
  }
  
  return false;
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
userProgressSchema.methods.updateLearnProgress = function(levelId, timeSpent, linksAccessed, startTime = null, endTime = null) {
  let level = this.completedLevels.find(l => l.levelId === levelId);
  
  if (!level) {
    // Create new level entry if it doesn't exist
    level = {
      levelId,
      levelOrder: 0, // Will be set when marking as completed
      completedSections: { learn: false, exercise: false, test: false },
      learnProgress: { startTime: null, endTime: null, timeSpent: 0, linksAccessed: [], isCompleted: false },
      testProgress: { startTime: null, endTime: null, timeSpent: 0, attempts: [], isCompleted: false },
      exerciseSubmissions: []
    };
    this.completedLevels.push(level);
  }
  
  if (!level.learnProgress) {
    level.learnProgress = { startTime: null, endTime: null, timeSpent: 0, linksAccessed: [], isCompleted: false };
  }
  
  // Update time tracking
  if (startTime) level.learnProgress.startTime = startTime;
  if (endTime) level.learnProgress.endTime = endTime;
  level.learnProgress.timeSpent = timeSpent;
  
  // Set links accessed (frontend sends complete array)
  if (linksAccessed && Array.isArray(linksAccessed)) {
    level.learnProgress.linksAccessed = linksAccessed;
  }
  
  // Mark as completed if at least 1 link accessed (dynamic requirement)
  // For levels with only 1 link, completion requires 1 link
  // For levels with multiple links, completion requires at least 1 link (can be adjusted)
  if (level.learnProgress.linksAccessed.length >= 1) {
    level.learnProgress.isCompleted = true;
    level.completedSections.learn = true;
  }
  
  this.lastActivity = new Date();
};

// Method to submit test attempt
userProgressSchema.methods.submitTestAttempt = function(levelId, score, answers, startTime = null, endTime = null, timeSpent = 0) {
  let level = this.completedLevels.find(l => l.levelId === levelId);
  
  if (!level) {
    level = {
      levelId,
      levelOrder: 0,
      completedSections: { learn: false, exercise: false, test: false },
      learnProgress: { startTime: null, endTime: null, timeSpent: 0, linksAccessed: [], isCompleted: false },
      testProgress: { startTime: null, endTime: null, timeSpent: 0, attempts: [], isCompleted: false },
      exerciseSubmissions: []
    };
    this.completedLevels.push(level);
  }
  
  if (!level.testProgress) {
    level.testProgress = { startTime: null, endTime: null, timeSpent: 0, attempts: [], isCompleted: false };
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
  
  // Update time tracking
  if (startTime) level.testProgress.startTime = startTime;
  if (endTime) level.testProgress.endTime = endTime;
  level.testProgress.timeSpent = timeSpent;
  
  level.testProgress.lastAttemptAt = new Date();
  
  // Mark test as completed if passed
  if (passed) {
    level.testProgress.isCompleted = true;
    level.completedSections.test = true;
  }
  
  this.lastActivity = new Date();
};

// Method to submit exercise
userProgressSchema.methods.submitExercise = function(levelId, exerciseTitle, links, startTime = null, endTime = null, timeSpent = 0) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (level) {
    level.exerciseSubmissions.push({
      exerciseTitle,
      startTime: startTime,
      endTime: endTime,
      timeSpent: timeSpent,
      submittedAt: new Date(),
      status: 'submitted',
      links: links || []
    });
    
    // Mark exercise section as completed with at least 1 submission
    // For levels with only 1 exercise, completion requires 1 submission
    // For levels with multiple exercises, completion requires at least 1 submission (can be adjusted)
    if (level.exerciseSubmissions.length >= 1) {
      level.completedSections.exercise = true;
    }
  }
};

// Method to update exercise submission
userProgressSchema.methods.updateExercise = function(levelId, exerciseTitle, links) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (level && level.exerciseSubmissions) {
    const submission = level.exerciseSubmissions.find(sub => sub.exerciseTitle === exerciseTitle);
    if (submission) {
      submission.links = links || [];
      submission.submittedAt = new Date();
      submission.status = 'updated';
    }
    
    // Mark exercise section as completed with at least 1 submission
    if (level.exerciseSubmissions.length >= 1) {
      level.completedSections.exercise = true;
    }
  }
};

// Method to check if exercise links are submitted
userProgressSchema.methods.hasExerciseLinks = function(levelId) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  // Return true if at least 1 exercise submission exists
  return level && level.exerciseSubmissions && level.exerciseSubmissions.length >= 1;
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

// Method to mark daily attendance and update streaks
userProgressSchema.methods.markDailyAttendance = function(date = new Date(), totalMinutes = 0, activities = []) {
  const dateStr = date.toDateString();
  
  // Check if we already have an entry for this date
  let dailyEntry = this.dailyActivity.find(entry => 
    entry.date.toDateString() === dateStr
  );
  
  if (!dailyEntry) {
    // Create new daily entry
    dailyEntry = {
      date: date,
      totalMinutes: totalMinutes,
      activities: activities,
      isPresent: totalMinutes > 0
    };
    this.dailyActivity.push(dailyEntry);
  } else {
    // Update existing entry
    dailyEntry.totalMinutes = totalMinutes;
    dailyEntry.activities = activities;
    dailyEntry.isPresent = totalMinutes > 0;
  }
  
  // Update attendance statistics
  this.updateAttendanceStats();
  
  return this.save();
};

// Method to update attendance statistics
userProgressSchema.methods.updateAttendanceStats = function() {
  const today = new Date();
  const enrollmentDate = this.createdAt;
  
  // Calculate total days from enrollment
  const totalDays = Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Count present days (days with activity)
  const presentDays = this.dailyActivity.filter(entry => entry.isPresent).length;
  
  // Calculate total time spent on different activities
  const totalLearningTime = this.dailyActivity.reduce((total, entry) => total + (entry.learningTime || 0), 0);
  const totalTestTime = this.dailyActivity.reduce((total, entry) => total + (entry.testTime || 0), 0);
  const totalExerciseTime = this.dailyActivity.reduce((total, entry) => total + (entry.exerciseTime || 0), 0);
  
  // Calculate current streak with improved logic
  let currentStreak = 0;
  let longestStreak = this.attendanceStats.longestStreak || 0;
  let lastPresentDate = null;
  
  // Sort daily activity by date (newest first)
  const sortedActivity = [...this.dailyActivity].sort((a, b) => b.date - a.date);
  
  // Calculate current streak (consecutive days from today backwards)
  for (let i = 0; i < sortedActivity.length; i++) {
    const entry = sortedActivity[i];
    if (entry.isPresent) {
      if (currentStreak === 0) {
        // Start of a streak
        currentStreak = 1;
        lastPresentDate = entry.date;
        
        // Check if this is part of a longer streak
        let streakLength = 1;
        for (let j = i + 1; j < sortedActivity.length; j++) {
          const nextEntry = sortedActivity[j];
          const dayDiff = Math.ceil((entry.date.getTime() - nextEntry.date.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1 && nextEntry.isPresent) {
            streakLength++;
          } else {
            break;
          }
        }
        
        if (streakLength > longestStreak) {
          longestStreak = streakLength;
        }
      } else {
        // Continue current streak
        currentStreak++;
      }
    } else {
      // Break in streak
      break;
    }
  }
  
  // Update attendance stats with total time tracking
  this.attendanceStats = {
    totalDays: Math.max(1, totalDays),
    presentDays: presentDays,
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    lastPresentDate: lastPresentDate,
    totalLearningTime: totalLearningTime,
    totalTestTime: totalTestTime,
    totalExerciseTime: totalExerciseTime
  };
  
  // Update last activity
  this.lastActivity = today;
};

// Method to get attendance percentage
userProgressSchema.methods.getAttendancePercentage = function() {
  if (this.attendanceStats.totalDays === 0) return 0;
  return Math.round((this.attendanceStats.presentDays / this.attendanceStats.totalDays) * 100);
};

// Method to get streak information
userProgressSchema.methods.getStreakInfo = function() {
  return {
    currentStreak: this.attendanceStats.currentStreak || 0,
    longestStreak: this.attendanceStats.longestStreak || 0,
    attendancePercentage: this.getAttendancePercentage(),
    totalDays: this.attendanceStats.totalDays || 0,
    presentDays: this.attendanceStats.presentDays || 0
  };
};

export default mongoose.model('UserProgress', userProgressSchema); 