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
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log(`🔐 JWT: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
  
  // Initialize cron jobs after server starts
  if (process.env.NODE_ENV === 'production') {
    cronService.init();
  } else {
    console.log('⏰ Cron jobs disabled in development mode');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Promise Rejection: ${err.message}`);
  console.error('Stack:', err.stack);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  cronService.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  cronService.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

