import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import geminiReducer from './slices/geminiSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import curriculumReducer from './slices/curriculumSlice';
import usersReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  gemini: geminiReducer,
  analytics: analyticsReducer,
  settings: settingsReducer,
  curriculum: curriculumReducer,
  users: usersReducer,
});

export default rootReducer;