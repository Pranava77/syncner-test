# Low-Level Design (LLD) Documentation

## 🔧 **Component Architecture**

### **Frontend Component Hierarchy**
```
App.tsx (Root Component)
├── ErrorBoundary.tsx
├── AnimatePresence (Framer Motion)
├── Routes (React Router)
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OnboardingFlow.tsx
│   ├── StudentLayout.tsx (Student Routes)
│   │   ├── StudentDashboard.tsx
│   │   ├── TrainingLevels.tsx
│   │   ├── LevelLearnPage.tsx
│   │   ├── LevelTestPage.tsx
│   │   ├── LevelExercisePage.tsx
│   │   ├── ProjectsPage.tsx
│   │   └── StudentProfile.tsx
│   ├── Layout.tsx (Admin Routes)
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminAdmin.tsx
│   │   ├── AdminStaff.tsx
│   │   ├── AdminCurriculum.tsx
│   │   ├── AdminAnalytics.tsx
│   │   ├── AdminSettings.tsx
│   │   └── AdminProfile.tsx
│   └── StaffDashboard.tsx
├── ProtectedRoute.tsx
├── LoadingScreen.tsx
└── KeepAlive (React Activation)

Components/
├── Layout.tsx (Main Admin Layout)
│   ├── Sidebar Navigation
│   ├── Header with Logo
│   ├── Mobile Menu
│   └── Main Content Area
├── StudentLayout.tsx (Student Layout)
├── ProtectedRoute.tsx (Route Protection)
├── ErrorBoundary.tsx (Error Handling)
├── LoadingScreen.tsx (Loading States)
├── LevelsSidebar.tsx (Level Navigation)
├── LevelStatus.tsx (Progress Indicators)
├── AIChat.tsx (AI Assistant)
├── AttendanceHeatmap.tsx (Attendance Tracking)
└── ResetPasswordModal.tsx (Password Reset)

Pages/
├── LandingPage.tsx (Public Landing)
├── LoginPage.tsx (Authentication)
├── RegisterPage.tsx (User Registration)
├── OnboardingFlow.tsx (User Onboarding)
├── StudentDashboard.tsx (Student Home)
├── TrainingLevels.tsx (Level Selection)
├── LevelLearnPage.tsx (Learning Content)
├── LevelTestPage.tsx (Assessment)
├── LevelExercisePage.tsx (Practice)
├── ProjectsPage.tsx (Project Management)
├── StudentProfile.tsx (Student Profile)
├── AdminDashboard.tsx (Admin Home)
├── AdminUsers.tsx (User Management)
├── AdminAdmin.tsx (Admin Management)
├── AdminStaff.tsx (Staff Management)
├── AdminCurriculum.tsx (Content Management)
├── AdminAnalytics.tsx (Analytics)
├── AdminSettings.tsx (System Settings)
├── AdminProfile.tsx (Admin Profile)
└── StaffDashboard.tsx (Staff Home)
```

### **Backend Service Architecture**
```
server.js (Entry Point)
├── app.js (Express App Configuration)
│   ├── middleware/
│   │   ├── auth.js (JWT Authentication)
│   │   ├── trackActivity.js (User Activity Tracking)
│   │   └── errorHandler.js (Global Error Handling)
│   ├── routes/
│   │   ├── authRoutes.js (Authentication Endpoints)
│   │   ├── userRoutes.js (User Management)
│   │   ├── curriculumRoutes.js (Curriculum CRUD)
│   │   ├── trainingRoutes.js (Training Data)
│   │   ├── trackRoutes.js (Career Tracks)
│   │   ├── attendanceRoutes.js (Attendance Tracking)
│   │   ├── adminRoutes.js (Admin Operations)
│   │   ├── aiRoutes.js (AI Chat Integration)
│   │   └── settingsRoutes.js (System Settings)
│   ├── controllers/
│   │   ├── authController.js (Authentication Logic)
│   │   ├── userController.js (User Management)
│   │   ├── curriculumController.js (Curriculum Operations)
│   │   ├── trainingController.js (Training Data Processing)
│   │   ├── trackController.js (Career Track Management)
│   │   ├── attendanceController.js (Attendance Logic)
│   │   ├── adminController.js (Admin Operations)
│   │   ├── settingsController.js (Settings Management)
│   │   └── gptController.js (AI Integration)
│   ├── models/
│   │   ├── User.js (User Schema)
│   │   ├── Curriculum.js (Curriculum Schema)
│   │   ├── Track.js (Career Track Schema)
│   │   ├── Attendance.js (Attendance Schema)
│   │   └── Settings.js (System Settings Schema)
│   ├── services/
│   │   └── geminiService.js (Google Gemini AI Integration)
│   ├── utils/
│   │   ├── careerTrackUtils.js (Career Track Utilities)
│   │   └── constants.js (Application Constants)
│   ├── config/
│   │   └── db.js (Database Configuration)
│   ├── uploads/ (File Upload Storage)
│   └── seedData.js (Database Seeding)
├── package.json (Dependencies)
├── env.example (Environment Template)
└── vercel.json (Deployment Configuration)
```

---

## 🎨 **Component Specifications**

### **Frontend Components**

#### **App.tsx - Root Component**
```typescript
interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Responsibilities:
// - Authentication state management
// - Global error handling
// - Router configuration
```

#### **Layout.tsx - Main Layout**
```typescript
interface LayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
}

// Responsibilities:
// - Responsive layout management
// - Sidebar state management
// - Mobile navigation handling
```

