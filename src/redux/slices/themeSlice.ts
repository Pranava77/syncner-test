import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDarkMode: boolean;
}

const getInitialTheme = (): ThemeMode => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    return savedTheme as ThemeMode;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'system';
  }
  
  return 'light';
};

const getIsDarkMode = (mode: ThemeMode): boolean => {
  if (mode === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return mode === 'dark';
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  isDarkMode: getIsDarkMode(getInitialTheme()),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.isDarkMode = getIsDarkMode(action.payload);
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = newMode;
      state.isDarkMode = newMode === 'dark';
      localStorage.setItem('theme', newMode);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      const newMode = action.payload ? 'dark' : 'light';
      state.mode = newMode;
      localStorage.setItem('theme', newMode);
    },
  },
});

export const { setTheme, toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer; 