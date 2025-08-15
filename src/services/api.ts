const API_BASE_URL =  'https://syncner-test.onrender.com/api';

class ApiService {
  private baseURL: string

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

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async register(userData: { name: string; email: string; password: string; careerTrack: string }) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getCurrentUser(token?: string) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(token),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData: any) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(token: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });
    return this.handleResponse(response);
  }

  // Training endpoints
  async getLevels(trackId?: string) {
    const timestamp = Date.now(); // Cache busting
    const url = trackId 
      ? `${this.baseURL}/training/levels?track=${trackId}&_t=${timestamp}`
      : `${this.baseURL}/training/levels?_t=${timestamp}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getLevel(levelId: string) {
    const response = await fetch(`${this.baseURL}/training/levels/${levelId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Progress endpoints
  async getUserProgress(careerTrack: string) {
    const response = await fetch(`${this.baseURL}/progress/${careerTrack}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async markLevelCompleted(levelId: string, levelOrder: number, section: string) {
    const response = await fetch(`${this.baseURL}/progress/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ levelId, levelOrder, section }),
    });
    return this.handleResponse(response);
  }

  async updateLearnProgress(levelId: string, timeSpent: number, linksAccessed: string[]) {
    const response = await fetch(`${this.baseURL}/progress/learn-progress`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ levelId, timeSpent, linksAccessed }),
    });
    return this.handleResponse(response);
  }

  async submitTestAttempt(levelId: string, score: number, answers: any[]) {
    const response = await fetch(`${this.baseURL}/progress/test-attempt`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ levelId, score, answers }),
    });
    return this.handleResponse(response);
  }

  async checkTestUnlocked(levelId: string) {
    const response = await fetch(`${this.baseURL}/progress/test-unlocked/${levelId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async checkExerciseUnlocked(levelId: string) {
    const response = await fetch(`${this.baseURL}/progress/exercise-unlocked/${levelId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async checkExerciseLinks(levelId: string) {
    const response = await fetch(`${this.baseURL}/progress/exercise-links/${levelId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async submitExercise(levelId: string, exerciseTitle: string, links?: string[]) {
    const response = await fetch(`${this.baseURL}/progress/submit-exercise`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ levelId, exerciseTitle, links }),
    });
    return this.handleResponse(response);
  }

  async updateExercise(levelId: string, exerciseTitle: string, links?: string[]) {
    const response = await fetch(`${this.baseURL}/progress/update-exercise`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ levelId, exerciseTitle, links }),
    });
    return this.handleResponse(response);
  }

  async getLevelsStatus() {
    const response = await fetch(`${this.baseURL}/progress/levels-status`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getLevelSectionStatus(levelId: string) {
    const response = await fetch(`${this.baseURL}/progress/level-sections/${levelId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async checkLevelUnlocked(levelOrder: number) {
    const response = await fetch(`${this.baseURL}/progress/unlocked/${levelOrder}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Admin endpoints
  async getAdminStats() {
    const response = await fetch(`${this.baseURL}/admin/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getLevelProgress() {
    const response = await fetch(`${this.baseURL}/admin/level-progress`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getUsers(filters?: any) {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryParams ? `${this.baseURL}/admin/users?${queryParams}` : `${this.baseURL}/admin/users`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updateUserRole(userId: string, role: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Curriculum endpoints
  async getCurriculum() {
    const response = await fetch(`${this.baseURL}/curriculum`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async createCurriculumItem(itemData: any) {
    const response = await fetch(`${this.baseURL}/curriculum`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(itemData),
    });
    return this.handleResponse(response);
  }

  async updateCurriculumItem(itemId: string, itemData: any) {
    const response = await fetch(`${this.baseURL}/curriculum/${itemId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(itemData),
    });
    return this.handleResponse(response);
  }

  async deleteCurriculumItem(itemId: string) {
    const response = await fetch(`${this.baseURL}/curriculum/${itemId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Settings endpoints
  async getSettings() {
    const response = await fetch(`${this.baseURL}/settings`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updateSettings(settings: any) {
    const response = await fetch(`${this.baseURL}/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return this.handleResponse(response);
  }

  // Attendance endpoints
  async markAttendance() {
    const response = await fetch(`${this.baseURL}/attendance/mark`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getAttendance(userId: string) {
    const response = await fetch(`${this.baseURL}/attendance/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getAttendanceStats() {
    const response = await fetch(`${this.baseURL}/attendance/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // AI endpoints
  async chatWithAI(message: string, context?: string) {
    const response = await fetch(`${this.baseURL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ message, context }),
    });
    return this.handleResponse(response);
  }

  async getMe() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getCareerTrack(trackId: string) {
    const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async resetUserPassword(userId: string, password: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    return this.handleResponse(response);
  }

  async getStudents(filters?: any) {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryParams ? `${this.baseURL}/admin/users?${queryParams}` : `${this.baseURL}/admin/users`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updateStudent(studentId: string, studentData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${studentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(response);
  }

  async deleteStudent(studentId: string) {
    const response = await fetch(`${this.baseURL}/admin/users/${studentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async addStudent(studentData: any) {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(response);
  }

  async getAnalytics(dateRange?: string) {
    const url = dateRange ? `${this.baseURL}/admin/analytics?dateRange=${dateRange}` : `${this.baseURL}/admin/analytics`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getPlatformSettings() {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updatePlatformSettings(settings: any) {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return this.handleResponse(response);
  }

  async addUser(userData: any) {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async updateUser(id: string, userData: any) {
    const response = await fetch(`${this.baseURL}/admin/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Generic HTTP methods for AdminCurriculum
  async get(url: string) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async post(url: string, data?: any) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async put(url: string, data?: any) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete(url: string) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // File upload endpoints
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Cache management
  async invalidateCache() {
    const response = await fetch(`${this.baseURL}/curriculum/invalidate-cache`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
