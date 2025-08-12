import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setTheme, toggleTheme, ThemeMode } from '../redux/slices/themeSlice';
import { SunIcon, MoonIcon, DesktopIcon } from '@radix-ui/react-icons';

const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mode, isDarkMode } = useAppSelector((state) => state.theme);

  const handleThemeChange = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Toggle Button */}
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors duration-200"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>

      {/* Theme Selector Dropdown */}
      <div className="relative group">
        <button
          className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors duration-200"
          title="Select Theme"
          aria-label="Select Theme"
        >
          <DesktopIcon className="h-5 w-5" />
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-border-primary rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent-primary/10 transition-colors duration-200 flex items-center gap-3 ${
                mode === 'light' ? 'text-accent-primary bg-accent-primary/10' : 'text-text-secondary'
              }`}
            >
              <SunIcon className="h-4 w-4" />
              Light
              {mode === 'light' && (
                <div className="ml-auto w-2 h-2 bg-accent-primary rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => handleThemeChange('dark')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent-primary/10 transition-colors duration-200 flex items-center gap-3 ${
                mode === 'dark' ? 'text-accent-primary bg-accent-primary/10' : 'text-text-secondary'
              }`}
            >
              <MoonIcon className="h-4 w-4" />
              Dark
              {mode === 'dark' && (
                <div className="ml-auto w-2 h-2 bg-accent-primary rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => handleThemeChange('system')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent-primary/10 transition-colors duration-200 flex items-center gap-3 ${
                mode === 'system' ? 'text-accent-primary bg-accent-primary/10' : 'text-text-secondary'
              }`}
            >
              <DesktopIcon className="h-4 w-4" />
              System
              {mode === 'system' && (
                <div className="ml-auto w-2 h-2 bg-accent-primary rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
