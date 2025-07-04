import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ trackId, filters }: { trackId?: string; filters?: any } = {}) => {
    const response = await apiService.getTasks(trackId, filters);
    if (!response.success) throw new Error(response.message || 'Failed to fetch tasks');
    // Handle both array and object with data property
    const tasksData = Array.isArray(response.data) ? response.data : response.data.tasks || response.data;
    return tasksData || [];
  }
);

interface TasksState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: TasksState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      });
  },
});

export default tasksSlice.reducer; 