import React from 'react';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { toggleTheme } from '../redux/slices/themeSlice';
import { motion } from 'framer-motion';

interface ThemeSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'toggle' | 'icon' | 'full-width';
  showLabels?: boolean;
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  size = 'md', 
  variant = 'button',
  showLabels = false,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.theme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (variant === 'toggle') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabels && (
          <span className="text-sm font-label text-[var(--color-text-secondary)]">
            Light
          </span>
        )}
        <button
          onClick={handleToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--color-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary-bg)]"
          role="switch"
          aria-checked={isDarkMode}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          <motion.span
            animate={{
              x: isDarkMode ? 20 : 2,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            className={`h-4 w-4 transform rounded-full transition flex items-center justify-center ${
              isDarkMode 
                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]' 
                : 'bg-[var(--color-primary-bg)] text-[var(--color-text-primary)]'
            }`}
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            {isDarkMode ? (
              <MoonIcon className="h-3 w-3" />
            ) : (
              <SunIcon className="h-3 w-3" />
            )}
          </motion.span>
        </button>
        {showLabels && (
          <span className="text-sm font-label text-[var(--color-text-secondary)]">
            Dark
          </span>
        )}
      </div>
    );
  }

  if (variant === 'full-width') {
    return (
      <div className={`w-full ${className}`}>
        <button
          onClick={handleToggle}
          className="relative w-full h-12 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-secondary-bg)] overflow-hidden group"
          role="switch"
          aria-checked={isDarkMode}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          style={{
            backgroundColor: isDarkMode 
              ? 'var(--color-accent-primary)' 
              : 'var(--color-accent-secondary)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Background gradient overlay */}
          <div 
            className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))'
                : 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))'
            }}
          />
          
          {/* Content container */}
          <div className="relative z-10 flex items-center justify-center h-full px-4">
            {/* Icon with animation */}
            <motion.div
              key={isDarkMode ? 'dark' : 'light'}
              initial={{ scale: 0.8, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center"
              style={{ color: 'var(--color-text-inverse)' }}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6 mr-3" />
              ) : (
                <MoonIcon className="h-6 w-6 mr-3" />
              )}
            </motion.div>
            
            {/* Text label */}
            <motion.span
              key={isDarkMode ? 'dark-text' : 'light-text'}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-inverse)' }}
            >
              {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            </motion.span>
          </div>
          
          {/* Animated border accent */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-text-inverse)',
              width: isDarkMode ? '100%' : '0%'
            }}
            animate={{
              width: isDarkMode ? '100%' : '0%'
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </button>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-tertiary-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary-bg)]`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <motion.div
          key={isDarkMode ? 'dark' : 'light'}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-[var(--color-text-primary)]"
        >
          {isDarkMode ? (
            <SunIcon className={iconSizes[size]} />
          ) : (
            <MoonIcon className={iconSizes[size]} />
          )}
        </motion.div>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`${className} inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary-bg)] ${
        isDarkMode
          ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-tertiary-bg)]'
          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-tertiary-bg)]'
      }`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={isDarkMode ? 'dark' : 'light'}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.2 }}
        className="mr-2"
      >
        {isDarkMode ? (
          <SunIcon className="h-4 w-4" />
        ) : (
          <MoonIcon className="h-4 w-4" />
        )}
      </motion.div>
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeSwitcher;
