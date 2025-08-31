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

export interface TimelineSection {
  status: 'not-started' | 'in-progress' | 'completed';
  details: any;
  title: string;
}

export interface TimelineLevel {
  levelOrder: number;
  levelTitle: string;
  levelDescription: string;
  overallStatus: 'not-started' | 'in-progress' | 'completed' | 'accessible';
  sections: {
    learn: TimelineSection;
    test: TimelineSection;
    exercise: TimelineSection;
  };
}

export interface ActivityTimelineItem {
  type: 'daily-activity' | 'test-attempt' | 'exercise-submission' | 'learn-completion' | 'test-completion' | 'exercise-completion';
  date: string | Date;
  activity: string;
  duration: number;
  details: any;
}

export interface StudentDetails extends Student {
  learningTimeline: TimelineLevel[]; // Updated to use new detailed structure
  comprehensiveActivityTimeline?: ActivityTimelineItem[]; // New comprehensive activity timeline
  simpleTimeline?: LearningTimelineItem[]; // Keep old structure for backward compatibility
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
  
  // Portfolio data fields (flattened for easy access)
  attendancePercentage: number;
  totalDays: number;
  presentDays: number;
  currentStreak: number;
  longestStreak: number;
  leaderboardScore: number;
  leaderboardRank: number | null;
  progress: number;
  currentLevel: number;
  completedLevels: number;
  totalLevels: number;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  currentStreak: number;
  longestStreak: number;
  lastPresentDate?: string;
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
