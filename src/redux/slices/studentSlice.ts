import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StudentDetails } from '../../types/staff';
import apiService from '../../services/api';



interface StudentState {
  // Portfolio functionality has been removed
}

const initialState: StudentState = {
  // Portfolio functionality has been removed
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    // Portfolio functionality has been removed
  },

});

// Portfolio functionality has been removed
export default studentSlice.reducer;
