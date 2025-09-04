# Syncner Learning Management System - Complete API Endpoints

## Document Information
- **Version**: 1.0
- **Date**: January 2024
- **Author**: Development Team
- **Status**: Production Ready

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Student Endpoints](#student-endpoints)
4. [Staff Endpoints](#staff-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Curriculum Endpoints](#curriculum-endpoints)
7. [Progress Endpoints](#progress-endpoints)
8. [Training Endpoints](#training-endpoints)
9. [Attendance Endpoints](#attendance-endpoints)
10. [AI Endpoints](#ai-endpoints)
11. [Settings Endpoints](#settings-endpoints)
12. [Track Endpoints](#track-endpoints)
13. [Health Check Endpoints](#health-check-endpoints)
14. [Public Endpoints](#public-endpoints)

## Authentication Endpoints

### POST /api/auth/register
- **Description**: Register a new user
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "careerTrack": "string"
  }
  ```

### POST /api/auth/login
- **Description**: User login
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### POST /api/auth/logout
- **Description**: User logout
- **Authentication**: Required

### GET /api/auth/profile
- **Description**: Get current user profile
- **Authentication**: Required

### PUT /api/auth/profile
- **Description**: Update user profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "location": "string",
    "college": "string",
    "department": "string"
  }
  ```

### POST /api/auth/forgot-password
- **Description**: Request password reset
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```

### POST /api/auth/reset-password
- **Description**: Reset password with token
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "token": "string",
    "password": "string"
  }
  ```

## User Management Endpoints

### GET /api/users/profile
- **Description**: Get user profile
- **Authentication**: Required

### PUT /api/users/profile
- **Description**: Update user profile
- **Authentication**: Required

### GET /api/users/
- **Description**: Get all users (admin only)
- **Authentication**: Required (Admin)

## Student Endpoints

### GET /api/student/portfolio/me
- **Description**: Get current student's portfolio
- **Authentication**: Required

### GET /api/student/portfolio/:studentId
- **Description**: Get specific student's portfolio
- **Authentication**: Required

### GET /api/student/portfolio/public/:studentId
- **Description**: Get public portfolio (no auth required)
- **Authentication**: None

## Staff Endpoints

### GET /api/staff/students
- **Description**: Get all students with filters and pagination
- **Authentication**: Required (Staff/Admin)
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `search`: Search term
  - `status`: Filter by status
  - `careerTrack`: Filter by career track
  - `sortBy`: Sort field
  - `sortOrder`: Sort direction

### GET /api/staff/students/:id
- **Description**: Get detailed student information
- **Authentication**: Required (Staff/Admin)

### GET /api/staff/analytics
- **Description**: Get staff analytics data
- **Authentication**: Required (Staff/Admin)

### GET /api/staff/leaderboard
- **Description**: Get overall leaderboard
- **Authentication**: Required (Staff/Admin)

### GET /api/staff/leaderboard/:careerTrack
- **Description**: Get career track specific leaderboard
- **Authentication**: Required (Staff/Admin)

### GET /api/staff/test/:id
- **Description**: Get test details
- **Authentication**: Required (Staff/Admin)

## Admin Endpoints

### GET /api/admin/users
- **Description**: Get all users with management capabilities
- **Authentication**: Required (Admin)
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `search`: Search term
  - `role`: Filter by role
  - `status`: Filter by status

### POST /api/admin/users
- **Description**: Create new user
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "string",
    "careerTrack": "string"
  }
  ```

### PUT /api/admin/users/:id
- **Description**: Update user
- **Authentication**: Required (Admin)

### DELETE /api/admin/users/:id
- **Description**: Delete user
- **Authentication**: Required (Admin)

### POST /api/admin/users/:id/reset-password
- **Description**: Reset user password
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "password": "string"
  }
  ```

### GET /api/admin/analytics
- **Description**: Get admin analytics
- **Authentication**: Required (Admin)
- **Query Parameters**:
  - `dateRange`: Date range filter

### GET /api/admin/level-progress
- **Description**: Get level progress analytics
- **Authentication**: Required (Admin)

### GET /api/admin/health
- **Description**: Admin service health check
- **Authentication**: None

### GET /api/admin/diagnostics
- **Description**: System diagnostics
- **Authentication**: Required (Admin)

### GET /api/admin/check-progress-orders
- **Description**: Check progress order consistency
- **Authentication**: Required (Admin)

### POST /api/admin/fix-progress-orders
- **Description**: Fix progress order issues
- **Authentication**: Required (Admin)

### POST /api/admin/cleanup-orphaned-progress
- **Description**: Cleanup orphaned progress records
- **Authentication**: Required (Admin)

## Curriculum Endpoints

### GET /api/curriculum
- **Description**: Get all curriculum items
- **Authentication**: Required (Admin)

### POST /api/curriculum
- **Description**: Create curriculum item
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "type": "string",
    "careerTrack": "string",
    "level": "number",
    "order": "number",
    "content": "string",
    "externalLink": "string",
    "options": ["string"],
    "answer": "string",
    "resources": ["string"]
  }
  ```

### GET /api/curriculum/:id
- **Description**: Get curriculum item by ID
- **Authentication**: Required (Admin)

### PUT /api/curriculum/:id
- **Description**: Update curriculum item
- **Authentication**: Required (Admin)

### DELETE /api/curriculum/:id
- **Description**: Delete curriculum item
- **Authentication**: Required (Admin)

### PATCH /api/curriculum/:id/toggle
- **Description**: Toggle curriculum item status
- **Authentication**: Required (Admin)

### GET /api/curriculum/stats
- **Description**: Get curriculum statistics
- **Authentication**: Required (Admin)

### POST /api/curriculum/invalidate-cache
- **Description**: Invalidate curriculum cache
- **Authentication**: Required (Admin)

### PUT /api/curriculum/bulk-order
- **Description**: Update bulk order of curriculum items
- **Authentication**: Required (Admin)

### DELETE /api/curriculum/level
- **Description**: Delete level by track and order
- **Authentication**: Required (Admin)
- **Query Parameters**:
  - `careerTrack`: Career track name
  - `order`: Level order

### PUT /api/curriculum/level/reorder
- **Description**: Reorder levels within track
- **Authentication**: Required (Admin)

### GET /api/curriculum/type/:type/track/:careerTrack
- **Description**: Get curriculum by type and track
- **Authentication**: Required

### GET /api/curriculum/content/:type
- **Description**: Get content by type
- **Authentication**: Required (Admin)

### GET /api/curriculum/content/:type/track/:careerTrack
- **Description**: Get content by type and track
- **Authentication**: Required (Admin)

### POST /api/curriculum/content
- **Description**: Create content item
- **Authentication**: Required (Admin)

### PUT /api/curriculum/content/:id
- **Description**: Update content item
- **Authentication**: Required (Admin)

### DELETE /api/curriculum/content/:id
- **Description**: Delete content item
- **Authentication**: Required (Admin)

## Progress Endpoints

### GET /api/progress/:careerTrack
- **Description**: Get user progress for career track
- **Authentication**: Required

### GET /api/progress/levels-status
- **Description**: Get levels status
- **Authentication**: Required

### GET /api/progress/unlocked/:levelOrder
- **Description**: Check if level is unlocked
- **Authentication**: Required

### GET /api/progress/test-unlocked/:levelId
- **Description**: Check if test is unlocked
- **Authentication**: Required

### GET /api/progress/exercise-unlocked/:levelId
- **Description**: Check if exercise is unlocked
- **Authentication**: Required

### GET /api/progress/exercise-links/:levelId
- **Description**: Get exercise links
- **Authentication**: Required

### GET /api/progress/level-sections/:levelId
- **Description**: Get level sections status
- **Authentication**: Required

### POST /api/progress/complete
- **Description**: Mark level as completed
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "levelId": "string",
    "levelOrder": "number",
    "section": "string"
  }
  ```

### POST /api/progress/learn-progress
- **Description**: Update learning progress
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "levelId": "string",
    "timeSpent": "number",
    "linksAccessed": ["string"]
  }
  ```

### POST /api/progress/test-attempt
- **Description**: Submit test attempt
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "levelId": "string",
    "score": "number",
    "answers": ["string"]
  }
  ```

### POST /api/progress/submit-exercise
- **Description**: Submit exercise
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "levelId": "string",
    "links": ["string"]
  }
  ```

### PUT /api/progress/update-exercise
- **Description**: Update exercise submission
- **Authentication**: Required

## Training Endpoints

### GET /api/training/levels
- **Description**: Get all training levels
- **Authentication**: Required
- **Query Parameters**:
  - `track`: Career track filter

### GET /api/training/levels/:id
- **Description**: Get specific training level
- **Authentication**: Required

## Attendance Endpoints

### POST /api/attendance/mark
- **Description**: Mark attendance
- **Authentication**: Required

### GET /api/attendance/:userId
- **Description**: Get user attendance
- **Authentication**: Required

### GET /api/attendance/stats/:userId
- **Description**: Get attendance statistics
- **Authentication**: Required

## AI Endpoints

### POST /api/ai/chat
- **Description**: Chat with AI
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "message": "string",
    "context": "string"
  }
  ```

## Settings Endpoints

### GET /api/admin/settings
- **Description**: Get platform settings
- **Authentication**: Required (Admin)

### PUT /api/admin/settings
- **Description**: Update platform settings
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "geminiApiKey": "string",
    "emailSettings": "object",
    "systemSettings": "object"
  }
  ```

## Track Endpoints

### GET /api/tracks
- **Description**: Get all career tracks
- **Authentication**: Required

### GET /api/tracks/:id
- **Description**: Get specific career track
- **Authentication**: Required

## Health Check Endpoints

### GET /api/health
- **Description**: Main health check endpoint
- **Authentication**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Server is running",
    "timestamp": "string",
    "uptime": "string",
    "database": "string",
    "gemini": "string",
    "memoryUsageMB": "number"
  }
  ```

### GET /api/auth/health
- **Description**: Auth service health check
- **Authentication**: None

### GET /api/users/health
- **Description**: Users service health check
- **Authentication**: None

### GET /api/tracks/health
- **Description**: Tracks service health check
- **Authentication**: None

### GET /api/training/health
- **Description**: Training service health check
- **Authentication**: None

### GET /api/admin/health
- **Description**: Admin service health check
- **Authentication**: None

### GET /api/admin/settings/health
- **Description**: Settings service health check
- **Authentication**: None

### GET /api/ai/health
- **Description**: AI service health check
- **Authentication**: None

### GET /api/curriculum/health
- **Description**: Curriculum service health check
- **Authentication**: None

## Public Endpoints

### GET /api/student/portfolio/public/:studentId
- **Description**: Get public portfolio (no authentication required)
- **Authentication**: None

## File Upload Endpoints

### POST /api/upload
- **Description**: Upload file
- **Authentication**: Required
- **Content-Type**: multipart/form-data

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- **Production**: 100 requests per 15 minutes per IP
- **Development**: No rate limiting

## CORS

Allowed origins:
- `https://syncner-test.netlify.app`
- `http://localhost:5173`
- `http://localhost:3000`

---

**Document Version**: v1.0  
**Last Updated**: January 2024  
**Next Review**: January 2025
