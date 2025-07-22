import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

// CORS
app.use(cors({
  origin: [
    'https://syncner-test.netlify.app',
    'http://localhost:5173', // Added for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { protect } from './middleware/auth.js';
import { trackActivity } from './middleware/trackActivity.js';

// Import all MongoDB models to ensure schemas are registered
import './models/User.js';
import './models/Track.js';
import './models/Curriculum.js';

// Import geminiService
import geminiService from './services/geminiService.js';

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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


// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);

// Public health check endpoints for diagnostics
app.use('/api/users/health', userRoutes); // Only /api/users/health is public
app.use('/api/tracks/health', trackRoutes); // Only /api/tracks/health is public
app.use('/api/admin/health', adminRoutes); // Only /api/admin/health is public
app.use('/api/admin/settings/health', settingsRoutes); // Only /api/admin/settings/health is public
app.use('/api/ai/health', aiRoutes); // Only /api/ai/health is public

// All routes below require authentication and activity tracking
app.use('/api', protect, trackActivity);
app.use('/api/users', userRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/curriculum', curriculumRoutes);

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