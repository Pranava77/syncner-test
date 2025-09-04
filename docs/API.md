# Syncner API Documentation

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Student Endpoints](#student-endpoints)
4. [Staff Management](#staff-management)
5. [Admin Management](#admin-management)
6. [Curriculum Management](#curriculum-management)
7. [Student Progress](#student-progress)
8. [Training Endpoints](#training-endpoints)
9. [Attendance Management](#attendance-management)
10. [AI Integration](#ai-integration)
11. [Settings](#settings)
12. [Track Management](#track-management)
13. [Health Checks](#health-checks)
14. [Public Endpoints](#public-endpoints)
15. [File Upload](#file-upload)
16. [Error Handling](#error-handling)

## 🔐 Authentication

### Base URL
```
Production: https://syncner-test.onrender.com/api
Development: http://localhost:5000/api
```

### Authentication Headers
All protected endpoints require a Bearer token:
```http
Authorization: Bearer <jwt_token>
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "student@example.com",
      "role": "student",
      "careerTrack": "full-stack",
      "profileComplete": true
    }
  }
}
```

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "student@example.com",
  "password": "password123",
  "careerTrack": "full-stack"
}
```

### Get Current User
```http
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "student@example.com",
    "role": "student",
    "careerTrack": "full-stack",
    "college": "Example University",
    "profileComplete": true
  }
}
```

## 👥 User Management

### Get All Users (Admin Only)
```http
GET /api/admin/users?page=1&limit=20&role=student&careerTrack=full-stack
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by role (student, staff, admin)
- `careerTrack`: Filter by career track
- `search`: Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "student@example.com",
        "role": "student",
        "careerTrack": "full-stack",
        "college": "Example University",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Create User (Admin Only)
```http
POST /api/admin/users
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student",
  "careerTrack": "ai-ml",
  "college": "Example University"
}
```

### Update User (Admin Only)
```http
PUT /api/admin/users/:userId
```

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "careerTrack": "data-science",
  "isActive": true
}
```

### Delete User (Admin Only)
```http
DELETE /api/admin/users/:userId
```

### Reset User Password (Admin Only)
```http
POST /api/admin/users/:userId/reset-password
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

## 📚 Curriculum Management

### Get All Curriculum Items
```http
GET /api/curriculum?careerTrack=full-stack&type=level
```

**Query Parameters:**
- `careerTrack`: Filter by career track
- `type`: Filter by type (level, content)
- `isActive`: Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Introduction to Web Development",
      "description": "Learn the basics of web development",
      "careerTrack": "full-stack",
      "order": 1,
      "difficulty": "beginner",
      "duration": "4 weeks",
      "isActive": true,
      "learn": [
        {
          "id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "title": "HTML Basics",
          "content": "Learn HTML fundamentals",
          "order": 1
        }
      ],
      "test": [
        {
          "id": "64f1a2b3c4d5e6f7g8h9i0j3",
          "question": "What does HTML stand for?",
          "options": ["HyperText Markup Language", "Home Tool Markup Language"],
          "answer": "HyperText Markup Language",
          "order": 1
        }
      ],
      "exercise": [
        {
          "id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "title": "Create a Basic HTML Page",
          "description": "Build your first HTML page",
          "resources": ["https://example.com/tutorial"],
          "order": 1
        }
      ]
    }
  ]
}
```

### Create Curriculum Level (Admin Only)
```http
POST /api/curriculum/levels
```

**Request Body:**
```json
{
  "title": "Advanced React Concepts",
  "description": "Learn advanced React patterns and hooks",
  "careerTrack": "full-stack",
  "difficulty": "intermediate",
  "duration": "3 weeks",
  "estimatedHours": 20,
  "skills": ["React", "JavaScript", "Hooks"],
  "prerequisites": ["Basic React Knowledge"],
  "isActive": true,
  "order": 5
}
```

### Update Curriculum Level (Admin Only)
```http
PUT /api/curriculum/levels/:levelId
```

### Delete Curriculum Level (Admin Only)
```http
DELETE /api/curriculum/levels/:levelId
```

### Add Content to Level (Admin Only)
```http
POST /api/curriculum/levels/:levelId/content
```

**Request Body:**
```json
{
  "type": "learn",
  "title": "React Hooks Deep Dive",
  "content": "Comprehensive guide to React hooks",
  "order": 1
}
```

## 📊 Student Progress

### Get User Progress
```http
GET /api/progress/user/:careerTrack
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentLevel": 3,
    "completedLevels": 2,
    "totalLevels": 10,
    "progress": [
      {
        "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
        "levelOrder": 1,
        "learn": {
          "completed": true,
          "timeSpent": 1200,
          "linksAccessed": ["https://example.com/tutorial1"]
        },
        "test": {
          "completed": true,
          "score": 85,
          "attempts": 2
        },
        "exercise": {
          "completed": true,
          "timeSpent": 1800,
          "submissions": [
            {
              "links": ["https://github.com/user/project1"],
              "submittedAt": "2024-01-15T14:30:00Z",
              "status": "approved"
            }
          ]
        }
      }
    ]
  }
}
```

### Mark Level Completed
```http
POST /api/progress/complete
```

**Request Body:**
```json
{
  "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "levelOrder": 1,
  "section": "learn"
}
```

### Update Learn Progress
```http
POST /api/progress/learn
```

**Request Body:**
```json
{
  "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "timeSpent": 600,
  "linksAccessed": ["https://example.com/tutorial1", "https://example.com/tutorial2"]
}
```

### Submit Test Attempt
```http
POST /api/progress/test
```

**Request Body:**
```json
{
  "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "score": 85,
  "answers": [
    {
      "questionId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "selectedAnswer": "HyperText Markup Language"
    }
  ]
}
```

### Submit Exercise
```http
POST /api/progress/exercise
```

**Request Body:**
```json
{
  "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "exerciseTitle": "Create a Basic HTML Page",
  "links": ["https://github.com/user/project1"],
  "score": 90,
  "feedback": "Great work! Well structured code."
}
```

## 👨‍🏫 Staff Management

### Get All Students (Staff Only)
```http
GET /api/staff/students?page=1&limit=20&careerTrack=full-stack&status=active
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `careerTrack`: Filter by career track
- `status`: Filter by status (active, inactive)
- `search`: Search by name or email
- `sortBy`: Sort by field (name, progress, lastActive)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "student@example.com",
        "careerTrack": "full-stack",
        "progress": 75,
        "status": "active",
        "lastActive": "2024-01-15T10:30:00Z",
        "totalPoints": 1250,
        "attendancePercentage": 85,
        "leaderboardScore": 92
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalStudents": 200,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Get Student Details (Staff Only)
```http
GET /api/staff/students/:studentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "student@example.com",
      "careerTrack": "full-stack",
      "college": "Example University",
      "progress": 75,
      "attendancePercentage": 85,
      "leaderboardScore": 92,
      "leaderboardRank": 5
    },
    "learningTimeline": [
      {
        "levelOrder": 1,
        "levelTitle": "Introduction to Web Development",
        "overallStatus": "completed",
        "sections": {
          "learn": {
            "status": "completed",
            "details": {
              "startDate": "2024-01-10T09:00:00Z",
              "endDate": "2024-01-12T17:00:00Z",
              "timeSpent": 1200
            }
          },
          "test": {
            "status": "completed",
            "details": {
              "startDate": "2024-01-12T18:00:00Z",
              "endDate": "2024-01-12T19:30:00Z",
              "score": 85,
              "attempts": 2
            }
          },
          "exercise": {
            "status": "completed",
            "details": {
              "startDate": "2024-01-13T10:00:00Z",
              "endDate": "2024-01-15T16:00:00Z",
              "timeSpent": 1800
            }
          }
        }
      }
    ],
    "dailyActivity": [
      {
        "date": "2024-01-15",
        "totalMinutes": 120,
        "activities": ["learn", "test"],
        "isPresent": true
      }
    ]
  }
}
```

### Get Student Portfolio (Staff Only)
```http
GET /api/staff/portfolio/:studentId
```

### Get Staff Analytics (Staff Only)
```http
GET /api/staff/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalStudents": 200,
      "activeStudents": 180,
      "completionRate": 75,
      "avgProgress": 68,
      "trackDistribution": [
        {
          "track": "full-stack",
          "count": 80,
          "totalLevels": 10
        },
        {
          "track": "ai-ml",
          "count": 60,
          "totalLevels": 12
        }
      ]
    }
  }
}
```

## 📈 Analytics

### Get Admin Analytics (Admin Only)
```http
GET /api/admin/analytics?dateRange=30d
```

**Query Parameters:**
- `dateRange`: Date range for analytics (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 500,
    "activeStudents": 450,
    "completionRate": 78,
    "avgProgress": 72,
    "attendanceData": [
      {
        "day": "2024-01-15",
        "students": 420
      }
    ],
    "trackDistribution": [
      {
        "track": "full-stack",
        "count": 200
      },
      {
        "track": "ai-ml",
        "count": 150
      }
    ]
  }
}
```

### Get Level Progress Analytics (Admin Only)
```http
GET /api/admin/level-progress
```

## ⚙️ Settings

### Get Settings
```http
GET /api/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "geminiApiKey": "configured",
    "attendanceEnabled": true,
    "leaderboardEnabled": true,
    "aiChatEnabled": true,
    "maxTestAttempts": 3,
    "attendanceMarkingTime": "09:00"
  }
}
```

### Update Settings (Admin Only)
```http
PUT /api/settings
```

**Request Body:**
```json
{
  "geminiApiKey": "new-api-key",
  "attendanceEnabled": true,
  "maxTestAttempts": 5
}
```

## 🤖 AI Integration

### Chat with AI
```http
POST /api/ai/chat
```

**Request Body:**
```json
{
  "message": "How do I create a React component?",
  "context": "student learning React"
}
```

**Response:**
```json
{
  "success": true,
  "data": "To create a React component, you can use either function components or class components. Here's how to create a simple function component..."
}
```

## 📅 Attendance

### Mark Attendance
```http
POST /api/attendance/mark
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Attendance marked successfully",
    "streak": 5,
    "totalDays": 25
  }
}
```

### Get Attendance
```http
GET /api/attendance/:userId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "status": "present",
      "markedAt": "2024-01-15T09:15:00Z"
    }
  ]
}
```

### Get Attendance Stats
```http
GET /api/attendance/stats/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDays": 30,
    "presentDays": 25,
    "percentage": 83.33,
    "currentStreak": 5,
    "longestStreak": 12
  }
}
```

## 🎯 Portfolio

### Get Student Portfolio
```http
GET /api/portfolio/student/:studentId
```

### Get Public Portfolio
```http
GET /api/portfolio/public/:studentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "John Doe",
      "email": "student@example.com",
      "careerTrack": "full-stack",
      "college": "Example University",
      "certificateId": "CERT-2024-001",
      "readyToHire": true,
      "skills": ["React", "Node.js", "MongoDB"],
      "recommendedRoles": ["Frontend Developer", "Full Stack Developer"]
    },
    "progress": {
      "currentLevel": 8,
      "completedLevels": 7,
      "totalLevels": 10,
      "percentage": 70
    },
    "attendance": {
      "totalDays": 100,
      "presentDays": 85,
      "percentage": 85
    },
    "leaderboard": {
      "score": 92,
      "rank": 5
    }
  }
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Resource already exists
- `SERVER_ERROR`: Internal server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `500`: Internal Server Error

