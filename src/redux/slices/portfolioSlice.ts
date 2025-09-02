import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioService, StudentPortfolioData } from '../../services/portfolioService';
import { RootState } from '../store';

// Types
type SectionType = 'learn' | 'test' | 'exercise';

interface SectionUpdatePayload {
  levelId: number;
  sectionType: SectionType;
  data: any;
}

export interface PortfolioState {
  data: (StudentPortfolioData & {
    learningLevels: Array<{
      level: number;
      courseName: string;
      description: string;
      status: 'not-started' | 'in-progress' | 'completed';
      readFirst?: {
        brief?: string;
        whyLearn?: string;
        whereUsed?: string;
        customExample?: string;
      };
      difficulty: string;
      duration: string;
      estimatedHours: number;
      skills: string[];
      prerequisites: string[];
      learn: {
        completed: boolean;
        startTime: string | null;
        endTime: string | null;
        timeSpent: number;
        content: Array<any>;
        title: string;
        status: string;
        materials: Array<any>;
      };
      test: {
        completed: boolean;
        score: number;
        attempts: number;
        startTime: string | null;
        endTime: string | null;
        content: Array<any>;
        title: string;
        status: string;
        questions: Array<any>;
      };
      exercise: {
        completed: boolean;
        startTime: string | null;
        endTime: string | null;
        timeSpent: number;
        content: Array<any>;
        title: string;
        status: string;
        tasks: Array<any>;
      };
    }>;
  }) | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: PortfolioState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null
};

// Thunks
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async (studentId: string = 'me', { rejectWithValue }) => {
    try {
      const data = await PortfolioService.getStudentPortfolio(studentId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch portfolio');
    }
  }
);

// Slice
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearPortfolio: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
    },
    updatePortfolioSection: (state, action: PayloadAction<SectionUpdatePayload>) => {
      if (state.data) {
        const { levelId, sectionType, data } = action.payload;
        const level = state.data.learningLevels.find(l => l.level === levelId);
        if (level) {
          switch (sectionType) {
            case 'learn':
              level.learn = { ...level.learn, ...data };
              break;
            case 'test':
              level.test = { ...level.test, ...data };
              break;
            case 'exercise':
              level.exercise = { ...level.exercise, ...data };
              break;
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Actions
export const { clearPortfolio, updatePortfolioSection } = portfolioSlice.actions;

// Selectors
export const selectPortfolio = (state: RootState) => state.portfolio.data;
export const selectPortfolioLoading = (state: RootState) => state.portfolio.loading;
export const selectPortfolioError = (state: RootState) => state.portfolio.error;
export const selectLastFetched = (state: RootState) => state.portfolio.lastFetched;

// Selector for specific level
export const selectLevel = (state: RootState, levelId: number) => 
  state.portfolio.data?.learningLevels.find(l => l.level === levelId);

// Selector for progress overview
export const selectProgressOverview = (state: RootState) => state.portfolio.data?.progress;

// Selector for attendance stats
export const selectAttendanceStats = (state: RootState) => state.portfolio.data?.attendance;

// Selector for leaderboard data
export const selectLeaderboardData = (state: RootState) => state.portfolio.data?.leaderboard;

export default portfolioSlice.reducer;