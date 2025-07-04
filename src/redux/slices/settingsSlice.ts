import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const response = await apiService.getPlatformSettings();
    if (!response.success) throw new Error(response.message || 'Failed to fetch settings');
    return response.data;
  }
);

interface SettingsState {
  data: any;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      });
  },
});

export default settingsSlice.reducer; 