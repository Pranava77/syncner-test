import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import geminiReducer from './slices/geminiSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import diagnosticsReducer from './slices/diagnosticsSlice';
import levelsReducer from './slices/levelsSlice';
import staffReducer from './slices/staffSlice';
import usersReducer from './slices/userSlice';
import adminsReducer from './slices/adminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  gemini: geminiReducer,
  analytics: analyticsReducer,
  settings: settingsReducer,
  diagnostics: diagnosticsReducer,
  levels: levelsReducer,
  staff: staffReducer,
  users: usersReducer,
  admins: adminsReducer,
});

export default rootReducer;