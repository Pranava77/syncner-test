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
      }[];
    };
  }[];
}



export class PortfolioService {
  /**
   * Fetch student portfolio data for staff view
   */
  static async getStudentPortfolio(studentId: string): Promise<StudentPortfolioData> {
    try {
      console.log('PortfolioService: Calling API for student:', studentId);
      // Use the same endpoint as learning journey for consistent data
      console.log('PortfolioService: Calling API endpoint:', `/student/portfolio/${studentId}`);
      const response = await apiService.get(`/student/portfolio/${studentId}`);
      console.log('PortfolioService: API response received:', response);
      
      if (response.success) {
        console.log('PortfolioService: Returning data:', response.data);
        return response.data;
      } else {
        console.error('PortfolioService: API returned error:', response.message);
        throw new Error(response.message || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('PortfolioService: Error fetching student portfolio:', error);
      throw new Error('Failed to fetch student portfolio data');
    }
  }

  /**
   * Fetch student's own portfolio data
   */
  static async getMyPortfolio(): Promise<StudentPortfolioData> {
    try {
      const response = await apiService.get('/student/portfolio/me');
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching my portfolio:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }

  /**
   * Fetch any student's portfolio data (for staff/admin)
   */
  static async getPortfolioByStudentId(studentId: string): Promise<StudentPortfolioData> {
    try {
      const response = await apiService.get(`/student/portfolio/${studentId}`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio by student ID:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }


}
