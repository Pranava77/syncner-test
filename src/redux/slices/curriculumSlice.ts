import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchCurriculum = createAsyncThunk(
  'curriculum/fetchCurriculum',
  async ({ type, trackId }: { type: string; trackId?: string }) => {
    if (!trackId) {
      return [];
    }
    const response = await apiService.getLevels(type, trackId);
    if (!response.success) throw new Error(response.message || 'Failed to fetch curriculum');
    return response.data || [];
  }
);

interface CurriculumState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: CurriculumState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {},
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
      })
      .addCase(fetchCurriculum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch curriculum';
      });
  },
});

export default curriculumSlice.reducer; 