## 🔒 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

## 📝 Request/Response Examples

### Complete Student Registration Flow

1. **Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "careerTrack": "full-stack"
}
```

2. **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

3. **Get Learning Levels**
```http
GET /api/curriculum?careerTrack=full-stack
Authorization: Bearer <token>
```

4. **Start Learning**
```http
POST /api/progress/learn
Authorization: Bearer <token>
Content-Type: application/json

{
  "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "timeSpent": 300,
  "linksAccessed": ["https://example.com/tutorial"]
}
```

5. **Submit Test**
```http
POST /api/progress/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "levelId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "score": 85,
  "answers": [
    {
      "questionId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "selectedAnswer": "HyperText Markup Language"
    }
  ]
}
```

## 🎓 Student Endpoints

### Get Student Portfolio
```http
GET /api/student/portfolio/me
Authorization: Bearer <token>
```

### Get Specific Student Portfolio
```http
GET /api/student/portfolio/:studentId
Authorization: Bearer <token>
```

### Get Public Portfolio
```http
GET /api/student/portfolio/public/:studentId
```

## 🏫 Training Endpoints

### Get All Training Levels
```http
GET /api/training/levels?track=full-stack
Authorization: Bearer <token>
```

### Get Specific Training Level
```http
GET /api/training/levels/:id
Authorization: Bearer <token>
```

## 📅 Attendance Management

### Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer <token>
```

