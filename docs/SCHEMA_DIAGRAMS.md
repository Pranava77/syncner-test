# Syncner Learning Management System - Schema Diagrams

## Document Information
- **Version**: 1.0
- **Date**: January 2024
- **Author**: Development Team
- **Status**: Production Ready

## Table of Contents
1. [Database Schema Diagram](#database-schema-diagram)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [API Schema Diagram](#api-schema-diagram)
4. [Component Schema Diagram](#component-schema-diagram)
5. [Data Flow Schema](#data-flow-schema)
6. [Authentication Schema](#authentication-schema)
7. [Portfolio Generation Schema](#portfolio-generation-schema)

## Database Schema Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        string careerTrack
        string college
        string department
        string phone
        string location
        string gpa
        string graduationYear
        boolean profileComplete
        boolean isActive
        date lastActive
        date createdAt
        date updatedAt
    }
    
    USERPROGRESS {
        ObjectId _id PK
        ObjectId userId FK
        string careerTrack
        number currentLevel
        array completedLevels
        array learnProgress
        array testProgress
        array exerciseProgress
        date createdAt
        date updatedAt
    }
    
    CURRICULUM {
        ObjectId _id PK
        string title
        string description
        string type
        string careerTrack
        number level
        number order
        string content
        string externalLink
        array options
        string answer
        array resources
        boolean isActive
        date createdAt
        date updatedAt
    }
    
    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        date date
        string status
        date markedAt
        string markedBy
    }
    
    SETTINGS {
        ObjectId _id PK
        string key
        any value
        string category
        string description
        date createdAt
        date updatedAt
    }
    
    TRACK {
        ObjectId _id PK
        string name
        string displayName
        string description
        string difficulty
        number totalLevels
        array skills
        array prerequisites
        boolean isActive
        date createdAt
        date updatedAt
    }
    
    USER ||--o{ USERPROGRESS : "has progress"
    USER ||--o{ ATTENDANCE : "has attendance"
    USER }o--|| TRACK : "enrolled in"
    CURRICULUM }o--|| TRACK : "belongs to"
```

## Entity Relationship Diagram

```mermaid
graph TB
    subgraph "User Management"
        A[User]
        B[UserProgress]
        C[Attendance]
    end
    
    subgraph "Learning System"
        D[Curriculum]
        E[Track]
        F[Level]
    end
    
    subgraph "System Configuration"
        G[Settings]
        H[SystemLogs]
    end
    
    subgraph "Progress Tracking"
        I[LearnProgress]
        J[TestProgress]
        K[ExerciseProgress]
    end
    
    A -->|1:N| B
    A -->|1:N| C
    A -->|N:1| E
    B -->|1:N| I
    B -->|1:N| J
    B -->|1:N| K
    E -->|1:N| D
    D -->|1:N| F
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#f3e5f5
```

## Complete API Schema Diagram

```mermaid
graph TD
    subgraph "🔐 Authentication APIs"
        A1[POST /api/auth/register]
        A2[POST /api/auth/login]
        A3[POST /api/auth/logout]
        A4[GET /api/auth/profile]
        A5[PUT /api/auth/profile]
        A6[POST /api/auth/forgot-password]
        A7[POST /api/auth/reset-password]
        A8[GET /api/auth/health]
    end
    
    subgraph "👤 User Management APIs"
        U1[GET /api/users/profile]
        U2[PUT /api/users/profile]
        U3[GET /api/users/]
        U4[GET /api/users/health]
    end
    
    subgraph "🎓 Student APIs"
        ST1[GET /api/student/portfolio/me]
        ST2[GET /api/student/portfolio/:studentId]
        ST3[GET /api/student/portfolio/public/:studentId]
    end
    
    subgraph "👨‍🏫 Staff APIs"
        S1[GET /api/staff/students]
        S2[GET /api/staff/students/:id]
        S3[GET /api/staff/analytics]
        S4[GET /api/staff/leaderboard]
        S5[GET /api/staff/leaderboard/:careerTrack]
        S6[GET /api/staff/test/:id]
    end
    
    subgraph "⚙️ Admin APIs"
        AD1[GET /api/admin/users]
        AD2[POST /api/admin/users]
        AD3[PUT /api/admin/users/:id]
        AD4[DELETE /api/admin/users/:id]
        AD5[POST /api/admin/users/:id/reset-password]
        AD6[GET /api/admin/analytics]
        AD7[GET /api/admin/level-progress]
        AD8[GET /api/admin/health]
        AD9[GET /api/admin/diagnostics]
        AD10[GET /api/admin/check-progress-orders]
        AD11[POST /api/admin/fix-progress-orders]
        AD12[POST /api/admin/cleanup-orphaned-progress]
    end
    
    subgraph "📚 Curriculum APIs"
        C1[GET /api/curriculum]
        C2[POST /api/curriculum]
        C3[GET /api/curriculum/:id]
        C4[PUT /api/curriculum/:id]
        C5[DELETE /api/curriculum/:id]
        C6[PATCH /api/curriculum/:id/toggle]
        C7[GET /api/curriculum/stats]
        C8[POST /api/curriculum/invalidate-cache]
        C9[PUT /api/curriculum/bulk-order]
        C10[DELETE /api/curriculum/level]
        C11[PUT /api/curriculum/level/reorder]
        C12[GET /api/curriculum/type/:type/track/:careerTrack]
        C13[GET /api/curriculum/content/:type]
        C14[GET /api/curriculum/content/:type/track/:careerTrack]
        C15[POST /api/curriculum/content]
        C16[PUT /api/curriculum/content/:id]
        C17[DELETE /api/curriculum/content/:id]
        C18[GET /api/curriculum/health]
    end
    
    subgraph "📊 Progress APIs"
        PR1[GET /api/progress/:careerTrack]
        PR2[GET /api/progress/levels-status]
        PR3[GET /api/progress/unlocked/:levelOrder]
        PR4[GET /api/progress/test-unlocked/:levelId]
        PR5[GET /api/progress/exercise-unlocked/:levelId]
        PR6[GET /api/progress/exercise-links/:levelId]
        PR7[GET /api/progress/level-sections/:levelId]
        PR8[POST /api/progress/complete]
        PR9[POST /api/progress/learn-progress]
        PR10[POST /api/progress/test-attempt]
        PR11[POST /api/progress/submit-exercise]
        PR12[PUT /api/progress/update-exercise]
    end
    
    subgraph "🏫 Training APIs"
        T1[GET /api/training/levels]
        T2[GET /api/training/levels/:id]
        T3[GET /api/training/health]
    end
    
    subgraph "📅 Attendance APIs"
        AT1[POST /api/attendance/mark]
        AT2[GET /api/attendance/:userId]
        AT3[GET /api/attendance/stats/:userId]
    end
    
    subgraph "🤖 AI APIs"
        AI1[POST /api/ai/chat]
        AI2[GET /api/ai/health]
    end
    
    subgraph "⚙️ Settings APIs"
        SET1[GET /api/admin/settings]
        SET2[PUT /api/admin/settings]
        SET3[GET /api/admin/settings/health]
    end
    
    subgraph "🎯 Track APIs"
        TR1[GET /api/tracks]
        TR2[GET /api/tracks/:id]
        TR3[GET /api/tracks/health]
    end
    
    subgraph "🏥 Health Check APIs"
        H1[GET /api/health]
        H2[GET /api/auth/health]
        H3[GET /api/users/health]
        H4[GET /api/tracks/health]
        H5[GET /api/training/health]
        H6[GET /api/admin/health]
        H7[GET /api/admin/settings/health]
        H8[GET /api/ai/health]
        H9[GET /api/curriculum/health]
    end
    
    subgraph "🌍 Public APIs"
        PUB1[GET /api/student/portfolio/public/:studentId]
    end
    
    subgraph "📁 File Upload APIs"
        F1[POST /api/upload]
    end
    
    style A1 fill:#e1f5fe
    style U1 fill:#e8f5e8
    style ST1 fill:#fff3e0
    style S1 fill:#f3e5f5
    style AD1 fill:#fce4ec
    style C1 fill:#fff8e1
    style PR1 fill:#e0f2f1
    style T1 fill:#f1f8e9
    style AT1 fill:#fce4ec
    style AI1 fill:#e8eaf6
    style SET1 fill:#fff3e0
    style TR1 fill:#e0f2f1
    style H1 fill:#f3e5f5
    style PUB1 fill:#e1f5fe
    style F1 fill:#fff8e1
```

## Component Schema Diagram

```mermaid
graph TB
    subgraph "Layout Components"
        L1[Layout]
        L2[StudentLayout]
        L3[StaffSidebar]
        L4[ProtectedRoute]
    end
    
    subgraph "Student Components"
        S1[StudentDashboard]
        S2[TrainingLevels]
        S3[StudentPortfolio]
        S4[LevelLearnPage]
        S5[LevelTestPage]
        S6[LevelExercisePage]
        S7[StudentProfile]
    end
    
    subgraph "Staff Components"
        ST1[StaffDashboard]
        ST2[StudentTracking]
        ST3[StudentDetails]
        ST4[Leaderboard]
        ST5[StaffProfile]
    end
    
    subgraph "Admin Components"
        A1[AdminDashboard]
        A2[AdminUsers]
        A3[AdminCurriculum]
        A4[AdminAnalytics]
        A5[AdminSettings]
        A6[AdminProfile]
    end
    
    subgraph "Shared Components"
        SH1[LoadingScreen]
        SH2[ErrorBoundary]
        SH3[AIChat]
        SH4[ThemeSwitcher]
        SH5[AttendanceHeatmap]
        SH6[EnhancedLearningTimeline]
    end
    
    L1 --> S1
    L1 --> A1
    L2 --> S1
    L3 --> ST1
    L4 --> L1
    
    S1 --> S2
    S1 --> S3
    S2 --> S4
    S2 --> S5
    S2 --> S6
    
    ST1 --> ST2
    ST1 --> ST3
    ST1 --> ST4
    
    A1 --> A2
    A1 --> A3
    A1 --> A4
    A1 --> A5
    
    style L1 fill:#e3f2fd
    style S1 fill:#e8f5e8
    style ST1 fill:#fff8e1
    style A1 fill:#fce4ec
    style SH1 fill:#f3e5f5
```

## Data Flow Schema

```mermaid
graph LR
    subgraph "Frontend Layer"
        F1[React Components]
        F2[Redux Store]
        F3[API Service]
        F4[Local Storage]
    end
    
    subgraph "Backend Layer"
        B1[Express Server]
        B2[Controllers]
        B3[Services]
        B4[Middleware]
    end
    
    subgraph "Data Layer"
        D1[MongoDB Atlas]
        D2[User Collection]
        D3[Progress Collection]
        D4[Curriculum Collection]
        D5[Attendance Collection]
    end
    
    subgraph "External Services"
        E1[Google Gemini API]
        E2[Email Service]
        E3[File Storage]
    end
    
    F1 --> F2
    F2 --> F3
    F3 --> B1
    B1 --> B4
    B4 --> B2
    B2 --> B3
    B3 --> D1
    
    D1 --> D2
    D1 --> D3
    D1 --> D4
    D1 --> D5
    
    B3 --> E1
    B3 --> E2
    B3 --> E3
    
    F3 --> F4
    
    style F1 fill:#e1f5fe
    style B1 fill:#fff3e0
    style D1 fill:#f3e5f5
    style E1 fill:#e0f2f1
```

## Authentication Schema

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Controller
    participant D as Database
    participant J as JWT Service
    
    U->>F: Login Request
    F->>A: POST /api/auth/login
    A->>D: Validate Credentials
    D-->>A: User Data
    A->>J: Generate JWT Token
    J-->>A: Token
    A-->>F: Success + Token
    F->>F: Store Token
    F-->>U: Redirect to Dashboard
    
    Note over U,F: Subsequent Requests
    U->>F: API Request
    F->>F: Add JWT to Headers
    F->>A: Authenticated Request
    A->>J: Verify Token
    J-->>A: Token Valid
    A->>D: Process Request
    D-->>A: Response Data
    A-->>F: Success Response
    F-->>U: Display Data
```

## Portfolio Generation Schema

```mermaid
graph TD
    A[Portfolio Request] --> B[Fetch User Data]
    B --> C[Fetch Progress Data]
    C --> D[Fetch Attendance Data]
    D --> E[Calculate Leaderboard Score]
    E --> F[Generate Analytics]
    F --> G[Compile Portfolio Data]
    G --> H[Generate Certificate ID]
    H --> I[Determine Recommended Roles]
    I --> J[Return Complete Portfolio]
    
    subgraph "Data Sources"
        DS1[User Collection]
        DS2[Progress Collection]
        DS3[Attendance Collection]
        DS4[Leaderboard Service]
        DS5[Analytics Engine]
    end
    
    B --> DS1
    C --> DS2
    D --> DS3
    E --> DS4
    F --> DS5
    
    style A fill:#e1f5fe
    style J fill:#e8f5e8
    style DS1 fill:#fff3e0
    style DS2 fill:#f3e5f5
    style DS3 fill:#fce4ec
    style DS4 fill:#fff8e1
    style DS5 fill:#e0f2f1
```

## Learning Progress Schema

```mermaid
stateDiagram-v2
    [*] --> NotStarted: User Enrolls
    
    NotStarted --> InProgress: Start Learning
    InProgress --> Completed: Finish All Sections
    InProgress --> InProgress: Continue Learning
    Completed --> [*]: Level Complete
    
    state InProgress {
        [*] --> Learn
        Learn --> Test: Complete Learning
        Test --> Exercise: Pass Test
        Exercise --> [*]: Complete Exercise
        
        state Learn {
            [*] --> ViewMaterials
            ViewMaterials --> MarkComplete
            MarkComplete --> [*]
        }
        
        state Test {
            [*] --> TakeTest
            TakeTest --> SubmitAnswers
            SubmitAnswers --> CalculateScore
            CalculateScore --> [*]
        }
        
        state Exercise {
            [*] --> ViewTasks
            ViewTasks --> SubmitSolutions
            SubmitSolutions --> [*]
        }
    }
    
    state Completed {
        [*] --> UpdateProgress
        UpdateProgress --> UnlockNext
        UnlockNext --> UpdatePortfolio
        UpdatePortfolio --> [*]
    }
```

## System Integration Schema

```mermaid
graph TB
    subgraph "Client Side"
        C1[React Frontend]
        C2[Redux State]
        C3[Local Storage]
        C4[Service Workers]
    end
    
    subgraph "Server Side"
        S1[Node.js Express]
        S2[JWT Authentication]
        S3[API Routes]
        S4[Business Logic]
    end
    
    subgraph "Database"
        DB1[MongoDB Atlas]
        DB2[User Data]
        DB3[Progress Data]
        DB4[Curriculum Data]
    end
    
    subgraph "External APIs"
        E1[Google Gemini]
        E2[Email Service]
        E3[File Storage]
    end
    
    subgraph "Deployment"
        D1[Vercel - Frontend]
        D2[Render - Backend]
        D3[CDN - Assets]
    end
    
    C1 --> S1
    C2 --> C1
    C3 --> C1
    C4 --> C1
    
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> DB1
    
    DB1 --> DB2
    DB1 --> DB3
    DB1 --> DB4
    
    S4 --> E1
    S4 --> E2
    S4 --> E3
    
    C1 --> D1
    S1 --> D2
    C1 --> D3
    
    style C1 fill:#e1f5fe
    style S1 fill:#fff3e0
    style DB1 fill:#f3e5f5
    style E1 fill:#e0f2f1
    style D1 fill:#e8f5e8
```

---

**Document Version**: v1.0  
**Last Updated**: January 2024  
**Next Review**: January 2025
