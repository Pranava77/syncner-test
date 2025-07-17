import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, CAREER_TRACKS, DIFFICULTY_LEVELS } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'staff'],
    default: 'student'
  },
  college: {
    type: String,
    required: function() { return this.role === 'student' || this.role === 'staff'; },
    trim: true,
    maxlength: [100, 'College name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  careerTrack: {
    type: String,
    enum: Object.values(CAREER_TRACKS)
  },
  level: {
    type: String,
    enum: Object.values(DIFFICULTY_LEVELS),
    default: DIFFICULTY_LEVELS.BEGINNER
  },
  interests: [{
    type: String,
    trim: true
  }],
  profileComplete: {
    type: Boolean,
    default: false
  },
  streakDays: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  gpa: {
    type: String,
    trim: true
  },
  graduationYear: {
    type: String,
    trim: true
  },
  activeTodayMinutes: {
    type: Number,
    default: 0
  },
  activeTodayDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes

userSchema.index({ college: 1, careerTrack: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('User', userSchema);