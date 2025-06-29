const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        window.location.href = '/login';
      }
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  refreshToken() {
    this.token = localStorage.getItem('token');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse(response);
    if (data.success && data.data.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    college: string;
    role?: string;
  }) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await this.handleResponse(response);
    if (data.success && data.data.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getMe() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Logout request failed');
      }
    } catch (error) {
      console.error('ApiService: Logout error:', error);
      // Don't throw error, just log it
    } finally {
      this.clearToken();
    }
  }

  // User endpoints
  async updateProfile(profileData: any) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });

    const data = await this.handleResponse(response);
    return data;
  }

  async getUserProgress() {
    const response = await fetch(`${this.baseURL}/progress`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Career tracks endpoints
  async getCareerTracks() {
    const response = await fetch(`${this.baseURL}/tracks`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getCareerTrack(trackId: string) {
    const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Training endpoints
  async getModules(trackId?: string) {
    const url = trackId 
      ? `${this.baseURL}/training/modules?track=${trackId}`
      : `${this.baseURL}/training/modules`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getModule(moduleId: string) {
    const response = await fetch(`${this.baseURL}/training/modules/${moduleId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateModuleProgress(moduleId: string, lessonId: string) {
    const response = await fetch(`${this.baseURL}/training/modules/${moduleId}/progress`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ lessonId }),
    });

    return this.handleResponse(response);
  }

  // Tasks endpoints
  async getTasks(trackId?: string, filters?: any) {
    let url = `${this.baseURL}/tasks`;
    const params = new URLSearchParams();
    
    if (trackId) params.append('track', trackId);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getTask(taskId: string) {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async submitTask(taskId: string, submissionData: any) {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submissionData),
    });

    return this.handleResponse(response);
  }

  async getSubmissions(taskId?: string) {
    const url = taskId 
      ? `${this.baseURL}/tasks/${taskId}/submissions`
      : `${this.baseURL}/tasks/submissions`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Resume endpoints
  async getResume() {
    const response = await fetch(`${this.baseURL}/resume`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async generateResume(resumeData: any) {
    const response = await fetch(`${this.baseURL}/resume/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(resumeData),
    });

    return this.handleResponse(response);
  }

  async enhanceResume(resumeData: any) {
    const response = await fetch(`${this.baseURL}/resume/enhance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(resumeData),
    });

    return this.handleResponse(response);
  }

  async getResumeTemplate(track: string) {
    const response = await fetch(`${this.baseURL}/resume/templates?track=${encodeURIComponent(track)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Admin endpoints
  async getStudents(filters?: any) {
    let url = `${this.baseURL}/admin/students`;
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.track) params.append('track', filters.track);
    if (filters?.search) params.append('search', filters.search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateStudent(studentId: string, studentData: any) {
    const response = await fetch(`${this.baseURL}/admin/students/${studentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });

    return this.handleResponse(response);
  }

  async deleteStudent(studentId: string) {
    const response = await fetch(`${this.baseURL}/admin/students/${studentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getAnalytics(dateRange?: string) {
    let url = `${this.baseURL}/admin/analytics`;
    if (dateRange) {
      url += `?range=${dateRange}`;
    }

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async reviewSubmission(submissionId: string, reviewData: any) {
    const response = await fetch(`${this.baseURL}/admin/submissions/${submissionId}/review`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reviewData),
    });

    return this.handleResponse(response);
  }

  // AI/GPT endpoints
  async chatWithAI(message: string, context?: string) {
    const response = await fetch(`${this.baseURL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, context }),
    });

    return this.handleResponse(response);
  }

  async generateFeedback(taskId: string, submission: string) {
    const response = await fetch(`${this.baseURL}/ai/feedback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ taskId, submission }),
    });

    return this.handleResponse(response);
  }

  async generatePersonalizedContent(topic: string) {
    const response = await fetch(`${this.baseURL}/ai/personalized-content`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ topic }),
    });

    return this.handleResponse(response);
  }
}

export default new ApiService();