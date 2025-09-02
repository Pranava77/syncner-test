import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import apiService from '../../services/api';

// Types
interface LearningProgress {
  timeSpent: number;
  linksAccessed: string[];
  isCompleted: boolean;
}

interface TestProgress {
  score: number;
  attempts: number;
  isCompleted: boolean;
  lastAttemptAt?: Date;
}

interface ExerciseProgress {
  timeSpent: number;
  submissions: Array<{
    links: string[];
    submittedAt: Date;
    status: 'submitted' | 'approved' | 'rejected';
    feedback?: string;
  }>;
  isCompleted: boolean;
}

interface LevelProgress {
  levelId: string;
  learn: LearningProgress;
  test: TestProgress;
  exercise: ExerciseProgress;
  learnProgress: number;
  testProgress: number;
  exerciseProgress: number;
  overallProgress: number;
}

interface LearningJourneyState {
  progress: LevelProgress[];
  currentLevel: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Initial state
const initialState: LearningJourneyState = {
  progress: [],
  currentLevel: 1,
  loading: false,
  error: null,
  lastUpdated: null
};

// Thunks
export const fetchLearningProgress = createAsyncThunk(
  'learningJourney/fetchProgress',
  async (careerTrack: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserProgress(careerTrack);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch learning progress');
    }
  }
);

export const updateLearnProgress = createAsyncThunk(
  'learningJourney/updateLearn',
  async ({ levelId, timeSpent, linksAccessed }: { levelId: string; timeSpent: number; linksAccessed: string[] }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateLearnProgress(levelId, timeSpent, linksAccessed);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update learn progress');
    }
  }
);

export const submitTestAttempt = createAsyncThunk(
  'learningJourney/submitTest',
  async ({ levelId, score, answers }: { levelId: string; score: number; answers: any[] }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitTestAttempt(levelId, score, answers);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit test attempt');
    }
  }
);

export const submitExercise = createAsyncThunk(
  'learningJourney/submitExercise',
  async ({ levelId, exerciseTitle, links, score, feedback }: { levelId: string; exerciseTitle: string; links: string[]; score?: number; feedback?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitExercise(levelId, exerciseTitle, links, score, feedback);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit exercise');
    }
  }
);

// Slice
const learningJourneySlice = createSlice({
  name: 'learningJourney',
  initialState,
  reducers: {
    clearProgress: (state) => {
      state.progress = [];
      state.error = null;
      state.lastUpdated = null;
    },
    setCurrentLevel: (state, action) => {
      state.currentLevel = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Progress
      .addCase(fetchLearningProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningProgress.fulfilled, (state, action) => {
        state.loading = false;
        // Transform the progress data to include section progress
        state.progress = action.payload.map((level: any) => ({
          levelId: level.levelId,
          learn: level.learn,
          test: level.test,
          exercise: level.exercise,
          learnProgress: level.learnProgress || 0,
          testProgress: level.testProgress || 0,
          exerciseProgress: level.exerciseProgress || 0,
          overallProgress: level.overallProgress || 0
        }));
        state.lastUpdated = Date.now();
      })
      .addCase(fetchLearningProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Learn Progress
      .addCase(updateLearnProgress.fulfilled, (state, action) => {
        const { levelId, learnProgress } = action.payload;
        const levelIndex = state.progress.findIndex(p => p.levelId === levelId);
        if (levelIndex !== -1) {
          state.progress[levelIndex].learn = learnProgress;
          state.lastUpdated = Date.now();
        }
      })
      
      // Submit Test
      .addCase(submitTestAttempt.fulfilled, (state, action) => {
        const { levelId, testProgress } = action.payload;
        const levelIndex = state.progress.findIndex(p => p.levelId === levelId);
        if (levelIndex !== -1) {
          state.progress[levelIndex].test = testProgress;
          state.lastUpdated = Date.now();
        }
      })
      
      // Submit Exercise
      .addCase(submitExercise.fulfilled, (state, action) => {
        const { levelId, exerciseProgress } = action.payload;
        const levelIndex = state.progress.findIndex(p => p.levelId === levelId);
        if (levelIndex !== -1) {
          state.progress[levelIndex].exercise = exerciseProgress;
          state.lastUpdated = Date.now();
        }
      });
  }
});

// Actions
export const { clearProgress, setCurrentLevel } = learningJourneySlice.actions;

// Selectors
export const selectLearningProgress = (state: RootState) => state.learningJourney.progress;
export const selectCurrentLevel = (state: RootState) => state.learningJourney.currentLevel;
export const selectLearningLoading = (state: RootState) => state.learningJourney.loading;
export const selectLearningError = (state: RootState) => state.learningJourney.error;
export const selectLastUpdated = (state: RootState) => state.learningJourney.lastUpdated;

// Selector for specific level progress
export const selectLevelProgress = (state: RootState, levelId: string) =>
  state.learningJourney.progress.find(p => p.levelId === levelId);

export default learningJourneySlice.reducer;
