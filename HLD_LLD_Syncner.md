# Syncner Platform: High-Level & Low-Level Design

---

## High-Level Design (HLD)

### 1. System Overview
Syncner is a full-stack educational platform for students and admins, supporting:
- Student onboarding, training modules, task management, submissions, resume generation, and AI mentor.
- Admin dashboards for analytics, user/module/task management, and platform settings.

### 2. Architecture
- **Frontend:** React + TypeScript (Vite, Redux, Tailwind)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **AI Integration:** Google Gemini API (via backend)
- **File Uploads:** Multer (backend)
- **Authentication:** JWT-based, role-based access control

### 3. Key Modules
- **Frontend:**
  - Auth, Onboarding, Dashboard, Training, Tasks, Submissions, Resume, AI Chat, Admin (Analytics, Settings, Management)
- **Backend:**
  - Auth, User, Task, Module, Submission, Progress, Resume, Settings, AI (Gemini)
- **Database:**
  - Users, Tasks, Modules, Submissions, Progress, Resume, Settings

### 4. User Roles & Flows
- **Student:** Register → Onboarding → Dashboard → Training/Tasks → Submit → View Feedback/Resume → AI Mentor
- **Admin:** Login → Dashboard → Analytics → Manage Users/Modules/Tasks → Review Submissions → Settings

### 5. Component/Block Diagram
```mermaid
graph TD
  subgraph Frontend
    A[LandingPage]
    B[Login/Register]
    C[Onboarding]
    D[StudentDashboard]
    E[TrainingModule]
    F[TaskPortal]
    G[ResumeGenerator]
    H[AIChat]
    I[AdminDashboard]
    J[AdminAnalytics]
    K[AdminSettings]
  end
  subgraph Backend
    L[AuthController]
    M[UserController]
    N[TaskController]
    O[ModuleController]
    P[SubmissionController]
    Q[ProgressController]
    R[ResumeController]
    S[SettingsController]
    T[AdminController]
    U[GeminiController]
  end
  subgraph Database
    V[User]
    W[Task]
    X[Module]
    Y[Submission]
    Z[Progress]
    AA[Resume]
    AB[Settings]
  end
  A-->B
  B-->C
  C-->D
  D-->E
  D-->F
  D-->G
  D-->H
  I-->J
  I-->K
  F-->N
  E-->O
  G-->R
  H-->U
  K-->S
  J-->T
  N-->W
  O-->X
  P-->Y
  Q-->Z
  R-->AA
  S-->AB
  M-->V
  L-->V
  U-->AB
  T-->V
  T-->W
  T-->X
  T-->Y
  T-->Z
  T-->AA
  T-->AB
```

---

## Low-Level Design (LLD)

### 1. Key Data Models
- **User:** id, name, email, password, role, college, careerTrack, profileComplete, etc.
- **Task:** id, title, description, category, difficulty, points, careerTrack, assignedTo, dueDate, etc.
- **Module:** id, title, description, difficulty, careerTrack, lessons, etc.
- **Submission:** id, task, student, description, files, status, score, feedback, etc.
- **Progress:** user, careerTrack, moduleProgress, taskProgress, achievements, etc.
- **Resume:** user, personalInfo, summary, education, skills, projects, certifications, experience, etc.
- **Settings:** general, notifications, security, integrations

### 2. Key API Endpoints
- `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- `/api/tasks`, `/api/tasks/:id/submit`, `/api/tasks/upcoming`, `/api/tasks/all`
- `/api/training`, `/api/training/:id`
- `/api/submissions/my`, `/api/submissions/:id/review`
- `/api/admin/analytics`, `/api/admin/users`
- `/api/ai/chat`, `/api/ai/feedback`, `/api/ai/resume`
- `/api/admin/settings`

### 3. Sequence Diagrams

#### Task Submission
```mermaid
sequenceDiagram
  participant Student
  participant Frontend
  participant Backend
  participant DB as Database
  Student->>Frontend: Fill Task Submission Form
  Frontend->>Backend: POST /api/tasks/:id/submit (with file)
  Backend->>DB: Save Submission
  DB-->>Backend: Submission Saved
  Backend-->>Frontend: Success Response
  Frontend-->>Student: Show Confirmation
```

#### AI Chat Mentor
```mermaid
sequenceDiagram
  participant Student
  participant Frontend
  participant Backend
  participant Gemini as Gemini API
  Student->>Frontend: Type message in AI Chat
  Frontend->>Backend: POST /api/ai/chat
  Backend->>Gemini: Call Gemini API
  Gemini-->>Backend: AI Response
  Backend-->>Frontend: AI Response
  Frontend-->>Student: Show AI Reply
```

#### Admin Reviews Submission
```mermaid
sequenceDiagram
  participant Admin
  participant Frontend
  participant Backend
  participant DB as Database
  Admin->>Frontend: Open Submissions
  Frontend->>Backend: GET /api/tasks/submissions
  Backend->>DB: Fetch Submissions
  DB-->>Backend: Submissions Data
  Backend-->>Frontend: Submissions List
  Admin->>Frontend: Review & Grade
  Frontend->>Backend: PATCH /api/submissions/:id/review
  Backend->>DB: Update Submission
  DB-->>Backend: Submission Updated
  Backend-->>Frontend: Success
  Frontend-->>Admin: Show Review Status
```

### 4. Security & Error Handling
- JWT authentication, role-based guards, input validation, error handler middleware, rate limiting, CORS, helmet.

---

# End of Document 