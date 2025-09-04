# Syncner Learning Management System - Application Flow Diagram

## Document Information
- **Version**: 1.0
- **Date**: January 2024
- **Author**: Development Team
- **Status**: Production Ready

## Table of Contents
1. [Overall System Flow](#overall-system-flow)
2. [User Authentication Flow](#user-authentication-flow)
3. [Student Learning Flow](#student-learning-flow)
4. [Staff Management Flow](#staff-management-flow)
5. [Admin Management Flow](#admin-management-flow)
6. [Portfolio Generation Flow](#portfolio-generation-flow)
7. [API Request Flow](#api-request-flow)
8. [Data Flow Architecture](#data-flow-architecture)

## Overall System Flow

```mermaid
graph TB
    %% User Entry Points
    A[User Access] --> B{Authentication Check}
    B -->|Not Authenticated| C[Login/Register Page]
    B -->|Authenticated| D{User Role Check}
    
    %% Authentication Flow
    C --> E[Login Form]
    C --> F[Register Form]
    E --> G[Auth Controller]
    F --> G
    G --> H{JWT Token Generation}
    H -->|Success| I[Redirect to Dashboard]
    H -->|Failure| J[Error Message]
    J --> C
    
    %% Role-based Routing
    D -->|Student| K[Student Dashboard]
    D -->|Staff| L[Staff Dashboard]
    D -->|Admin| M[Admin Dashboard]
    
    %% Student Flow
    K --> N[Student Layout]
    N --> O[Training Levels]
    N --> P[Portfolio]
    N --> Q[Profile]
    
    %% Staff Flow
    L --> R[Staff Sidebar]
    R --> S[Student Tracking]
    R --> T[Student Details]
    R --> U[Leaderboard]
    
    %% Admin Flow
    M --> V[Admin Layout]
    V --> W[User Management]
    V --> X[Curriculum Management]
    V --> Y[Analytics]
    V --> Z[Settings]
    
    %% Learning Process
    O --> AA[Level Selection]
    AA --> BB[Learn Section]
    AA --> CC[Test Section]
    AA --> DD[Exercise Section]
    
    %% Progress Tracking
    BB --> EE[Progress Update]
    CC --> EE
    DD --> EE
    EE --> FF[Database Update]
    FF --> GG[Portfolio Refresh]
    
    %% Portfolio System
    P --> HH[Portfolio Generation]
    HH --> II[Public Portfolio]
    HH --> JJ[Private Portfolio]
    
    %% AI Integration
    K --> KK[AI Chat]
    L --> KK
    M --> KK
    KK --> LL[Gemini API]
    
    %% External Services
    FF --> MM[MongoDB Atlas]
    LL --> NN[Google Gemini]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style D fill:#fff3e0
    style K fill:#e8f5e8
    style L fill:#fff8e1
    style M fill:#fce4ec
    style MM fill:#f3e5f5
    style NN fill:#e0f2f1
```

## User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Controller
    participant D as Database
    participant J as JWT Service
    
    U->>F: Access Application
    F->>F: Check Local Storage for Token
    alt Token Exists
        F->>A: Validate Token
        A->>J: Verify JWT
        J-->>A: Token Valid/Invalid
        alt Token Valid
            A->>D: Fetch User Data
            D-->>A: User Information
            A-->>F: User Authenticated
            F->>F: Redirect to Dashboard
        else Token Invalid
            A-->>F: Authentication Failed
            F->>F: Redirect to Login
        end
    else No Token
        F->>F: Redirect to Login
    end
    
    U->>F: Enter Credentials
    F->>A: POST /api/auth/login
    A->>D: Validate Credentials
    D-->>A: User Data
    A->>J: Generate JWT Token
    J-->>A: Token
    A-->>F: Success + Token
    F->>F: Store Token in Local Storage
    F->>F: Redirect to Dashboard
```

## Student Learning Flow

```mermaid
graph TD
    A[Student Dashboard] --> B[Select Career Track]
    B --> C[View Training Levels]
    C --> D[Select Level]
    D --> E{Level Unlocked?}
    E -->|No| F[Complete Prerequisites]
    E -->|Yes| G[Access Level Content]
    
    G --> H[Learn Section]
    G --> I[Test Section]
    G --> J[Exercise Section]
    
    H --> K[View Learning Materials]
    K --> L[Mark as Completed]
    L --> M[Update Progress]
    
    I --> N[Take Assessment]
    N --> O[Submit Answers]
    O --> P[Calculate Score]
    P --> Q[Update Test Progress]
    
    J --> R[View Exercise Tasks]
    R --> S[Submit Solutions]
    S --> T[Update Exercise Progress]
    
    M --> U[Check Level Completion]
    Q --> U
    T --> U
    
    U --> V{All Sections Complete?}
    V -->|No| W[Continue Learning]
    V -->|Yes| X[Mark Level Complete]
    X --> Y[Unlock Next Level]
    Y --> Z[Update Portfolio]
    
    W --> G
    Z --> AA[Refresh Dashboard]
    
    style A fill:#e8f5e8
    style G fill:#e3f2fd
    style U fill:#fff3e0
    style Z fill:#f3e5f5
```

## Staff Management Flow

```mermaid
graph TD
    A[Staff Dashboard] --> B[Student Management]
    A --> C[Analytics View]
    A --> D[Portfolio Review]
    
    B --> E[Student List]
    E --> F[Filter Students]
    F --> G[Select Student]
    G --> H[Student Details]
    
    H --> I[View Progress]
    H --> J[View Attendance]
    H --> K[View Learning Timeline]
    H --> L[View Portfolio]
    
    I --> M[Progress Analytics]
    J --> N[Attendance Analytics]
    K --> O[Learning Analytics]
    L --> P[Portfolio Analytics]
    
    M --> Q[Generate Reports]
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R[Export Data]
    Q --> S[Share Insights]
    
    C --> T[Overall Analytics]
    T --> U[Track Performance]
    T --> V[Completion Rates]
    T --> W[Leaderboard Data]
    
    D --> X[Portfolio Review]
    X --> Y[Approve/Reject]
    Y --> Z[Send Feedback]
    
    style A fill:#fff8e1
    style H fill:#e3f2fd
    style Q fill:#f3e5f5
    style T fill:#e8f5e8
```

## Admin Management Flow

```mermaid
graph TD
    A[Admin Dashboard] --> B[User Management]
    A --> C[Curriculum Management]
    A --> D[System Analytics]
    A --> E[Settings Management]
    
    B --> F[Manage Students]
    B --> G[Manage Staff]
    B --> H[Manage Admins]
    
    F --> I[Add/Edit/Delete Students]
    G --> J[Add/Edit/Delete Staff]
    H --> K[Add/Edit/Delete Admins]
    
    C --> L[Create Levels]
    C --> M[Edit Content]
    C --> N[Manage Tracks]
    C --> O[Reorder Levels]
    
    L --> P[Add Learning Materials]
    L --> Q[Add Test Questions]
    L --> R[Add Exercise Tasks]
    
    M --> S[Update Content]
    M --> T[Delete Content]
    M --> U[Reorder Content]
    
    D --> V[System Performance]
    D --> W[User Analytics]
    D --> X[Content Analytics]
    
    E --> Y[Platform Settings]
    E --> Z[AI Configuration]
    E --> AA[Security Settings]
    
    style A fill:#fce4ec
    style C fill:#e3f2fd
    style D fill:#e8f5e8
    style E fill:#fff3e0
```

## Portfolio Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as Portfolio Controller
    participant L as Leaderboard Service
    participant D as Database
    participant A as Analytics Engine
    
    U->>F: Request Portfolio
    F->>P: GET /api/portfolio/me
    P->>D: Fetch User Data
    D-->>P: User Information
    
    P->>D: Fetch Progress Data
    D-->>P: Learning Progress
    
    P->>D: Fetch Attendance Data
    D-->>P: Attendance Records
    
    P->>L: Calculate Leaderboard Score
    L->>D: Fetch Comparative Data
    D-->>L: Student Rankings
    L-->>P: Score & Rank
    
    P->>A: Generate Analytics
    A->>D: Fetch Learning Timeline
    D-->>A: Timeline Data
    A-->>P: Analytics Results
    
    P->>P: Compile Portfolio Data
    P->>P: Generate Certificate ID
    P->>P: Determine Recommended Roles
    
    P-->>F: Complete Portfolio Data
    F->>F: Render Portfolio
    F-->>U: Display Portfolio
    
    Note over U,F: Portfolio includes:<br/>- Student Information<br/>- Progress Statistics<br/>- Learning Timeline<br/>- Attendance Data<br/>- Leaderboard Position<br/>- Recommended Roles<br/>- Certificate ID
```

## API Request Flow

```mermaid
graph TD
    A[Frontend Request] --> B[API Service]
    B --> C{Authentication Required?}
    C -->|Yes| D[Add JWT Token]
    C -->|No| E[Direct Request]
    D --> F[Send HTTP Request]
    E --> F
    
    F --> G[Express Server]
    G --> H[Middleware Stack]
    H --> I[Authentication Middleware]
    H --> J[Validation Middleware]
    H --> K[Error Handling Middleware]
    
    I --> L{Token Valid?}
    L -->|No| M[Return 401 Unauthorized]
    L -->|Yes| N[Extract User Info]
    
    J --> O[Validate Request Data]
    O --> P{Data Valid?}
    P -->|No| Q[Return 400 Bad Request]
    P -->|Yes| R[Route to Controller]
    
    R --> S[Controller Logic]
    S --> T[Service Layer]
    T --> U[Database Operations]
    U --> V[MongoDB Atlas]
    
    V --> W[Return Data]
    W --> X[Format Response]
    X --> Y[Send to Frontend]
    
    K --> Z[Handle Errors]
    Z --> AA[Log Error]
    AA --> BB[Return Error Response]
    
    style A fill:#e1f5fe
    style G fill:#fff3e0
    style V fill:#f3e5f5
    style Y fill:#e8f5e8
```

## Data Flow Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[Redux Store]
        C[API Service]
        D[Local Storage]
    end
    
    subgraph "Backend Layer"
        E[Express Server]
        F[Controllers]
        G[Services]
        H[Middleware]
    end
    
    subgraph "Data Layer"
        I[MongoDB Atlas]
        J[User Collection]
        K[Progress Collection]
        L[Curriculum Collection]
        M[Attendance Collection]
    end
    
    subgraph "External Services"
        N[Google Gemini API]
        O[Email Service]
        P[File Storage]
    end
    
    A --> B
    B --> C
    C --> E
    E --> H
    H --> F
    F --> G
    G --> I
    
    I --> J
    I --> K
    I --> L
    I --> M
    
    G --> N
    G --> O
    G --> P
    
    C --> D
    
    style A fill:#e1f5fe
    style E fill:#fff3e0
    style I fill:#f3e5f5
    style N fill:#e0f2f1
```

## Component Interaction Flow

```mermaid
graph TD
    subgraph "Student Components"
        A[StudentDashboard]
        B[TrainingLevels]
        C[StudentPortfolio]
        D[LevelLearnPage]
        E[LevelTestPage]
        F[LevelExercisePage]
    end
    
    subgraph "Staff Components"
        G[StaffSidebar]
        H[StudentTracking]
        I[StudentDetails]
        J[Leaderboard]
    end
    
    subgraph "Admin Components"
        K[AdminDashboard]
        L[AdminCurriculum]
        M[AdminUsers]
        N[AdminAnalytics]
    end
    
    subgraph "Shared Components"
        O[Layout]
        P[ProtectedRoute]
        Q[LoadingScreen]
        R[ErrorBoundary]
        S[AIChat]
    end
    
    A --> B
    B --> D
    B --> E
    B --> F
    A --> C
    
    G --> H
    G --> I
    G --> J
    
    K --> L
    K --> M
    K --> N
    
    O --> P
    P --> Q
    P --> R
    
    A --> S
    G --> S
    K --> S
    
    style A fill:#e8f5e8
    style G fill:#fff8e1
    style K fill:#fce4ec
    style O fill:#e3f2fd
```

## Learning Progress Flow

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

## System Integration Flow

```mermaid
graph TB
    subgraph "Client Side"
        A[React Frontend]
        B[Redux State Management]
        C[Local Storage]
        D[Service Workers]
    end
    
    subgraph "Server Side"
        E[Node.js Express]
        F[JWT Authentication]
        G[API Routes]
        H[Business Logic]
    end
    
    subgraph "Database"
        I[MongoDB Atlas]
        J[User Data]
        K[Progress Data]
        L[Curriculum Data]
    end
    
    subgraph "External APIs"
        M[Google Gemini]
        N[Email Service]
        O[File Storage]
    end
    
    subgraph "Deployment"
        P[Vercel - Frontend]
        Q[Render - Backend]
        R[CDN - Assets]
    end
    
    A --> E
    B --> A
    C --> A
    D --> A
    
    E --> F
    F --> G
    G --> H
    H --> I
    
    I --> J
    I --> K
    I --> L
    
    H --> M
    H --> N
    H --> O
    
    A --> P
    E --> Q
    A --> R
    
    style A fill:#e1f5fe
    style E fill:#fff3e0
    style I fill:#f3e5f5
    style M fill:#e0f2f1
    style P fill:#e8f5e8
```

---

**Document Version**: v1.0  
**Last Updated**: January 2024  
**Next Review**: January 2025

## Key Flow Characteristics

### 1. **Authentication & Authorization**
- JWT-based stateless authentication
- Role-based access control (Student, Staff, Admin)
- Protected routes with middleware validation
- Session persistence with local storage

### 2. **Learning Progression**
- Sequential level unlocking system
- Three-section learning model (Learn, Test, Exercise)
- Real-time progress tracking
- Automated portfolio updates

### 3. **Data Management**
- Centralized Redux state management
- MongoDB document-based storage
- Real-time data synchronization
- Efficient caching strategies

### 4. **User Experience**
- Responsive design for all devices
- Progressive Web App capabilities
- Smooth animations and transitions
- Error handling and loading states

### 5. **System Integration**
- AI-powered chat assistance
- External API integrations
- Cloud-based deployment
- Scalable architecture design
