import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Add admin-specific fields here (e.g., permissions, isSuperAdmin)
}, {
  timestamps: true
});

export default mongoose.model('Admin', adminSchema); 