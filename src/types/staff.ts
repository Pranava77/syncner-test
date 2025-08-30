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
  // Leaderboard score
  leaderboardScore: number;
}

export interface DailyActivity {
  date: string;
  totalMinutes: number;
  activities: string[];
  isPresent: boolean;
}

export interface LearningTimelineItem {
  date: string;
  activity: string;
  type: 'learning' | 'test' | 'exercise';
  duration: number;
  score?: number;
}

export interface StudentDetails extends Student {
  performance: PerformanceMetrics;
  summaryStats: SummaryStats;
  learningTimeline: LearningTimelineItem[];
  learningLevels: LearningLevel[];
  dailyActivity: DailyActivity[];
  attendanceStats: AttendanceStats;
  skills: string[];
  recommendedRoles: string[];
  trackInfo?: any;
  enrolledDate: string;
  // Additional properties from API response
  college?: string;
  interests?: string[];
  profileComplete?: boolean;
  activeTodayMinutes?: number;
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
  totalPoints: number;
  consistency: number;
  leaderboard: number;
  levelProgress: number;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  currentStreak: number;
  longestStreak: number;
  lastPresentDate?: string;
}

export interface StudentDetailsApiResponse {
  success: boolean;
  message: string;
  data: {
    student: StudentDetails;
  };
}

export interface LearningLevel {
  level: number;
  courseName: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  // Dynamic content names and descriptions
  learnContentName?: string;
  learnDescription?: string;
  testContentName?: string;
  testDescription?: string;
  exerciseContentName?: string;
  exerciseDescription?: string;
  learn: LearningSection;
  test: TestSection;
  exercise: ExerciseSection;
}

export interface LearningSection {
  completed: boolean;
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
  content?: any[]; // Backend returns array of content items
  timeSpent?: number;
}

export interface TestSection {
  completed: boolean;
  score: number;
  attempts: number;
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
  content?: any[]; // Backend returns array of content items
  timeSpent?: number;
}

export interface ExerciseSection {
  completed: boolean;
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
  content?: any[]; // Backend returns array of content items
  timeSpent?: number;
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
  trackDistribution: TrackDistribution[];
  trackStructure: TrackStructure[];
  avgProgress: number;
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

export type StaffAnalyticsApiResponse = ApiResponse<StaffAnalyticsResponse>;
