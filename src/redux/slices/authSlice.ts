import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'staff';
  college: string;
  department?: string;
  careerTrack?: string;
  profileComplete: boolean;
  level?: string;
  interests?: string[];
  streakDays?: number;
  totalPoints?: number;
  phone?: string;
  location?: string;
  gpa?: string;
  graduationYear?: string;
  lastActive?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
}

const token = localStorage.getItem('token');

const initialState: AuthState = {
  user: null,
  token,
  isLoading: false,
  error: null,
  isAuthenticated: !!token, // Set to true if token exists
  isRestoringSession: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data.token) {
        // Fetch the full user profile using the new token
        const profileResponse = await apiService.getMe();
        if (profileResponse.success && profileResponse.data.user) {
          return { user: profileResponse.data.user, token: response.data.token };
        } else {
          return rejectWithValue('Failed to fetch user profile after login');
        }
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    name: string;
    email: string;
    password: string;
    college: string;
    role?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMe();
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to fetch user');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProfile(profileData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Profile update failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      return null;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isRestoringSession = false;
      localStorage.removeItem('token');
    },
    restoreSession: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
      state.isRestoringSession = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRestoringSession = false;
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true; // <-- always boolean
          state.error = null;
          localStorage.setItem('token', action.payload.token);
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = 'Login failed: Invalid response from server.';
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isRestoringSession = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true; // <-- always boolean
          state.isRestoringSession = false;
          state.error = null;
          localStorage.setItem('token', action.payload.token);
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isRestoringSession = false;
          state.error = 'Registration failed: Invalid response from server.';
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isRestoringSession = false;
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true; // <-- always boolean
          state.isRestoringSession = false;
          state.error = null;
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.isRestoringSession = false;
          state.error = 'Failed to fetch user: Invalid response from server.';
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isRestoringSession = false;
        localStorage.removeItem('token');
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
          state.isAuthenticated = true; // <-- always boolean
          state.error = null;
        } else {
          state.error = 'Profile update failed: Invalid response from server.';
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.isRestoringSession = false;
        localStorage.removeItem('token');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
        state.isRestoringSession = false;
        localStorage.removeItem('token');
      });
  },
});

export const { clearError, setLoading, clearAuth, restoreSession } = authSlice.actions;
export default authSlice.reducer;