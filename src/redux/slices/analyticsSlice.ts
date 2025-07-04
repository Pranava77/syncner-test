import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (dateRange?: string) => {
    const response = await apiService.getAnalytics(dateRange);
    if (!response.success) throw new Error(response.message || 'Failed to fetch analytics');
    return response.data;
  }
);

interface AnalyticsState {
  data: any;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      });
  },
});

export default analyticsSlice.reducer; 