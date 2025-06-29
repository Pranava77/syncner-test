import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'College code is required'],
    trim: true,
    unique: true,
    uppercase: true
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  type: {
    type: String,
    enum: ['university', 'college', 'institute'],
    default: 'university'
  },
  departments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  adminUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    allowStudentRegistration: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxStudents: {
      type: Number,
      default: 1000
    },
    allowSelfRegistration: {
      type: Boolean,
      default: false
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    defaultCareerTrack: {
      type: String,
      default: 'fullstack'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: Number,
  website: String,
  logo: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
collegeSchema.index({ code: 1 });
collegeSchema.index({ name: 1 });
collegeSchema.index({ location: 1 });
collegeSchema.index({ isActive: 1 });

// Virtual for student count
collegeSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

// Virtual for admin count
collegeSchema.virtual('adminCount').get(function() {
  return this.adminUsers.length;
});

export default mongoose.model('College', collegeSchema);