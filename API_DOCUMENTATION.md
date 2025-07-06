# Syncner API Documentation

## Overview

The Syncner API is a RESTful API for a learning management system that provides endpoints for user authentication, task management, progress tracking, resume generation, and AI-powered features.

**Base URL:** `https://your-domain.com/api`

**Authentication:** JWT Bearer Token (for protected routes)

## Table of Contents

1. [Authentication](#authentication)
2. [Health Checks](#health-checks)
3. [User Management](#user-management)
4. [Task Management](#task-management)
5. [Progress Tracking](#progress-tracking)
6. [Resume Management](#resume-management)
7. [Training Modules](#training-modules)
8. [Career Tracks](#career-tracks)
9. [Submissions](#submissions)
10. [Admin Operations](#admin-operations)
11. [Settings](#settings)
12. [AI Services](#ai-services)
13. [Error Handling](#error-handling)

---

## Authentication

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "college": "University of Technology",
  "role": "student"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "college": "University of Technology",
      "role": "student",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "college": "University of Technology",
      "role": "student",
      "department": "Computer Science",
      "phone": "+1234567890",
      "location": "New York",
      "careerTrack": "fullstack",
      "interests": ["web development", "javascript"],
      "level": "beginner",
      "gpa": "3.8",
      "graduationYear": "2025"
    }
  }
}
```

### Update Profile
**PUT** `/auth/profile`

Update current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "department": "Computer Science",
  "phone": "+1234567890",
  "location": "New York",
  "careerTrack": "fullstack",
  "interests": ["web development", "javascript", "react"],
  "level": "intermediate",
  "gpa": "3.8",
  "graduationYear": "2025"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe Updated",
      "email": "john@example.com",
      "department": "Computer Science",
      "phone": "+1234567890",
      "location": "New York",
      "careerTrack": "fullstack",
      "interests": ["web development", "javascript", "react"],
      "level": "intermediate",
      "gpa": "3.8",
      "graduationYear": "2025"
    }
  }
}
```

### Logout
**POST** `/auth/logout`

Logout user (client should discard token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "new_password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Health Checks

### Main Health Check
**GET** `/health`

Get overall system health status.

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "2h 30m 45s",
  "database": "Connected",
  "gemini": "Connected",
  "memoryUsageMB": 128
}
```

### Module Health Checks
Each module has its own health check endpoint:

- **Auth:** `GET /auth/health`
- **Users:** `GET /users/health`
- **Tracks:** `GET /tracks/health`
- **Training:** `GET /training/health`
- **Tasks:** `GET /tasks/health`
- **Progress:** `GET /progress/health`
- **Admin:** `GET /admin/health`
- **Resume:** `GET /resume/health`
- **Submissions:** `GET /submissions/health`
- **Settings:** `GET /admin/settings/health`
- **AI:** `GET /ai/health`

### System Diagnostics
**GET** `/admin/diagnostics`

Get comprehensive system diagnostics (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "diagnostics": [
    {
      "module": "auth",
      "healthy": true,
      "message": "Auth module is healthy",
      "error": null
    },
    {
      "module": "tasks",
      "healthy": true,
      "message": "Tasks module is healthy",
      "error": null
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## User Management

### Get All Users (Admin)
**GET** `/admin/users`

Get all users in the system (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "college": "University of Technology",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Create User (Admin)
**POST** `/admin/users`

Create a new user (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student",
  "college": "University of Technology"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "student",
      "college": "University of Technology"
    }
  }
}
```

### Update User (Admin)
**PUT** `/admin/users/:id`

Update user information (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "role": "admin",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Jane Smith Updated",
      "email": "jane@example.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

### Delete User (Admin)
**DELETE** `/admin/users/:id`

Delete a user (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Task Management

### Get All Tasks
**GET** `/tasks`

Get all available tasks (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Build a Todo App",
        "description": "Create a full-stack todo application",
        "difficulty": "beginner",
        "category": "fullstack",
        "estimatedTime": 120,
        "requirements": ["HTML", "CSS", "JavaScript"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Task by ID
**GET** `/tasks/:id`

Get specific task details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "task_id",
      "title": "Build a Todo App",
      "description": "Create a full-stack todo application",
      "difficulty": "beginner",
      "category": "fullstack",
      "estimatedTime": 120,
      "requirements": ["HTML", "CSS", "JavaScript"],
      "instructions": "Step by step instructions...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Upcoming Tasks
**GET** `/tasks/upcoming`

Get upcoming tasks for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Build a Todo App",
        "difficulty": "beginner",
        "dueDate": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

### Get All Student Tasks
**GET** `/tasks/all`

Get all tasks with user progress information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Build a Todo App",
        "difficulty": "beginner",
        "status": "completed",
        "completedAt": "2024-01-10T00:00:00.000Z",
        "score": 85
      }
    ]
  }
}
```

### Submit Task
**POST** `/tasks/:id/submit`

Submit a task solution.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "I built a todo app using React and Node.js",
  "liveUrl": "https://my-todo-app.vercel.app",
  "githubUrl": "https://github.com/username/todo-app",
  "notes": "Additional notes about the implementation",
  "files": ["file1.pdf", "file2.zip"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task submitted successfully",
  "data": {
    "submission": {
      "_id": "submission_id",
      "task": "task_id",
      "student": "user_id",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Create Task (Admin)
**POST** `/tasks`

Create a new task (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Build a Weather App",
  "description": "Create a weather application using APIs",
  "difficulty": "intermediate",
  "category": "fullstack",
  "estimatedTime": 180,
  "requirements": ["React", "API Integration", "CSS"],
  "instructions": "Detailed instructions..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "task_id",
      "title": "Build a Weather App",
      "description": "Create a weather application using APIs",
      "difficulty": "intermediate",
      "category": "fullstack",
      "estimatedTime": 180,
      "requirements": ["React", "API Integration", "CSS"],
      "instructions": "Detailed instructions...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Task (Admin)
**PUT** `/tasks/:id`

Update an existing task (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Build a Weather App - Updated",
  "description": "Updated description",
  "difficulty": "advanced"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "task_id",
      "title": "Build a Weather App - Updated",
      "description": "Updated description",
      "difficulty": "advanced"
    }
  }
}
```

### Delete Task (Admin)
**DELETE** `/tasks/:id`

Delete a task (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Progress Tracking

### Get User Progress
**GET** `/progress`

Get current user's progress information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "progress": {
      "_id": "progress_id",
      "user": "user_id",
      "careerTrack": "fullstack",
      "completedTasks": 15,
      "totalTasks": 50,
      "completedModules": 3,
      "totalModules": 10,
      "currentLevel": "intermediate",
      "points": 1250,
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update User Progress
**PATCH** `/progress`

Update user's progress information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "completedTasks": 16,
  "completedModules": 4,
  "points": 1300,
  "currentLevel": "advanced"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "progress": {
      "_id": "progress_id",
      "user": "user_id",
      "completedTasks": 16,
      "completedModules": 4,
      "points": 1300,
      "currentLevel": "advanced",
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Progress (Admin)
**GET** `/progress`

Get all users' progress (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "_id": "progress_id",
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "careerTrack": "fullstack",
        "completedTasks": 15,
        "totalTasks": 50,
        "completedModules": 3,
        "totalModules": 10,
        "currentLevel": "intermediate",
        "points": 1250
      }
    ]
  }
}
```

---

## Resume Management

### Get User Resume
**GET** `/resume`

Get current user's resume data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resume": {
      "_id": "resume_id",
      "user": "user_id",
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": "New York"
      },
      "summary": "Experienced full-stack developer...",
      "skills": ["JavaScript", "React", "Node.js"],
      "projects": [
        {
          "title": "Todo App",
          "description": "A full-stack todo application",
          "technologies": ["React", "Node.js"],
          "githubUrl": "https://github.com/username/todo-app",
          "liveUrl": "https://todo-app.vercel.app"
        }
      ],
      "education": {
        "degree": "Bachelor of Science",
        "major": "Computer Science",
        "university": "University of Technology",
        "graduationYear": "2025",
        "gpa": "3.8"
      },
      "certifications": [
        {
          "name": "React Developer",
          "issuer": "Meta",
          "date": "2024-01-01"
        }
      ]
    }
  }
}
```

### Create/Update Resume
**POST** `/resume`

Create or update user's resume.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York"
  },
  "summary": "Experienced full-stack developer with expertise in modern web technologies.",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "projects": [
    {
      "title": "Todo App",
      "description": "A full-stack todo application",
      "technologies": ["React", "Node.js"],
      "githubUrl": "https://github.com/username/todo-app",
      "liveUrl": "https://todo-app.vercel.app"
    }
  ],
  "education": {
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "university": "University of Technology",
    "graduationYear": "2025",
    "gpa": "3.8"
  },
  "certifications": [
    {
      "name": "React Developer",
      "issuer": "Meta",
      "date": "2024-01-01"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Resume saved successfully",
  "data": {
    "resume": {
      "_id": "resume_id",
      "user": "user_id",
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": "New York"
      },
      "summary": "Experienced full-stack developer with expertise in modern web technologies.",
      "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "projects": [
        {
          "title": "Todo App",
          "description": "A full-stack todo application",
          "technologies": ["React", "Node.js"],
          "githubUrl": "https://github.com/username/todo-app",
          "liveUrl": "https://todo-app.vercel.app"
        }
      ],
      "education": {
        "degree": "Bachelor of Science",
        "major": "Computer Science",
        "university": "University of Technology",
        "graduationYear": "2025",
        "gpa": "3.8"
      },
      "certifications": [
        {
          "name": "React Developer",
          "issuer": "Meta",
          "date": "2024-01-01"
        }
      ],
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Resume Templates
**GET** `/resume/templates?track=fullstack`

Get resume template for a specific career track.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "careerTrack": "fullstack",
    "sections": ["personalInfo", "summary", "skills", "projects", "certifications", "education"],
    "template": "professional"
  }
}
```

---

## Training Modules

### Get All Modules
**GET** `/training`

Get all training modules.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "_id": "module_id",
        "title": "JavaScript Fundamentals",
        "description": "Learn the basics of JavaScript programming",
        "difficulty": "beginner",
        "category": "programming",
        "estimatedTime": 120,
        "content": "Module content here...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Module by ID
**GET** `/training/:id`

Get specific module details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "module": {
      "_id": "module_id",
      "title": "JavaScript Fundamentals",
      "description": "Learn the basics of JavaScript programming",
      "difficulty": "beginner",
      "category": "programming",
      "estimatedTime": 120,
      "content": "Detailed module content...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Create Module (Admin)
**POST** `/training`

Create a new training module (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Learn advanced React patterns and best practices",
  "difficulty": "advanced",
  "category": "frontend",
  "estimatedTime": 180,
  "content": "Detailed module content..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "module": {
      "_id": "module_id",
      "title": "Advanced React Patterns",
      "description": "Learn advanced React patterns and best practices",
      "difficulty": "advanced",
      "category": "frontend",
      "estimatedTime": 180,
      "content": "Detailed module content...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Module (Admin)
**PUT** `/training/:id`

Update an existing module (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Advanced React Patterns - Updated",
  "description": "Updated description",
  "difficulty": "intermediate"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Module updated successfully",
  "data": {
    "module": {
      "_id": "module_id",
      "title": "Advanced React Patterns - Updated",
      "description": "Updated description",
      "difficulty": "intermediate"
    }
  }
}
```

### Delete Module (Admin)
**DELETE** `/training/:id`

Delete a module (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Module deleted successfully"
}
```

---

## Career Tracks

### Get All Tracks
**GET** `/tracks`

Get all available career tracks.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tracks": [
      {
        "_id": "track_id",
        "name": "Full Stack Development",
        "slug": "fullstack",
        "description": "Learn full-stack web development",
        "difficulty": "intermediate",
        "estimatedDuration": 6,
        "modules": ["module_id_1", "module_id_2"],
        "tasks": ["task_id_1", "task_id_2"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Track by ID
**GET** `/tracks/:id`

Get specific track details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "track": {
      "_id": "track_id",
      "name": "Full Stack Development",
      "slug": "fullstack",
      "description": "Learn full-stack web development",
      "difficulty": "intermediate",
      "estimatedDuration": 6,
      "modules": [
        {
          "_id": "module_id",
          "title": "JavaScript Fundamentals",
          "difficulty": "beginner"
        }
      ],
      "tasks": [
        {
          "_id": "task_id",
          "title": "Build a Todo App",
          "difficulty": "beginner"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Submissions

### Get My Submissions
**GET** `/submissions/my`

Get current user's submissions.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "submission_id",
      "taskTitle": "Build a Todo App",
      "status": "approved",
      "score": 85,
      "feedback": "Great work! Well-structured code.",
      "description": "I built a todo app using React and Node.js",
      "liveUrl": "https://my-todo-app.vercel.app",
      "githubUrl": "https://github.com/username/todo-app",
      "notes": "Additional notes",
      "files": ["file1.pdf", "file2.zip"],
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "reviewedBy": "admin_id",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get All Submissions (Admin)
**GET** `/submissions`

Get all submissions (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "submission_id",
        "taskId": "task_id",
        "taskTitle": "Build a Todo App",
        "taskDifficulty": "beginner",
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "submittedAt": "2024-01-01T00:00:00.000Z",
        "status": "pending",
        "description": "I built a todo app using React and Node.js",
        "liveUrl": "https://my-todo-app.vercel.app",
        "githubUrl": "https://github.com/username/todo-app",
        "notes": "Additional notes",
        "files": ["file1.pdf", "file2.zip"],
        "score": null,
        "feedback": null,
        "reviewedAt": null,
        "reviewedBy": null
      }
    ]
  }
}
```

### Review Submission (Admin)
**PATCH** `/submissions/:id/review`

Review a submission (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "approved",
  "score": 85,
  "feedback": "Excellent work! The code is well-structured and follows best practices."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Submission reviewed successfully",
  "data": {
    "submission": {
      "_id": "submission_id",
      "status": "approved",
      "score": 85,
      "feedback": "Excellent work! The code is well-structured and follows best practices.",
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "reviewedBy": "admin_id"
    }
  }
}
```

---

## Admin Operations

### Get Analytics
**GET** `/admin/analytics`

Get system analytics (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalUsers": 150,
      "activeUsers": 120,
      "totalTasks": 50,
      "completedTasks": 750,
      "totalSubmissions": 800,
      "pendingSubmissions": 50,
      "averageScore": 82.5,
      "popularTracks": [
        {
          "track": "fullstack",
          "count": 45
        },
        {
          "track": "ai-ml",
          "count": 35
        }
      ],
      "recentActivity": [
        {
          "type": "task_submission",
          "user": "John Doe",
          "task": "Build a Todo App",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

---

## Settings

### Get Settings (Admin)
**GET** `/admin/settings`

Get system settings (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "_id": "settings_id",
      "siteName": "Syncner",
      "siteDescription": "Learning Management System",
      "maintenanceMode": false,
      "registrationEnabled": true,
      "maxFileSize": 10485760,
      "allowedFileTypes": ["pdf", "zip", "jpg", "png"],
      "emailSettings": {
        "smtpHost": "smtp.gmail.com",
        "smtpPort": 587,
        "fromEmail": "noreply@syncner.com"
      },
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Settings (Admin)
**PUT** `/admin/settings`

Update system settings (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "siteName": "Syncner - Updated",
  "maintenanceMode": false,
  "registrationEnabled": true,
  "maxFileSize": 20971520
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "settings": {
      "_id": "settings_id",
      "siteName": "Syncner - Updated",
      "maintenanceMode": false,
      "registrationEnabled": true,
      "maxFileSize": 20971520,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## AI Services

### Chat with AI
**POST** `/ai/chat`

Chat with AI assistant.

**Request Body:**
```json
{
  "message": "How do I build a React component?",
  "context": "student_help"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "response": "To build a React component, you can use either function components or class components...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Generate Task Feedback
**POST** `/ai/feedback`

Generate AI-powered feedback for task submissions.

**Request Body:**
```json
{
  "taskTitle": "Build a Todo App",
  "submissionDescription": "I built a todo app using React and Node.js",
  "codeSnippet": "function TodoApp() { ... }",
  "requirements": ["React", "Node.js", "Database"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "feedback": "Your todo app implementation shows good understanding of React concepts...",
    "score": 85,
    "suggestions": [
      "Consider adding error handling",
      "Implement proper state management",
      "Add unit tests"
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Generate Resume Content
**POST** `/ai/resume`

Generate AI-powered resume content.

**Request Body:**
```json
{
  "careerTrack": "fullstack",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": "2 years of web development",
  "education": "Bachelor in Computer Science"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": "Experienced full-stack developer with 2 years of expertise in modern web technologies...",
    "suggestedSkills": ["TypeScript", "MongoDB", "Docker"],
    "projectIdeas": [
      "E-commerce platform with React and Node.js",
      "Real-time chat application",
      "Task management system"
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Conflict Error (409)
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 100 requests per 15 minutes per IP address
- **Applies to:** All `/api/` routes in production
- **Response:** 429 Too Many Requests with appropriate message

---

## File Uploads

The API supports file uploads for task submissions:

- **Max File Size:** 10MB (configurable)
- **Allowed Types:** PDF, ZIP, JPG, PNG (configurable)
- **Upload Endpoint:** Files are served from `/uploads/` directory
- **File URLs:** `https://your-domain.com/uploads/filename.ext`

---

## Authentication

### JWT Token Format
```
Authorization: Bearer <jwt_token>
```

### Token Expiration
- **Default:** 24 hours
- **Refresh:** Log in again to get a new token

### Protected Routes
All routes marked with "Private" or "Admin" require a valid JWT token in the Authorization header.

---

## CORS

The API supports CORS for cross-origin requests:

- **Allowed Origins:** Configured for production domains
- **Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Headers:** Content-Type, Authorization, X-Requested-With, Accept
- **Credentials:** Supported

---

## Versioning

The current API version is v1. Future versions will be available at `/api/v2/`, `/api/v3/`, etc.

---

## Support

For API support and questions:
- **Email:** support@syncner.com
- **Documentation:** https://docs.syncner.com
- **Status Page:** https://status.syncner.com 