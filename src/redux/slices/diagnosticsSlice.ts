import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchDiagnostics = createAsyncThunk(
  'diagnostics/fetchDiagnostics',
  async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://syncner-test.onrender.com/api';
    const res = await fetch(`${API_BASE_URL}/admin/diagnostics`, {
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch diagnostics');
    const data = await res.json();
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