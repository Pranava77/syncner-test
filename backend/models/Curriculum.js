import mongoose from 'mongoose';

const curriculumItemSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  type: { 
    type: String, 
    enum: ['syllabus', 'learn', 'test', 'exercise'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  externalLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'External link must be a valid URL'
    }
  },
  order: { 
    type: Number, 
    default: 1 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  careerTrack: { 
    type: String,
    required: true,
    enum: ['full-stack', 'ai-ml', 'ui-ux', 'data-science']
  },
  difficulty: { 
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: { 
    type: Number, // in minutes
    default: 30
  },
  tags: [{ 
    type: String,
    trim: true
  }],
  prerequisites: [{ 
    type: String,
    trim: true
  }],
  learningObjectives: [{ 
    type: String,
    trim: true
  }],
  readFirst: {
    brief: {
      type: String,
      trim: true,
      maxlength: 500
    },
    whyLearn: {
      type: String,
      trim: true,
      maxlength: 500
    },
    whereUsed: {
      type: String,
      trim: true,
      maxlength: 500
    },
    customExample: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  resources: [{
    title: { type: String, required: true },
    url: { type: String },
    type: { type: String, enum: ['video', 'article', 'document', 'external'] },
    description: { type: String }
  }],
  metadata: {
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    lastModifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    version: { 
      type: Number, 
      default: 1 
    },
    publishedAt: { 
      type: Date 
    },
    publishedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Indexes for better query performance
curriculumItemSchema.index({ type: 1, careerTrack: 1, isActive: 1 });
curriculumItemSchema.index({ title: 'text', description: 'text', content: 'text' });
curriculumItemSchema.index({ order: 1, careerTrack: 1 });
curriculumItemSchema.index({ 'metadata.createdBy': 1 });

// Virtual for formatted duration
curriculumItemSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.estimatedDuration / 60);
  const minutes = this.estimatedDuration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware to update version and lastModifiedBy
curriculumItemSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.metadata.version += 1;
    this.metadata.lastModifiedBy = this.metadata.createdBy; // This should be updated with actual user ID
  }
  next();
});

// Static method to get curriculum by type and career track
curriculumItemSchema.statics.getByTypeAndTrack = function(type, careerTrack, options = {}) {
  const query = { type, careerTrack, isActive: true };
  if (options.includeInactive) {
    delete query.isActive;
  }
  
  return this.find(query)
    .sort({ order: 1, createdAt: 1 })
    .populate('metadata.createdBy', 'name email')
    .populate('metadata.lastModifiedBy', 'name email');
};

// Static method to get curriculum statistics
curriculumItemSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: { type: '$type', careerTrack: '$careerTrack' },
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalDuration: { $sum: '$estimatedDuration' }
      }
    },
    {
      $group: {
        _id: '$_id.careerTrack',
        types: {
          $push: {
            type: '$_id.type',
            count: '$count',
            activeCount: '$activeCount',
            totalDuration: '$totalDuration'
          }
        },
        totalItems: { $sum: '$count' },
        totalActiveItems: { $sum: '$activeCount' },
        totalDuration: { $sum: '$totalDuration' }
      }
    }
  ]);
};

export default mongoose.model('Curriculum', curriculumItemSchema); 