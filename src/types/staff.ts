// Staff-related type definitions

export interface Student {
  _id: string;
  name: string;
  email: string;
  careerTrack: string;
  level: string;
  progress: number;
  status: 'active' | 'inactive';
  lastActive: string;
  totalPoints: number;
  streakDays: number;
  college?: string;
  department?: string;
  batch?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Attendance and streak information
  currentStreak: number;
  longestStreak: number;
  attendancePercentage: number;
  totalDays: number;
  presentDays: number;
}

export interface StudentDetails extends Student {
  performance: PerformanceMetrics;
  summaryStats: SummaryStats;
  learningTimeline: LearningLevel[];
  enrolledDate: string;
}

export interface PerformanceMetrics {
  performance: number;
  potential: number;
  contribution: number;
  creativity: number;
  skill: number;
  teamwork: number;
}

export interface SummaryStats {
  consistency: number;
  progress: number;
  leaderboard: number;
}

export interface LearningLevel {
  level: number;
  courseName: string;
  status: 'completed' | 'in-progress' | 'not-started';
  learn: LearningSection;
  test: TestSection;
  exercise: ExerciseSection;
}

export interface LearningSection {
  completed: boolean;
  startTime: string;
  endTime: string;
}

export interface TestSection {
  completed: boolean;
  score: number;
  attempts: number;
  startTime: string;
  endTime: string;
}

export interface ExerciseSection {
  completed: boolean;
  startTime: string;
  endTime: string;
}

export interface StudentFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  careerTrack?: 'all' | string;
  sortBy?: 'name' | 'email' | 'progress' | 'lastActive' | 'totalPoints';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StudentListResponse {
  students: Student[];
  pagination: PaginationState;
}

export interface StudentDetailsResponse {
  student: StudentDetails;
}

export interface StaffAnalytics {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  studentRetention: number;
  trackDistribution: TrackDistribution[];
  trackStructure: TrackStructure[];
  avgProgress: number;
  avgPoints: number;
  avgStreakDays: number;
  // Attendance and streak metrics
  avgAttendancePercentage: number;
  avgCurrentStreak: number;
  avgLongestStreak: number;
  avgPresentDays: number;
  avgEnrollmentDays: number;
}

export interface TrackDistribution {
  track: string;
  count: number;
  totalLevels: number;
}

export interface TrackStructure {
  name: string;
  displayName: string;
  totalLevels: number;
  difficulty: string;
}

export interface StaffAnalyticsResponse {
  analytics: StaffAnalytics;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type StudentsApiResponse = ApiResponse<StudentListResponse>;
export type StudentDetailsApiResponse = ApiResponse<StudentDetailsResponse>;
export type StaffAnalyticsApiResponse = ApiResponse<StaffAnalyticsResponse>;
