import mongoose from 'mongoose';
import { CAREER_TRACKS, DIFFICULTY_LEVELS } from '../utils/constants.js';

const learnSchema = new mongoose.Schema({
  type: { type: String, enum: ['video', 'reading', 'slide', 'other'], required: true },
  title: { type: String, required: true },
  content: { type: String },
  videoUrl: { type: String },
  order: { type: Number, default: 1 }
}, { _id: false });

const testSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String },
  order: { type: Number, default: 1 }
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  resources: [{ type: String }],
  order: { type: Number, default: 1 }
}, { _id: false });

const levelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: Object.values(DIFFICULTY_LEVELS), required: true },
  duration: { type: String },
  careerTrack: { type: String, enum: Object.values(CAREER_TRACKS), required: true },
  skills: [{ type: String }],
  prerequisites: [{ type: String }],
  learn: [learnSchema],
  test: [testSchema],
  exercise: [exerciseSchema],
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  estimatedHours: { type: Number }
}, {
  timestamps: true
});

export default mongoose.model('Level', levelSchema); 