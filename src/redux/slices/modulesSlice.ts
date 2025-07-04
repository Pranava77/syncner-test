import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchModules = createAsyncThunk(
  'modules/fetchModules',
  async (trackId?: string) => {
    const response = await apiService.getModules(trackId);
    if (!response.success) throw new Error(response.message || 'Failed to fetch modules');
    // Handle both array and object with data property
    const modulesData = Array.isArray(response.data) ? response.data : response.data.modules || response.data;
    return modulesData || [];
  }
);

interface ModulesState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: ModulesState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch modules';
      });
  },
});

export default modulesSlice.reducer; 