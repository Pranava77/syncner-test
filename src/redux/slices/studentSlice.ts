import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StudentDetails } from '../../types/staff';
import { ApiService } from '../../services/api';

// Async thunk for fetching student portfolio data
export const fetchStudentPortfolio = createAsyncThunk(
  'student/fetchPortfolio',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.getStudentPortfolio(studentId);
      return response.data;
    } catch (error: any) {
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
