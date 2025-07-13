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
export const generateContent = createAsyncThunk(
  'gemini/generateContent',
  async (prompt: string, { rejectWithValue }) => {
    try {
      const response = await apiService.generatePersonalizedContent(prompt);
      return response.data.content;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate content');
    }
  }
);

export const generateFeedback = createAsyncThunk(
  'gemini/generateFeedback',
  async ({ taskId, submission }: { taskId: string; submission: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.generateFeedback(taskId, submission);
      return response.data.feedback;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate feedback');
    }
  }
);

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
      // Generate content
      .addCase(generateContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastResponse = action.payload;
        state.error = null;
      })
      .addCase(generateContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Generate feedback
      .addCase(generateFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastResponse = action.payload;
        state.error = null;
      })
      .addCase(generateFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
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