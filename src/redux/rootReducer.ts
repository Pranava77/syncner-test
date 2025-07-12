import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import geminiReducer from './slices/geminiSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import diagnosticsReducer from './slices/diagnosticsSlice';
import progressReducer from './slices/progressSlice';
import modulesReducer from './slices/modulesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  gemini: geminiReducer,
  analytics: analyticsReducer,
  settings: settingsReducer,
  diagnostics: diagnosticsReducer,
  progress: progressReducer,
  modules: modulesReducer,
});

export default rootReducer;