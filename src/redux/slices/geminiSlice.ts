import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

interface GeminiState {
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
}

const initialState: GeminiState = {
  isLoading: false,
  error: null,
  lastResponse: null,
};

// Async thunks
export const chatWithAI = createAsyncThunk(
  'gemini/chatWithAI',
  async ({ message, context }: { message: string; context?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.chatWithAI(message, context);
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get AI response');
    }
  }
);

const geminiSlice = createSlice({
  name: 'gemini',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResponse: (state) => {
      state.lastResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Chat with AI
      .addCase(chatWithAI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(chatWithAI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastResponse = action.payload;
        state.error = null;
      })
      .addCase(chatWithAI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearResponse } = geminiSlice.actions;
export default geminiSlice.reducer; 