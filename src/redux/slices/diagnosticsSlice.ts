import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchDiagnostics = createAsyncThunk(
  'diagnostics/fetchDiagnostics',
  async () => {
    // Use the new apiService.getDiagnostics method
    const data = await apiService.getDiagnostics();
    return data;
  }
);

interface DiagnosticsState {
  data: any;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DiagnosticsState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const diagnosticsSlice = createSlice({
  name: 'diagnostics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiagnostics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiagnostics.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDiagnostics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch diagnostics';
      });
  },
});

export default diagnosticsSlice.reducer; 