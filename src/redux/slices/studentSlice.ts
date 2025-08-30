import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StudentDetails } from '../../types/staff';
import apiService from '../../services/api';

// Async thunk for fetching student portfolio data
export const fetchStudentPortfolio = createAsyncThunk(
  'student/fetchPortfolio',
  async (studentId: string, { rejectWithValue }) => {
    try {
      console.log('🎯 Calling NEW student portfolio API for student:', studentId);
      const response = await apiService.getStudentPortfolio(studentId);
      console.log('✅ Student portfolio API response:', response);
      return response.data.student;  // Extract the student data from the nested response
    } catch (error: any) {
      console.error('❌ Student portfolio API error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio data');
    }
  }
);

interface StudentState {
  portfolioData: StudentDetails | null;
  portfolioLoading: boolean;
  portfolioError: string | null;
}

const initialState: StudentState = {
  portfolioData: null,
  portfolioLoading: false,
  portfolioError: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearPortfolioData: (state) => {
      state.portfolioData = null;
      state.portfolioError = null;
    },
    clearPortfolioError: (state) => {
      state.portfolioError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentPortfolio.pending, (state) => {
        state.portfolioLoading = true;
        state.portfolioError = null;
      })
      .addCase(fetchStudentPortfolio.fulfilled, (state, action) => {
        state.portfolioLoading = false;
        state.portfolioData = action.payload;
        state.portfolioError = null;
      })
      .addCase(fetchStudentPortfolio.rejected, (state, action) => {
        state.portfolioLoading = false;
        state.portfolioError = action.payload as string;
      });
  },
});

export const { clearPortfolioData, clearPortfolioError } = studentSlice.actions;
export default studentSlice.reducer;