#### **Learning Components**
```typescript
interface Level {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
}

interface LevelContent {
  readFirst: ReadFirstSection;
  learn: LearnItem[];
  test: TestItem[];
  exercise: ExerciseItem[];
}
```

---

## 🗄️ **Database Schema Details**

### **User Schema Key Fields**
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    validate: {
      validator: (v) => /^[a-zA-Z\s]+$/.test(v),
      message: 'Name can only contain letters and spaces'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Valid email required']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
    validate: {
      validator: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v),
      message: 'Password must contain lowercase, uppercase, and number'
    }
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'staff'],
    default: 'student'
  },
  careerTrack: {
    type: String,
    enum: ['fullstack', 'ai-ml', 'ui-ux', 'data-science'],
    required: function() { return this.role === 'student'; }
  },
  streakDays: { type: Number, default: 0, min: 0 },
  totalPoints: { type: Number, default: 0, min: 0 },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### **Curriculum Schema Key Fields**
```javascript
const curriculumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  learn: [{
    type: { type: String, enum: ['video', 'reading', 'slide', 'other'] },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, maxlength: 10000 },
    videoUrl: String,
    order: { type: Number, default: 0 }
  }],
  test: [{
    question: { type: String, required: true, maxlength: 500 },
    options: [{ type: String, maxlength: 200 }],
    answer: { type: String, required: true },
    order: { type: Number, default: 0 }
  }],
  exercise: [{
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    resources: [String],
    order: { type: Number, default: 0 }
  }],
  readFirst: {
    brief: { type: String, maxlength: 500 },
    whyLearn: { type: String, maxlength: 500 },
    whereUsed: { type: String, maxlength: 500 },
    customExample: { type: String, maxlength: 1000 }
  },
  careerTrack: {
    type: String,
    enum: ['full-stack', 'ai-ml', 'ui-ux', 'data-science'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 🔄 **API Endpoint Specifications**

### **Authentication Endpoints**

#### **POST /api/auth/register**
```javascript
// Validation Rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('college').if(body('role').isIn(['student', 'staff'])).notEmpty(),
  body('careerTrack').if(body('role').equals('student')).isIn(['fullstack', 'ai-ml', 'ui-ux', 'data-science'])
];

// Controller Logic
const register = async (req, res) => {
  // 1. Validate input
  // 2. Check existing user
  // 3. Hash password
  // 4. Create user
  // 5. Generate JWT
  // 6. Return response
};
```

#### **POST /api/auth/login**
```javascript
// Validation Rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Controller Logic
const login = async (req, res) => {
  // 1. Validate input
  // 2. Find user with password
  // 3. Check if active
  // 4. Verify password
  // 5. Update last active
  // 6. Generate JWT
  // 7. Return response
};
```

### **Curriculum Endpoints**

#### **GET /api/curriculum**
```javascript
// Query Parameters
const curriculumQueryValidation = [
  query('careerTrack').optional().isIn(['full-stack', 'ai-ml', 'ui-ux', 'data-science']),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Controller Logic
const getCurriculum = async (req, res) => {
  // 1. Validate query parameters
  // 2. Build filter object
  // 3. Calculate pagination
  // 4. Execute query with population
  // 5. Return paginated results
};
```

---

## 🔐 **Security Implementation**

### **JWT Authentication Middleware**
```javascript
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
```

### **Role-Based Authorization**
```javascript
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

// Usage: authorizeRoles('admin'), authorizeRoles('admin', 'staff')
```

### **Rate Limiting**
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { success: false, message: 'Too many requests' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 auth attempts per window
  message: { success: false, message: 'Too many auth attempts' }
});
```

---

## 📊 **Error Handling**

### **Global Error Handler**
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field} already exists`, statusCode: 400 };
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
};
```

### **Async Error Handler**
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

---

## 🔄 **Data Validation**

### **Input Sanitization**
```javascript
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .substring(0, 10000);
  }
  return input;
};
```

### **File Upload Validation**
```javascript
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});
```

---

## 📈 **Performance Optimizations**

### **Database Indexes**
```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ careerTrack: 1 });
userSchema.index({ isActive: 1 });

// Curriculum indexes
curriculumSchema.index({ careerTrack: 1 });
curriculumSchema.index({ difficulty: 1 });
curriculumSchema.index({ isActive: 1 });
curriculumSchema.index({ order: 1 });
curriculumSchema.index({ careerTrack: 1, difficulty: 1 });
```

### **Query Optimization**
```javascript
// Use projection to select only needed fields
const users = await User.find(filter).select('name email role careerTrack');

// Use lean() for read-only operations
const curriculum = await Curriculum.find(filter).lean();

// Use populate sparingly and with projection
const curriculum = await Curriculum.findById(id)
  .populate('metadata.createdBy', 'name email')
  .lean();
```

---

## 🔮 **Future Enhancements**

### **Caching Strategy**
```javascript
// Redis caching for frequently accessed data
const cacheCurriculum = async (careerTrack) => {
  const key = `curriculum:${careerTrack}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await Curriculum.find({ careerTrack, isActive: true }).lean();
  await redis.setex(key, 3600, JSON.stringify(data)); // Cache for 1 hour
  
  return data;
};
```

### **Real-time Features**
```javascript
// WebSocket implementation for real-time updates
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('progress-update', (data) => {
    socket.to(data.roomId).emit('progress-updated', data);
  });
});
```

---

**Last Updated**: Current Date
**Version**: 1.0.0 