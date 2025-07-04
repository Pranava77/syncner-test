import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async () => {
    const response = await apiService.getSubmissions();
    if (!response.success) throw new Error(response.message || 'Failed to fetch submissions');
    return response.submissions || response.data || [];
  }
);

interface SubmissionsState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: SubmissionsState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch submissions';
      });
  },
});

export default submissionsSlice.reducer; 