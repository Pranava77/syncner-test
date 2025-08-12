import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark mode if no preference is saved
    return true;
  }
  return true;
};

const initialState: ThemeState = {
  isDarkMode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Save preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', state.isDarkMode ? 'dark' : 'light');
      }
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', state.isDarkMode ? 'dark' : 'light');
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer; 