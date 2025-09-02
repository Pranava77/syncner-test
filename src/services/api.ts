import { 
  StudentsApiResponse, 
  StaffAnalyticsApiResponse, 
  StudentFilters,
  ApiResponse 
} from '../types/staff';

declare const process: {
  env: {
    REACT_APP_API_URL?: string;
  };
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://syncner-test.onrender.com/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getHeaders(token?: string): HeadersInit {
    const authToken = token || localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    return data;
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    if (error.message === 'Token expired' || error.message === 'Invalid token') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(userData: { 
    name: string; 
    email: string; 
    password: string; 
    careerTrack: string; 
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      localStorage.removeItem('token');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentUser(token?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(token),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ token, password }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Training endpoints
  async getLevels(trackId?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = trackId 
        ? `${this.baseURL}/training/levels?track=${trackId}`
        : `${this.baseURL}/training/levels`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getLevel(levelId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/training/levels/${levelId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Progress endpoints
  async getUserProgress(careerTrack: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/${careerTrack}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markLevelCompleted(levelId: string, levelOrder: number, section: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/complete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ levelId, levelOrder, section }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateLearnProgress(levelId: string, timeSpent: number, linksAccessed: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/learn-progress`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ levelId, timeSpent, linksAccessed }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitTestAttempt(levelId: string, score: number, answers: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/test-attempt`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ levelId, score, answers }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkTestUnlocked(levelId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/test-unlocked/${levelId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkExerciseUnlocked(levelId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/exercise-unlocked/${levelId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkExerciseLinks(levelId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/exercise-links/${levelId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitExercise(levelId: string, exerciseTitle: string, links?: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/submit-exercise`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ levelId, exerciseTitle, links }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateExercise(levelId: string, exerciseTitle: string, links?: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/progress/update-exercise`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ levelId, exerciseTitle, links }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Portfolio endpoints
  async getStudentPortfolio(studentId: string = 'me'): Promise<ApiResponse<any>> {
    try {
      const endpoint = studentId === 'me' ? '/student/portfolio/me' : `/student/portfolio/${studentId}`;
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Attendance endpoints
  async markAttendance(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/attendance/mark`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAttendance(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/attendance/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAttendanceStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/attendance/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // AI Chat endpoint
  async chatWithAI(message: string, context?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/ai/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message, context }),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Utility endpoints
  async uploadFile(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Cache management
  async invalidateCache(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/cache/invalidate`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new ApiService();