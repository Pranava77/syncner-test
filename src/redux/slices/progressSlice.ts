import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async () => {
    const response = await apiService.getUserProgress();
    if (!response.success) throw new Error(response.message || 'Failed to fetch progress');
    return response.data.progress;
  }
);

interface ProgressState {
  data: any;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: ProgressState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch progress';
      });
  },
});

export default progressSlice.reducer; 