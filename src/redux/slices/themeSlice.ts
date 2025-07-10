import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

const initialState: ThemeState = {
  isDarkMode: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setDarkMode(state, action) {
      state.isDarkMode = action.payload;
    },
    toggle(state) {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { setDarkMode, toggle } = themeSlice.actions;
export default themeSlice.reducer; 