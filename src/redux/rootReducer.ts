import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import geminiReducer from './slices/geminiSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import diagnosticsReducer from './slices/diagnosticsSlice';
import progressReducer from './slices/progressSlice';
import modulesReducer from './slices/modulesSlice';
import tasksReducer from './slices/tasksSlice';
import upcomingTasksReducer from './slices/upcomingTasksSlice';
import submissionsReducer from './slices/submissionsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  gemini: geminiReducer,
  analytics: analyticsReducer,
  settings: settingsReducer,
  diagnostics: diagnosticsReducer,
  progress: progressReducer,
  modules: modulesReducer,
  tasks: tasksReducer,
  upcomingTasks: upcomingTasksReducer,
  submissions: submissionsReducer,
});

export default rootReducer;