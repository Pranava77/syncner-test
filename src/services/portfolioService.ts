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
    introduction?: string;
    readyToHire?: boolean;
    duration?: string;
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
      content: any[];
      title: string;
      status: string;
      materials: {
        id: string;
        title: string;
        description: string;
        externalLink?: string;
        order: number;
      }[];
    };
    test: {
      completed: boolean;
      score: number;
      attempts: number;
      startTime: string | null;
      endTime: string | null;
      content: any[];
      title: string;
      status: string;
      questions: {
        id: string;
        title: string;
        question: string;
        options: string[];
        answer: string;
        order: number;
      }[];
    };
    exercise: {
      completed: boolean;
      startTime: string | null;
      endTime: string | null;
      timeSpent: number;
      content: any[];
      title: string;
      status: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        content: string;
        order: number;
        completed: boolean;
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
      const endpoint = studentId === 'me' ? '/student/portfolio/me' : `/student/portfolio/${studentId}`;
      const response = await apiService.get(endpoint);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('PortfolioService: Error fetching portfolio:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }


}
