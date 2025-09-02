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
    enum: ['full-stack', 'fullstack', 'ai-ml', 'ui-ux', 'data-science'],
    set: function(value) {
      // Normalize legacy values
      if (value === 'fullstack') return 'full-stack';
      return value;
    }
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
      links: [String], // Store submitted links
      score: {
        type: Number,
        default: 0
      },
      feedback: {
        type: String,
        default: ''
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
  return level && level.completedSections && level.completedSections.learn === true;
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
  // Validate inputs
  if (!levelId || !levelOrder || !section) {
    throw new Error('Invalid parameters: levelId, levelOrder, and section are required');
  }

  if (!['learn', 'exercise', 'test'].includes(section)) {
    throw new Error('Invalid section: must be learn, exercise, or test');
  }

  const existingLevel = this.completedLevels.find(
    level => level.levelId === levelId
  );
  
  if (existingLevel) {
    // Update existing level
    existingLevel.completedSections[section] = true;
    existingLevel.completedAt = new Date();

    // Update section-specific progress
    if (section === 'learn') {
      existingLevel.learnProgress = {
        ...existingLevel.learnProgress,
        isCompleted: true,
        timeSpent: existingLevel.learnProgress?.timeSpent || 0,
        linksAccessed: existingLevel.learnProgress?.linksAccessed || []
      };
    } else if (section === 'test') {
      existingLevel.testProgress = {
        ...existingLevel.testProgress,
        isCompleted: true,
        attempts: existingLevel.testProgress?.attempts || []
      };
    }

    // Check if all sections are completed
    const allSectionsCompleted = Object.values(existingLevel.completedSections).every(val => val === true);
    
    if (allSectionsCompleted) {
      // Award points for completing all sections
      this.totalPoints += 100;
      
      // Update current level if this is a higher level and all sections are completed
      if (levelOrder > this.currentLevel) {
        this.currentLevel = levelOrder;
      }
    }
  } else {
    // Create new level entry
    const newLevel = {
      levelId,
      levelOrder,
      completedSections: {
        learn: section === 'learn',
        exercise: section === 'exercise',
        test: section === 'test'
      },
      completedAt: new Date(),
      learnProgress: {
        timeSpent: 0,
        linksAccessed: [],
        isCompleted: section === 'learn'
      },
      testProgress: {
        attempts: [],
        isCompleted: section === 'test'
      },
      exerciseSubmissions: []
    };

    this.completedLevels.push(newLevel);
  }
  
  // Always update last activity
  this.lastActivity = new Date();

  // Sort completedLevels by order for consistent access
  this.completedLevels.sort((a, b) => a.levelOrder - b.levelOrder);
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
userProgressSchema.methods.submitExercise = function(levelId, exerciseTitle, links, score = 0, feedback = '') {
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
  
  level.exerciseSubmissions.push({
    exerciseTitle,
    submittedAt: new Date(),
    status: 'submitted',
    links: links || [],
    score: score,
    feedback: feedback
  });
  
  // Mark exercise section as completed with at least 1 submission
  // For levels with only 1 exercise, completion requires 1 submission
  // For levels with multiple exercises, completion requires at least 1 submission (can be adjusted)
  if (level.exerciseSubmissions.length >= 1) {
    level.completedSections.exercise = true;
  }
  
  this.lastActivity = new Date();
};

// Method to update exercise submission
userProgressSchema.methods.updateExercise = function(levelId, exerciseTitle, links, score = 0, feedback = '') {
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
  
  if (!level.exerciseSubmissions) {
    level.exerciseSubmissions = [];
  }
  
  const submission = level.exerciseSubmissions.find(sub => sub.exerciseTitle === exerciseTitle);
  if (submission) {
    submission.links = links || [];
    submission.submittedAt = new Date();
    submission.status = 'submitted';
    submission.score = score;
    submission.feedback = feedback;
  } else {
    // If no existing submission found, create a new one
    level.exerciseSubmissions.push({
      exerciseTitle,
      submittedAt: new Date(),
      status: 'submitted',
      links: links || [],
      score: score,
      feedback: feedback
    });
  }
  
  // Mark exercise section as completed with at least 1 submission
  if (level.exerciseSubmissions.length >= 1) {
    level.completedSections.exercise = true;
  }
  
  this.lastActivity = new Date();
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
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const enrollmentDate = new Date(this.createdAt);
  enrollmentDate.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Calculate total days from enrollment (excluding future dates)
  const totalDays = Math.max(
    1,
    Math.ceil((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  
  // Sort daily activity by date (newest first) and normalize dates
  const sortedActivity = [...this.dailyActivity]
    .map(entry => ({
      ...entry,
      date: new Date(entry.date.setHours(0, 0, 0, 0)) // Normalize to start of day
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Count present days (days with activity)
  const presentDays = sortedActivity.filter(entry => 
    entry.isPresent && entry.date.getTime() <= today.getTime()
  ).length;
  
  // Calculate activity times with validation
  const calculateTotalTime = (activityType) => {
    return sortedActivity.reduce((total, entry) => {
      const time = entry[activityType] || 0;
      // Validate time is reasonable (max 24 hours per day)
      return total + Math.min(Math.max(0, time), 24 * 60);
    }, 0);
  };
  
  const totalLearningTime = calculateTotalTime('learningTime');
  const totalTestTime = calculateTotalTime('testTime');
  const totalExerciseTime = calculateTotalTime('exerciseTime');
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = this.attendanceStats?.longestStreak || 0;
  let lastPresentDate = null;
  let inStreak = true;
  let lastDate = today;
  
  // Process each day's activity
  for (const entry of sortedActivity) {
    // Skip future dates
    if (entry.date.getTime() > today.getTime()) continue;
    
    // Calculate days between this entry and last processed date
    const dayDiff = Math.floor(
      (lastDate.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (entry.isPresent) {
      if (inStreak) {
        // Continue streak if consecutive days
        if (dayDiff === 1) {
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else {
          // Break in streak
          inStreak = false;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      } else if (dayDiff === 1) {
        // Start new streak
        inStreak = true;
        currentStreak = 2; // Count both today and this entry
      } else {
        currentStreak = 1;
      }
      
      if (!lastPresentDate) {
        lastPresentDate = entry.date;
      }
    } else {
      // Break streak on absent day
      inStreak = false;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      currentStreak = 0;
    }
    
    lastDate = entry.date;
  }
  
  // Update attendance stats with validated data
  this.attendanceStats = {
    totalDays: totalDays,
    presentDays: presentDays,
    currentStreak: Math.max(0, currentStreak),
    longestStreak: Math.max(0, longestStreak),
    lastPresentDate: lastPresentDate || this.attendanceStats?.lastPresentDate,
    totalLearningTime: Math.max(0, totalLearningTime),
    totalTestTime: Math.max(0, totalTestTime),
    totalExerciseTime: Math.max(0, totalExerciseTime),
    attendancePercentage: Math.round((presentDays / totalDays) * 100)
  };
  
  // Update last activity
  this.lastActivity = new Date();
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

// Method to calculate section progress
userProgressSchema.methods.calculateSectionProgress = function(levelId, section) {
  const level = this.completedLevels.find(l => l.levelId === levelId);
  if (!level) return 0;

  switch (section) {
    case 'learn':
      return level.learnProgress.isCompleted ? 100 : 
        level.learnProgress.linksAccessed.length > 0 ? 50 : 0;
    
    case 'test':
      if (level.testProgress.isCompleted) return 100;
      if (level.testProgress.attempts.length === 0) return 0;
      return Math.round(Math.max(...level.testProgress.attempts.map(a => a.score)));
    
    case 'exercise':
      if (!level.exerciseSubmissions.length) return 0;
      const approvedSubmissions = level.exerciseSubmissions.filter(s => s.status === 'approved').length;
      const totalSubmissions = level.exerciseSubmissions.length;
      return Math.round((approvedSubmissions / totalSubmissions) * 100);
    
    default:
      return 0;
  }
};

// Method to calculate overall level progress
userProgressSchema.methods.calculateLevelProgress = function(levelId) {
  const learnProgress = this.calculateSectionProgress(levelId, 'learn');
  const testProgress = this.calculateSectionProgress(levelId, 'test');
  const exerciseProgress = this.calculateSectionProgress(levelId, 'exercise');
  
  return Math.round((learnProgress + testProgress + exerciseProgress) / 3);
};

// Method to calculate overall journey progress
userProgressSchema.methods.calculateOverallProgress = function() {
  if (!this.completedLevels.length) return 0;
  
  const totalProgress = this.completedLevels.reduce((sum, level) => {
    return sum + this.calculateLevelProgress(level.levelId);
  }, 0);
  
  return Math.round(totalProgress / this.completedLevels.length);
};

export default mongoose.model('UserProgress', userProgressSchema); 