import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    location: String,
    careerTrack: String,
    linkedin: String,
    portfolio: String
  },
  summary: {
    type: String,
    required: true,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  education: {
    degree: String,
    school: String,
    year: String,
    gpa: String,
    relevantCourses: [String]
  },
  skills: {
    technical: [String],
    frameworks: [String],
    tools: [String],
    languages: [String],
    soft: [String]
  },
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    technologies: [String],
    liveUrl: String,
    githubUrl: String,
    completedAt: Date,
    score: Number,
    highlights: [String]
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuer: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    credentialId: String,
    url: String,
    skills: [String]
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: {
      type: Boolean,
      default: false
    },
    description: String,
    achievements: [String]
  }],
  template: {
    type: String,
    enum: ['professional', 'creative', 'minimal'],
    default: 'professional'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastGenerated: {
    type: Date,
    default: Date.now
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
resumeSchema.index({ user: 1 });
resumeSchema.index({ isPublic: 1 });
resumeSchema.index({ lastGenerated: -1 });

// Virtual for project count
resumeSchema.virtual('projectCount').get(function() {
  return this.projects.length;
});

// Virtual for certification count
resumeSchema.virtual('certificationCount').get(function() {
  return this.certifications.length;
});

// Method to increment download count
resumeSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastGenerated = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('Resume', resumeSchema);