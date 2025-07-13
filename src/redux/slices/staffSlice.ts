import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchAllStaff = createAsyncThunk(
  'staff/fetchAllStaff',
  async (_, { rejectWithValue }) => {
    try {
      // Use the new getAllStaffUsers method to fetch staff from User list
      const response = await apiService.getAllStaffUsers();
      if (!response.success) throw new Error(response.message || 'Failed to fetch staff');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch staff');
    }
  }
);

export const fetchStaffById = createAsyncThunk(
  'staff/fetchStaffById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getStaffById(id);
      if (!response.success) throw new Error(response.message || 'Failed to fetch staff');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch staff');
    }
  }
);

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async (staffData: any, { rejectWithValue }) => {
    try {
      // Use the new addStaffUser method to create staff as User
      const response = await apiService.addStaffUser(staffData);
      if (!response.success) throw new Error(response.message || 'Failed to create staff');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create staff');
    }
  }
);

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ id, staffData }: { id: string; staffData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateStaff(id, staffData);
      if (!response.success) throw new Error(response.message || 'Failed to update staff');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update staff');
    }
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteStaff(id);
      if (!response.success) throw new Error(response.message || 'Failed to delete staff');
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete staff');
    }
  }
);

interface StaffState {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: StaffState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all staff
      .addCase(fetchAllStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch staff by ID (no direct state update, handled by component)
      .addCase(fetchStaffById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffById.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.loading = false;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const idx = state.data.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.data[idx] = action.payload;
        state.loading = false;
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete staff
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.data = state.data.filter((s) => s._id !== action.payload.id);
        state.loading = false;
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default staffSlice.reducer; 