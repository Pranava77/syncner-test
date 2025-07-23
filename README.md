# Syncner - College Career Platform

A comprehensive learning management system built with React, TypeScript, and Node.js for college students to track their career development and learning progress.

## 🚀 Recent Fixes & Improvements

### Critical Issues Fixed:
- ✅ **Fixed missing `useCallback` import** in `LevelStatus.tsx`
- ✅ **Standardized career track naming** across the entire application
- ✅ **Added proper TypeScript types** for all interfaces (LearnItem, TestItem, ExerciseItem)
- ✅ **Improved error handling** in backend controllers with proper validation
- ✅ **Enhanced JWT token verification** with better security checks
- ✅ **Added environment variable validation** to prevent startup issues
- ✅ **Created ErrorBoundary component** for graceful error handling
- ✅ **Improved API service** with comprehensive error handling
- ✅ **Fixed Vercel deployment configuration** for proper SPA routing
- ✅ **Added example environment file** for easy setup

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Radix UI** for accessible components

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd syncner-test
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URI
# - JWT_SECRET
# - JWT_EXPIRE (optional, defaults to 7d)
# - NODE_ENV (optional, defaults to development)

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# From the root directory
npm install

# Start development server
npm run dev
```

### 4. Database Setup
```bash
# Optional: Seed the database with sample data
cd backend
npm run sample
```

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/syncner

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Gemini AI Configuration (optional)
GEMINI_API_KEY=your-gemini-api-key-here
```

## 📁 Project Structure

```
syncner-test/
├── backend/                 # Backend API
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── redux/              # Redux store and slices
│   ├── services/           # API service layer
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

## 🔐 Authentication & Authorization

The application supports three user roles:
- **Student**: Access to learning modules, progress tracking
- **Admin**: Full system access, user management, curriculum management
- **Staff**: Limited access (placeholder for future features)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Training & Curriculum
- `GET /api/training/levels` - Get all training levels
- `GET /api/training/levels/:id` - Get specific level
- `GET /api/curriculum` - Get curriculum items (admin)
- `POST /api/curriculum` - Create curriculum item (admin)

### Admin Operations
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/analytics` - Get system analytics

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel using their CLI or dashboard
```

### Backend (Vercel/Render)
```bash
# The backend is configured for Vercel deployment
# vercel.json is already configured
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration settings

3. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env
   - Check frontend API base URL

4. **Missing Dependencies**
   - Run `npm install` in both frontend and backend
   - Clear node_modules and reinstall if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the API documentation
- Create an issue in the repository

---

**Note**: This application is designed for educational purposes and may require additional security measures for production use.