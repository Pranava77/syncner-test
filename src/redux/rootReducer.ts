import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import staffReducer from './slices/staffSlice';
import portfolioReducer from './slices/portfolioSlice';
import learningJourneyReducer from './slices/learningJourneySlice';
import curriculumReducer from './slices/curriculumSlice';
import settingsReducer from './slices/settingsSlice';
import analyticsReducer from './slices/analyticsSlice';
import geminiReducer from './slices/geminiSlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  staff: staffReducer,
  portfolio: portfolioReducer,
  learningJourney: learningJourneyReducer,
  curriculum: curriculumReducer,
  settings: settingsReducer,
  analytics: analyticsReducer,
  gemini: geminiReducer,
  users: userReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;