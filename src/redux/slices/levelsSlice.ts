import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchLevels = createAsyncThunk(
  'levels/fetchLevels',
  async (trackId?: string) => {
    const response = await apiService.getLevels(trackId);
    if (!response.success) throw new Error(response.message || 'Failed to fetch levels');
    // Handle both array and object with data property
    const levelsData = Array.isArray(response.data) ? response.data : response.data.levels || response.data;
    return levelsData || [];
  }
);

interface Level {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  duration?: string;
  careerTrack: string;
  skills?: string[];
  prerequisites?: string[];
  learn: any[];
  test: any[];
  exercise: any[];
  order?: number;
  isActive?: boolean;
  estimatedHours?: number;
}

interface LevelsState {
  data: Level[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: LevelsState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const levelsSlice = createSlice({
  name: 'levels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch levels';
      });
  },
});

export default levelsSlice.reducer; 