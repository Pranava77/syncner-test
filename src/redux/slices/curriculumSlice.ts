import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchCurriculum = createAsyncThunk(
  'curriculum/fetchCurriculum',
  async ({ type, trackId }: { type: string; trackId?: string }) => {
    if (!trackId) {
      return [];
    }
    const response = await apiService.getLevels(trackId);
    if (!response.success) throw new Error(response.message || 'Failed to fetch curriculum');
    return response.data || [];
  }
);

export const fetchLevelsWithStatus = createAsyncThunk(
  'curriculum/fetchLevelsWithStatus',
  async ({ trackId }: { trackId: string }) => {
    if (!trackId) {
      return { levels: [], status: [] };
    }
    
    // Fetch both levels and status in parallel for better performance
    const [levelsResponse, statusResponse] = await Promise.all([
      apiService.getLevels(trackId),
      apiService.getLevelsStatus()
    ]);
    
    if (!levelsResponse.success) throw new Error(levelsResponse.message || 'Failed to fetch levels');
    
    const levelsData = Array.isArray(levelsResponse.data) ? levelsResponse.data : [levelsResponse.data];
    const statusData = statusResponse?.data?.levels || [];
    
    return { levels: levelsData, status: statusData };
  }
);

interface CurriculumState {
  data: any[];
  levelsWithStatus: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheExpiry: number; // Increased cache duration for better performance
}

const initialState: CurriculumState = {
  data: [],
  levelsWithStatus: [],
  loading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 10 * 60 * 1000, // 10 minutes (increased from 5 minutes)
};

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    clearCache: (state) => {
      state.lastFetched = null;
      state.levelsWithStatus = [];
      state.data = [];
      // Force immediate invalidation by setting cache expiry to past
      state.cacheExpiry = 0;
    },
    forceRefresh: (state) => {
      state.lastFetched = null;
      state.cacheExpiry = 0;
    },
    updateLevelStatus: (state, action) => {
      const { levelId, section, completed } = action.payload;
      const levelIndex = state.levelsWithStatus.findIndex(level => level.id === levelId);
      if (levelIndex !== -1) {
        if (!state.levelsWithStatus[levelIndex].completedSections) {
          state.levelsWithStatus[levelIndex].completedSections = {};
        }
        state.levelsWithStatus[levelIndex].completedSections[section] = completed;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurriculum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurriculum.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
        // Reset cache expiry to normal value after successful fetch
        state.cacheExpiry = 10 * 60 * 1000; // 10 minutes
      })
      .addCase(fetchCurriculum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch curriculum';
      })
      .addCase(fetchLevelsWithStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLevelsWithStatus.fulfilled, (state, action) => {
        const { levels, status } = action.payload;
        
        // Merge levels with their status - optimized for performance
        const levelsWithStatus = levels.map((level: any) => {
          const levelStatus = status.find((s: any) => s.id === level.id);
          return {
            ...level,
            isUnlocked: levelStatus?.isUnlocked || level.order === 1,
            isCompleted: levelStatus?.isCompleted || false,
            completedSections: levelStatus?.completedSections || {}
          };
        });
        
        state.levelsWithStatus = levelsWithStatus;
        state.loading = false;
        state.lastFetched = Date.now();
        // Reset cache expiry to normal value after successful fetch
        state.cacheExpiry = 10 * 60 * 1000; // 10 minutes
      })
      .addCase(fetchLevelsWithStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch levels with status';
      });
  },
});

export const { clearCache, forceRefresh, updateLevelStatus } = curriculumSlice.actions;
export default curriculumSlice.reducer; 