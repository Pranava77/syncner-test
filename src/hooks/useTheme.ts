import { useAppSelector, useAppDispatch } from '../redux/store';
import { setTheme, toggleTheme, setDarkMode, ThemeMode } from '../redux/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { mode, isDarkMode } = useAppSelector((state) => state.theme);

  const changeTheme = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };

  const toggle = () => {
    dispatch(toggleTheme());
  };

  const setDark = (dark: boolean) => {
    dispatch(setDarkMode(dark));
  };

  return {
    mode,
    isDarkMode,
    changeTheme,
    toggle,
    setDark,
  };
};
