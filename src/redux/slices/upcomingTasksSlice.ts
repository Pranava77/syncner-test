import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchUpcomingTasks = createAsyncThunk(
  'upcomingTasks/fetchUpcomingTasks',
  async () => {
    const response = await apiService.getUpcomingTasks();
    if (!response.success) throw new Error(response.message || 'Failed to fetch upcoming tasks');
    return response.data || [];
  }
);

interface UpcomingTasksState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: UpcomingTasksState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const upcomingTasksSlice = createSlice({
  name: 'upcomingTasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingTasks.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUpcomingTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch upcoming tasks';
      });
  },
});

export default upcomingTasksSlice.reducer; 