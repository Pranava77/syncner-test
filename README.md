# Syncner - Learning Management System

## 🎯 Project Overview

Syncner is a comprehensive Learning Management System (LMS) designed to provide an interactive and engaging learning experience for students across multiple career tracks. The platform offers structured learning paths, progress tracking, portfolio management, and administrative tools for educational institutions.

## ✨ Key Features

### 🎓 For Students
- **Interactive Learning Paths**: Structured curriculum with Learn, Test, and Exercise sections
- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Portfolio Management**: Dynamic portfolio generation with shareable links
- **AI Career Mentor**: Integrated AI chat for learning assistance
- **Attendance Tracking**: Automated attendance marking and streak tracking
- **Leaderboard**: Gamified learning with rankings and achievements

### 👨‍🏫 For Staff
- **Student Management**: Comprehensive student tracking and analytics
- **Progress Monitoring**: Detailed learning journey visualization
- **Portfolio Review**: Access to student portfolios and progress reports
- **Analytics Dashboard**: Performance metrics and insights
- **Attendance Management**: Track student attendance and engagement

### 🔧 For Administrators
- **User Management**: Complete user lifecycle management
- **Curriculum Management**: Create and manage learning content
- **System Analytics**: Platform-wide performance metrics
- **Settings Configuration**: System-wide settings and preferences
- **Content Management**: Manage learning materials, tests, and exercises

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Local file system with upload capabilities
- **AI Integration**: Google Gemini API for AI chat functionality

### Key Technologies
- **Frontend**: React, TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **AI**: Google Gemini API
- **Deployment**: Vercel (Frontend), Render (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncner
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd src
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB
   mongod
   
   # Run database migrations (if any)
   cd backend
   node migrations/fixCareerTracks.js
   ```

5. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd src
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
syncner/
├── src/                          # Frontend React application
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Page components
│   ├── redux/                   # State management
│   ├── services/                # API services
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript type definitions
├── backend/                     # Backend Node.js application
│   ├── controllers/             # Route controllers
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── middleware/              # Custom middleware
│   ├── services/                # Business logic services
│   ├── utils/                   # Utility functions
│   └── migrations/              # Database migrations
└── docs/                        # Documentation
    ├── API.md                   # API documentation
    ├── DEPLOYMENT.md            # Deployment guide
    ├── USER_MANUAL.md           # User manual
    └── TROUBLESHOOTING.md       # Troubleshooting guide
```

## 🔐 User Roles & Permissions

### Student
- Access to learning materials and curriculum
- Submit tests and exercises
- View personal progress and portfolio
- Access AI chat assistance

### Staff
- View student progress and analytics
- Access student portfolios
- Monitor attendance and engagement
- Generate reports

### Admin
- Full system access
- User management (create, edit, delete)
- Curriculum management
- System configuration
- Analytics and reporting

## 🎨 Design System

The application uses a custom design system with:
- **Color Palette**: Primary, secondary, accent colors with dark/light mode support
- **Typography**: Consistent font hierarchy and sizing
- **Components**: Reusable UI components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoints

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/syncner
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Syncner
```

## 📊 Database Schema

### Core Models
- **User**: Student, staff, and admin user accounts
- **Curriculum**: Learning content and levels
- **UserProgress**: Student progress tracking
- **Attendance**: Attendance records
- **Settings**: System configuration

## 🚀 Deployment

### Production Deployment
1. **Frontend (Vercel)**
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

2. **Backend (Render)**
   - Connect GitHub repository
   - Configure build and start commands
   - Set environment variables
   - Configure MongoDB Atlas connection

### Environment Setup
- Production MongoDB: MongoDB Atlas
- File Storage: Local storage or cloud storage
- SSL: Automatic with Vercel/Render

## 📈 Performance & Monitoring

### Performance Optimizations
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Database indexing

### Monitoring
- Error tracking and logging
- Performance metrics
- User analytics
- System health monitoring

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure file uploads

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: support@syncner.com
- Documentation: See `/docs` folder
- Issues: Create GitHub issues for bugs

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI chat integration
- **v1.2.0** - Enhanced portfolio system
- **v1.3.0** - Improved analytics and reporting

---

**Built with ❤️ By WEBFIXUS for modern education**