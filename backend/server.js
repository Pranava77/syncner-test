import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import cronService from './services/cronService.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  
  // Initialize cron jobs after server starts
  if (process.env.NODE_ENV === 'production') {
    cronService.init();
  } else {
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  cronService.stop();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  cronService.stop();
  server.close(() => {
    process.exit(0);
  });
});

