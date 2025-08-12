import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDarkMode: boolean; // Keep for backward compatibility
}

// Get initial theme from localStorage or default to dark
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
  }
  return 'dark';
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  isDarkMode: getInitialTheme() === 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.isDarkMode = action.payload === 'dark';
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    toggleTheme: (state) => {
      const newMode: ThemeMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = newMode;
      state.isDarkMode = newMode === 'dark';
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newMode);
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer; 