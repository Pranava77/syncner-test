const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor'
};

const CAREER_TRACKS = {
  FULLSTACK: 'fullstack',
  AI_ML: 'ai-ml',
  UI_UX: 'ui-ux',
  DATA_SCIENCE: 'data-science'
};

const TASK_STATUS = {
  AVAILABLE: 'available',
  IN_PROGRESS: 'in-progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  LOCKED: 'locked'
};

const SUBMISSION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const MODULE_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

const DIFFICULTY_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};

const LESSON_TYPES = {
  VIDEO: 'video',
  READING: 'reading',
  QUIZ: 'quiz',
  PROJECT: 'project'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export {
  USER_ROLES,
  CAREER_TRACKS,
  TASK_STATUS,
  SUBMISSION_STATUS,
  MODULE_STATUS,
  DIFFICULTY_LEVELS,
  LESSON_TYPES,
  HTTP_STATUS
};