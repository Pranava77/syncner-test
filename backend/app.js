import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import all MongoDB models to ensure schemas are registered
import './models/User.js';
import './models/Track.js';
import './models/Module.js';
import './models/Task.js';
import './models/Submission.js';
import './models/Progress.js';
import './models/Resume.js';
import './models/College.js';

// Import geminiService
import geminiService from './services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// CORS - Simplified for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
const serverStartTime = Date.now();

app.get('/api/health', async (req, res) => {
  // Calculate uptime
  const uptimeMs = Date.now() - serverStartTime;
  const uptimeSec = Math.floor(uptimeMs / 1000);
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;
  const uptime = `${hours}h ${minutes}m ${seconds}s`;

  // Memory usage
  const memoryUsageMB = Math.round(process.memoryUsage().rss / 1024 / 1024);

  // Gemini API connectivity check
  let geminiStatus = 'Unknown';
  try {
    // Use a lightweight call (simulate a ping)
    await geminiService.chatWithAI('ping', 'healthcheck');
    geminiStatus = 'Connected';
  } catch (err) {
    geminiStatus = 'Disconnected';
  }

  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    gemini: geminiStatus,
    memoryUsageMB
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;