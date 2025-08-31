import apiService from './api';

export interface PortfolioTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface PortfolioModule {
  id: string;
  moduleNumber: string;
  title: string;
  completed: boolean;
  completedDate: string | null;
  assessmentScore: number;
  timeSpent: string;
  mcqScore: number;
  tasksCompleted: number;
  totalTasks: number;
  tasks: PortfolioTask[];
}

export interface StudentPortfolioData {
  name: string;
  location: string;
  profilePicture?: string;
  completionPercentage: number;
  status: string;
  track: string;
  duration: string;
  lastVerified: string;
  skills: string[];
  certificateId: string;
  recommendedRoles: string[];
  introduction: string;
  modules: PortfolioModule[];
}



export class PortfolioService {
  /**
   * Fetch student portfolio data for staff view
   */
  static async getStudentPortfolio(studentId: string): Promise<StudentPortfolioData> {
    try {
      const response = await apiService.get(`/staff/student/${studentId}/portfolio`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching student portfolio:', error);
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

  /**
   * Transform backend data to frontend format
   */
  static transformPortfolioData(backendData: any): StudentPortfolioData {
    return {
      name: backendData.name || 'Unknown Student',
      location: backendData.location || 'Location not specified',
      profilePicture: backendData.profilePicture,
      completionPercentage: backendData.completionPercentage || 0,
      status: backendData.status || 'In Progress',
      track: backendData.track || 'Unknown Track',
      duration: backendData.duration || 'Unknown Duration',
      lastVerified: backendData.lastVerified || new Date().toISOString(),
      skills: backendData.skills || [],
      certificateId: backendData.certificateId || 'CERT-0000-0000',
      recommendedRoles: backendData.recommendedRoles || [],
      introduction: backendData.introduction || 'No introduction available.',
      modules: (backendData.modules || []).map((module: any) => ({
        id: module.id || `module-${module.moduleNumber}`,
        moduleNumber: module.moduleNumber || '00',
        title: module.title || 'Unknown Module',
        completed: module.completed || false,
        completedDate: module.completedDate,
        assessmentScore: module.assessmentScore || 0,
        timeSpent: module.timeSpent || '0h 0m',
        mcqScore: module.mcqScore || 0,
        tasksCompleted: module.tasksCompleted || 0,
        totalTasks: module.totalTasks || 5,
        tasks: (module.tasks || []).map((task: any) => ({
          id: task.id || `task-${Math.random()}`,
          title: task.title || 'Unknown Task',
          description: task.description || 'No description available',
          completed: task.completed || false
        }))
      }))
    };
  }
}
