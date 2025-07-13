const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://syncner-test.onrender.com/api';

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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
    });

    return this.handleResponse(response, true);
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
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
      credentials: 'include',
    });

    const data = await this.handleResponse(response, true);
    return data;
  }

  // Remove getUserProgress method

  // Career tracks endpoints
  async getCareerTracks() {
    const response = await fetch(`${this.baseURL}/tracks`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response, false);
  }

  async getCareerTrack(trackId: string) {
    const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response, false);
  }

  // Training endpoints for levels
  async getLevels(trackId?: string) {
    const url = trackId 
      ? `${this.baseURL}/training/levels?track=${trackId}`
      : `${this.baseURL}/training/levels`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response, false);
  }

  async getLevel(levelId: string) {
    const response = await fetch(`${this.baseURL}/training/levels/${levelId}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response, false);
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

  // AI Chat Mentor
  async chatWithAI(message: string, context?: string) {
    const response = await fetch(`${this.baseURL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, context })
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

  // Add a method to create a staff user using the User model
  async addStaffUser(staffData: { name: string; email: string; password: string; department?: string; role?: string }) {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...staffData, role: 'staff' }),
    });
    return this.handleResponse(response, true);
  }

  // Add a method to fetch all users with role=staff
  async getAllStaffUsers() {
    const response = await fetch(`${this.baseURL}/admin/users?role=staff`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  async getAllUsers() {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllAdmins() {
    const response = await fetch(`${this.baseURL}/admin/users?role=admin`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateAdmin(adminId: string, adminData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${adminId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(adminData),
    });
    return this.handleResponse(response, true);
  }

  async deleteAdmin(adminId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${adminId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
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

  // Staff endpoints
  async getAllStaff() {
    const response = await fetch(`${this.baseURL}/staff`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response, false);
  }

  async getStaffById(staffId: string) {
    const response = await fetch(`${this.baseURL}/staff/${staffId}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response, false);
  }

  async createStaff(staffData: any) {
    const response = await fetch(`${this.baseURL}/staff`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(staffData),
      credentials: 'include',
    });
    return this.handleResponse(response, false);
  }

  async updateStaff(staffId: string, staffData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${staffId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(staffData),
    });
    return this.handleResponse(response, true);
  }

  async deleteStaff(staffId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${staffId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }

  async updateUser(userId: string, userData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response, true);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, true);
  }
}

export default new ApiService();