### Get User Attendance
```http
GET /api/attendance/:userId
Authorization: Bearer <token>
```

### Get Attendance Statistics
```http
GET /api/attendance/stats/:userId
Authorization: Bearer <token>
```

## 🎯 Track Management

### Get All Career Tracks
```http
GET /api/tracks
Authorization: Bearer <token>
```

### Get Specific Career Track
```http
GET /api/tracks/:id
Authorization: Bearer <token>
```

## 🏥 Health Checks

### Main Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": "2h 15m 30s",
  "database": "Connected",
  "gemini": "Connected",
  "memoryUsageMB": 128
}
```

### Service-Specific Health Checks
```http
GET /api/auth/health
GET /api/users/health
GET /api/tracks/health
GET /api/training/health
GET /api/admin/health
GET /api/admin/settings/health
GET /api/ai/health
GET /api/curriculum/health
```

## 🌍 Public Endpoints

### Get Public Portfolio
```http
GET /api/student/portfolio/public/:studentId
```

## 📁 File Upload

### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
```

## 🔧 SDK and Client Libraries

### JavaScript/TypeScript Client
```javascript
import { SyncnerAPI } from '@syncner/api-client';

const api = new SyncnerAPI({
  baseURL: 'https://syncner-test.onrender.com/api',
  token: 'your-jwt-token'
});

// Get student progress
const progress = await api.getUserProgress('full-stack');

// Submit test
const result = await api.submitTest('level-id', {
  score: 85,
  answers: [...]
});
```

## 📊 Webhooks

### Available Webhooks
- `student.progress.updated`: When student progress is updated
- `student.test.completed`: When a test is completed
- `student.exercise.submitted`: When an exercise is submitted
- `attendance.marked`: When attendance is marked

### Webhook Payload Example
```json
{
  "event": "student.progress.updated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "studentId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "levelId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "progress": 75,
    "section": "learn"
  }
}
```

---

**API Version**: v1.0  
**Last Updated**: January 2024  
**Base URL**: https://syncner-backend.onrender.com
