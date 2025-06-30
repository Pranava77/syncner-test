const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    return headers;
  }

  private async handleResponse(response: Response, isAuthEndpoint: boolean = false) {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && isAuthEndpoint) {
        // Only redirect to login for auth endpoints (login, register, profile)
        this.clearToken();
        window.location.href = '/login';
      }
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse(response, true);
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

    const data = await this.handleResponse(response, true);
    if (data.success && data.data.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getMe() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, true);
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

    const data = await this.handleResponse(response, true);
    return data;
  }

  async getUserProgress() {
    const response = await fetch(`${this.baseURL}/progress`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  // Career tracks endpoints
  async getCareerTracks() {
    const response = await fetch(`${this.baseURL}/tracks`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async getCareerTrack(trackId: string) {
    const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  // Training endpoints
  async getModules(trackId?: string) {
    const url = trackId 
      ? `${this.baseURL}/training?track=${trackId}`
      : `${this.baseURL}/training`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async getModule(moduleId: string) {
    const response = await fetch(`${this.baseURL}/training/${moduleId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async createModule(moduleData: any) {
    const response = await fetch(`${this.baseURL}/training`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(moduleData),
    });

    return this.handleResponse(response, false);
  }

  async updateModule(moduleId: string, moduleData: any) {
    const response = await fetch(`${this.baseURL}/training/${moduleId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(moduleData),
    });

    return this.handleResponse(response, false);
  }

  async deleteModule(moduleId: string) {
    const response = await fetch(`${this.baseURL}/training/${moduleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async updateModuleProgress(moduleId: string, lessonId: string) {
    const response = await fetch(`${this.baseURL}/training/${moduleId}/progress`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ lessonId }),
    });

    return this.handleResponse(response, false);
  }

  // Task endpoints
  async getTasks(trackId?: string, filters?: any) {
    let url = `${this.baseURL}/tasks`;
    const params = new URLSearchParams();
    
    if (trackId) params.append('track', trackId);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async getTask(taskId: string) {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async createTask(taskData: any) {
    const response = await fetch(`${this.baseURL}/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData),
    });

    return this.handleResponse(response, false);
  }

  async updateTask(taskId: string, taskData: any) {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData),
    });

    return this.handleResponse(response, false);
  }

  async deleteTask(taskId: string) {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, false);
  }

  async submitTask(taskId: string, submissionData: any) {
    // If files are present, use FormData
    const hasFiles = submissionData.files && Array.isArray(submissionData.files) && submissionData.files.length > 0;
    let body: any;
    let baseHeaders = this.getHeaders();
    let headers: Record<string, string> = (baseHeaders && typeof baseHeaders === 'object' && !Array.isArray(baseHeaders)) ? { ...baseHeaders as Record<string, string> } : {};
    let isFormData = false;
    if (hasFiles) {
      body = new FormData();
      Object.entries(submissionData).forEach(([key, value]) => {
        if (key === 'files' && Array.isArray(value)) {
          (value as any[]).forEach((file: any) => {
            // If file is a File object, append directly; if base64, convert
            if (file instanceof File) {
              body.append('files', file);
            } else if (file && file.content && file.name) {
              // Convert base64 to Blob
              const arr = file.content.split(',');
              const mime = arr[0].match(/:(.*?);/)[1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const blob = new Blob([u8arr], { type: mime });
              const fileObj = new File([blob], file.name, { type: mime });
              body.append('files', fileObj);
            }
          });
        } else if (value !== undefined && value !== null) {
          body.append(key, value);
        }
      });
      // Remove Content-Type so browser sets it
      delete headers['Content-Type'];
      isFormData = true;
    } else {
      body = JSON.stringify(submissionData);
    }
    const response = await fetch(`${this.baseURL}/tasks/${taskId}/submit`, {
      method: 'POST',
      headers,
      body,
    });
    return this.handleResponse(response, false);
  }

  async getSubmissions(taskId?: string, userRole?: string) {
    let url;
    if (userRole === 'admin') {
      url = taskId 
        ? `${this.baseURL}/tasks/${taskId}/submissions`
        : `${this.baseURL}/tasks/submissions`;
    } else {
      url = `${this.baseURL}/submissions/my`;
    }
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  // Resume endpoints
  async getResume() {
    const response = await fetch(`${this.baseURL}/resume`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, true);
  }

  async generateResume(resumeData: any) {
    const response = await fetch(`${this.baseURL}/resume/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(resumeData),
    });

    return this.handleResponse(response, true);
  }

  async enhanceResume(resumeData: any) {
    const response = await fetch(`${this.baseURL}/resume/enhance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(resumeData),
    });

    return this.handleResponse(response, true);
  }

  async getResumeTemplate(track: string) {
    const response = await fetch(`${this.baseURL}/resume/templates?track=${encodeURIComponent(track)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  // Admin endpoints
  async getStudents(filters?: any) {
    let url = `${this.baseURL}/admin/users`;
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      if (params) url += `?${params}`;
    }
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  async updateStudent(studentId: string, studentData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${studentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(response, true);
  }

  async deleteStudent(studentId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${studentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  async getAnalytics(dateRange?: string) {
    let url = `${this.baseURL}/admin/analytics`;
    if (dateRange) {
      url += `?range=${dateRange}`;
    }

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response, true);
  }

  async reviewSubmission(submissionId: string, reviewData: { score: number; feedback: string; status: string }) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/review`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return this.handleResponse(response, false);
  }

  // AI Chat Mentor
  async chatWithAI(message: string, context?: string) {
    const response = await fetch(`${this.baseURL}/api/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, context })
    });
    return this.handleResponse(response);
  }

  // AI Task Feedback
  async generateFeedback(task: any, submission: string) {
    const response = await fetch(`${this.baseURL}/api/ai/feedback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ task, submission })
    });
    return this.handleResponse(response);
  }

  // AI Resume Generation
  async generateResumeContent(userData: any) {
    const response = await fetch(`${this.baseURL}/api/ai/resume`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userData })
    });
    return this.handleResponse(response);
  }

  async getUpcomingTasks() {
    const response = await fetch(`${this.baseURL}/tasks/upcoming`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  async getAllStudentTasks() {
    const response = await fetch(`${this.baseURL}/tasks/all`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  async addStudent(studentData: any) {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(response, true);
  }

  // Admin settings endpoints
  async getPlatformSettings() {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  async updatePlatformSettings(settings: any) {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    return this.handleResponse(response, true);
  }
}

export default new ApiService();