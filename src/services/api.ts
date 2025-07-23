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

  private async handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken();
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // Handle authorization errors
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to perform this action.');
      }
      
      // Handle not found errors
      if (response.status === 404) {
        throw new Error('Resource not found.');
      }
      
      // Handle validation errors
      if (response.status === 400) {
        const errorMessage = data.message || 'Invalid request data';
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors = data.errors.map((err: any) => err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        throw new Error(errorMessage);
      }
      
      // Handle server errors
      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
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
      credentials: 'include',
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
      credentials: 'include',
    });

    return this.handleResponse(response);
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

    const data = await this.handleResponse(response);
    return data;
  }

  // Remove getUserProgress method

  // Career tracks endpoints
  async getCareerTracks() {
    const response = await fetch(`${this.baseURL}/tracks`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getCareerTrack(trackId: string) {
    const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  // Training endpoints for levels
  async getLevels(trackId?: string) {
    const url = trackId 
      ? `${this.baseURL}/training/levels?track=${trackId}`
      : `${this.baseURL}/training/levels`;
    console.log('API: Fetching levels from:', url);
    const response = await fetch(url, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    const result = await this.handleResponse(response);
    console.log('API: Levels response:', result);
    return result;
  }

  async getLevel(levelId: string) {
    const response = await fetch(`${this.baseURL}/training/levels/${levelId}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
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
    return this.handleResponse(response);
  }

  async updateStudent(studentId: string, studentData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${studentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(response);
  }

  async deleteStudent(studentId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${studentId}`, {
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
    return this.handleResponse(response);
  }

  // Add a method to create a staff user using the User model
  async addStaffUser(staffData: { name: string; email: string; password: string; department?: string; role?: string }) {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...staffData, role: 'staff' }),
    });
    return this.handleResponse(response);
  }

  // Add a method to fetch all users with role=staff
  async getAllStaffUsers() {
    const response = await fetch(`${this.baseURL}/admin/users?role=staff`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllUsers(filters?: any) {
    let url = `${this.baseURL}/admin/users`;
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      if (params) url += `?${params}`;
    }
    const response = await fetch(url, {
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
    return this.handleResponse(response);
  }

  async deleteAdmin(adminId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${adminId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async addAdmin(adminData: any) {
    // Ensure role is always 'admin' when creating
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...adminData, role: 'admin' }),
    });
    return this.handleResponse(response);
  }

  // Add a generic addUser method for admin UI
  async addUser(userData: any) {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Admin settings endpoints
  async getPlatformSettings() {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updatePlatformSettings(settings: any) {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    return this.handleResponse(response);
  }

  // Staff endpoints
  async getAllStaff() {
    const response = await fetch(`${this.baseURL}/staff`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getStaffById(staffId: string) {
    const response = await fetch(`${this.baseURL}/staff/${staffId}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async createStaff(staffData: any) {
    const response = await fetch(`${this.baseURL}/staff`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(staffData),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updateStaff(staffId: string, staffData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${staffId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(staffData),
    });
    return this.handleResponse(response);
  }

  async deleteStaff(staffId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${staffId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, userData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAttendance(userId: string) {
    const response = await fetch(`${this.baseURL}/attendance/${userId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  /**
   * Admin: Reset a user's password
   * @param userId - The user's ID
   * @param newPassword - The new password to set
   */
  async resetUserPassword(userId: string, newPassword: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ password: newPassword }),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Generic HTTP methods for flexible API calls
  async get(endpoint: string) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API: Generic GET request to:', url);
    const response = await fetch(url, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    const result = await this.handleResponse(response);
    console.log('API: Generic GET response:', result);
    return result;
  }

  async post(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
