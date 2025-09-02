import apiService from './api';

export interface StudentPortfolioData {
  student: {
    _id: string;
    name: string;
    email: string;
    careerTrack: string;
    college?: string;
    department?: string;
    createdAt: string;
    introduction?: string | null;
    readyToHire: boolean;
    duration: string;
    skills?: string[];
    certificateId: string;
    recommendedRoles: string[];
  };
  progress: {
    currentLevel: number;
    completedLevels: number;
    totalLevels: number;
    percentage: number;
    totalPoints: number;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
    currentStreak: number;
    longestStreak: number;
  };
  leaderboard: {
    score: number;
    rank: number | null;
    breakdown: {
      progressScore: number;
      attendanceScore: number;
      consistencyScore: number;
      timeScore: number;
    };
  };
  learningLevels: {
    level: number;
    courseName: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'completed';
    learn: {
      completed: boolean;
      startTime: string | null;
      endTime: string | null;
      timeSpent: number;
      content: Array<{
        id: string;
        title: string;
        description: string;
        content: string;
        externalLink?: string;
        order: number;
      }>;
      title: string;
      status: string;
      materials: {
        id: string;
        title: string;
        description: string;
        externalLink?: string;
        order: number;
        completed?: boolean;
      }[];
    };
    test: {
      completed: boolean;
      score: number;
      attempts: number;
      startTime: string | null;
      endTime: string | null;
      content: Array<{
        id: string;
        title: string;
        question: string;
        order: number;
      }>;
      title: string;
      status: string;
      questions: {
        id: string;
        title: string;
        question: string;
        options: string[];
        answer?: string;
        order: number;
      }[];
    };
    exercise: {
      completed: boolean;
      startTime: string | null;
      endTime: string | null;
      timeSpent: number;
      content: Array<{
        id: string;
        title: string;
        description: string;
        content: string;
        order: number;
      }>;
      title: string;
      status: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        content: string;
        order: number;
        completed: boolean;
        submissionLinks: string[];
        score: number;
        attempts: number;
        lastAttemptAt: string | null;
        feedback: string;
        status: 'not-submitted' | 'submitted' | 'approved' | 'rejected';
      }[];
    };
  }[];
}

export class PortfolioService {
  /**
   * Fetch student portfolio data
   * @param studentId - The ID of the student to fetch portfolio for, or 'me' for own portfolio
   */
  static async getStudentPortfolio(studentId: string = 'me'): Promise<StudentPortfolioData> {
    try {
      // Get portfolio data
      const endpoint = studentId === 'me' ? '/student/portfolio/me' : `/student/portfolio/${studentId}`;
      const portfolioResponse = await apiService.get(endpoint);
      
      if (!portfolioResponse.success) {
        throw new Error(portfolioResponse.message || 'Failed to fetch portfolio data');
      }

      const portfolioData = portfolioResponse.data;

      // Note: Curriculum data merging is now handled in the component using useStudentLevels hook
      // This keeps the portfolio service focused on portfolio-specific data

      return portfolioData;
    } catch (error) {
      console.error('PortfolioService: Error fetching portfolio:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }
}