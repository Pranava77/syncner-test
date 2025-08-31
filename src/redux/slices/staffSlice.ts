import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Student, 
  StudentDetails, 
  StaffAnalytics, 
  StudentFilters, 
  PaginationState 
} from '../../types/staff';
import apiService from '../../services/api';
import { StudentTimelineService } from '../../services/studentTimelineService';

// Async thunks
export const fetchStudents = createAsyncThunk(
  'staff/fetchStudents',
  async ({ filters, page, limit }: { filters?: StudentFilters; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.getStudents(filters, page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch students');
    }
  }
);

export const fetchStudentDetails = createAsyncThunk(
  'staff/fetchStudentDetails',
  async (studentId: string, { rejectWithValue }) => {
    try {
      console.log('🚀 Starting Two-API Student Details Fetch...');
      
      // Use the new StudentTimelineService for clean two-API approach
      const combinedTimeline = await StudentTimelineService.generateStudentTimeline(studentId);
      
      // Get additional student data from portfolio for other fields
      const portfolioResponse = await apiService.getStudentPortfolio(studentId);
      const studentData = portfolioResponse.data.student;
      
      // Add the combined timeline to the student data
      studentData.learningTimeline = combinedTimeline;
      
      console.log('✅ Two-API Student Details Fetch Complete:', {
        studentId,
        careerTrack: studentData.careerTrack,
        timelineLevels: combinedTimeline.length,
        studentName: studentData.name
      });
      
      return studentData;
    } catch (error: any) {
      console.error('❌ Two-API Student Details Fetch Failed:', error);
      return rejectWithValue(error.message || 'Failed to fetch student details');
    }
  }
);



export const fetchStaffAnalytics = createAsyncThunk(
  'staff/fetchStaffAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getStaffAnalytics();
      return response.data.analytics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

// State interface
interface StaffState {
  students: Student[];
  selectedStudent: StudentDetails | null;
  analytics: StaffAnalytics | null;
  loading: boolean;
  error: string | null;
  filters: StudentFilters;
  pagination: PaginationState;
  studentsLoading: boolean;
  studentDetailsLoading: boolean;
  analyticsLoading: boolean;
}

// Initial state
const initialState: StaffState = {
  students: [],
  selectedStudent: null,
  analytics: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    careerTrack: 'all',
    sortBy: 'lastActive',
    sortOrder: 'desc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  studentsLoading: false,
  studentDetailsLoading: false,
  analyticsLoading: false
};

// Staff slice
const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<StudentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    // Fetch students
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.studentsLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch student details
    builder
      .addCase(fetchStudentDetails.pending, (state) => {
        state.studentDetailsLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentDetails.fulfilled, (state, action) => {
        state.studentDetailsLoading = false;
        state.selectedStudent = action.payload;
        console.log('🔄 Redux State Updated: selectedStudent set to:', action.payload);
        console.log('📚 Redux State: Learning timeline length:', action.payload?.learningTimeline?.length || 0);
        console.log('📋 Redux State: Timeline structure:', JSON.stringify(action.payload?.learningTimeline, null, 2));
        state.error = null;
      })
      .addCase(fetchStudentDetails.rejected, (state, action) => {
        state.studentDetailsLoading = false;
        state.error = action.payload as string;
      });



    // Fetch analytics
    builder
      .addCase(fetchStaffAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(fetchStaffAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { 
  setFilters, 
  setPagination, 
  clearError, 
  clearSelectedStudent,
  resetFilters 
} = staffSlice.actions;

// Export selectors
export const selectStaffState = (state: { staff: StaffState }) => state.staff;
export const selectStudents = (state: { staff: StaffState }) => state.staff.students;
export const selectSelectedStudent = (state: { staff: StaffState }) => state.staff.selectedStudent;
export const selectAnalytics = (state: { staff: StaffState }) => state.staff.analytics;
export const selectStudentsLoading = (state: { staff: StaffState }) => state.staff.studentsLoading;
export const selectStudentDetailsLoading = (state: { staff: StaffState }) => state.staff.studentDetailsLoading;
export const selectAnalyticsLoading = (state: { staff: StaffState }) => state.staff.analyticsLoading;
export const selectFilters = (state: { staff: StaffState }) => state.staff.filters;
export const selectPagination = (state: { staff: StaffState }) => state.staff.pagination;
export const selectError = (state: { staff: StaffState }) => state.staff.error;

export default staffSlice.reducer;
