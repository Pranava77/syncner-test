import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchAllAdmins = createAsyncThunk(
  'admins/fetchAllAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getAllAdmins();
      if (!response.success) throw new Error(response.message || 'Failed to fetch admins');
      // Only return users who are admins
      return response.data.filter((a: any) => a.role === 'admin');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch admins');
    }
  }
);

export const createAdmin = createAsyncThunk(
  'admins/createAdmin',
  async (adminData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.addAdmin(adminData);
      if (!response.success) throw new Error(response.message || 'Failed to create admin');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create admin');
    }
  }
);

export const updateAdmin = createAsyncThunk(
  'admins/updateAdmin',
  async ({ id, adminData }: { id: string; adminData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateAdmin(id, adminData);
      if (!response.success) throw new Error(response.message || 'Failed to update admin');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update admin');
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'admins/deleteAdmin',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteAdmin(id);
      if (!response.success) throw new Error(response.message || 'Failed to delete admin');
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete admin');
    }
  }
);

interface AdminsState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: AdminsState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const adminsSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.loading = false;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        const idx = state.data.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.data[idx] = action.payload;
        state.loading = false;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.data = state.data.filter((a) => a._id !== action.payload.id);
        state.loading = false;
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminsSlice.reducer; 