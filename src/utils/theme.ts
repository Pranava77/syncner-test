import { ThemeMode } from '../redux/slices/themeSlice';

// Color palette definitions
export const themeColors = {
  light: {
    // Background colors
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceSecondary: '#f1f5f9',
    surfaceTertiary: '#e2e8f0',
    
    // Text colors
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    
    // Brand colors (keep existing trueturquoise and teallight)
    primary: '#00d4aa', // trueturquoise
    primaryLight: '#00b894',
    primaryDark: '#00a085',
    secondary: '#00b4d8', // teallight
    secondaryLight: '#0096c7',
    secondaryDark: '#0077b6',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Border colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
    
    // Special colors for existing components
    paperwhite: '#ffffff',
    offblack: '#f8fafc',
    rust: '#ef4444',
  },
  dark: {
    // Background colors (keep existing dark theme)
    background: '#000000',
    surface: '#111827', // offblack
    surfaceSecondary: '#1f2937',
    surfaceTertiary: '#374151',
    
    // Text colors (keep existing)
    textPrimary: '#f8fafc', // paperwhite
    textSecondary: '#cbd5e1', // teallight
    textTertiary: '#94a3b8',
    textMuted: '#64748b',
    
    // Brand colors (same as light)
    primary: '#00d4aa', // trueturquoise
    primaryLight: '#00b894',
    primaryDark: '#00a085',
    secondary: '#00b4d8', // teallight
    secondaryLight: '#0096c7',
    secondaryDark: '#0077b6',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Border colors
    border: '#374151',
    borderLight: '#4b5563',
    borderDark: '#1f2937',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.5)',
    shadowLight: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.7)',
    
    // Special colors for existing components
    paperwhite: '#f8fafc',
    offblack: '#111827',
    rust: '#ef4444',
  },
};

// CSS custom properties for dynamic theming
export const generateThemeCSS = (mode: ThemeMode): string => {
  const colors = themeColors[mode];
  
  return `
    :root[data-theme="${mode}"] {
      /* Background colors */
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --color-surface-secondary: ${colors.surfaceSecondary};
      --color-surface-tertiary: ${colors.surfaceTertiary};
      
      /* Text colors */
      --color-text-primary: ${colors.textPrimary};
      --color-text-secondary: ${colors.textSecondary};
      --color-text-tertiary: ${colors.textTertiary};
      --color-text-muted: ${colors.textMuted};
      
      /* Brand colors */
      --color-primary: ${colors.primary};
      --color-primary-light: ${colors.primaryLight};
      --color-primary-dark: ${colors.primaryDark};
      --color-secondary: ${colors.secondary};
      --color-secondary-light: ${colors.secondaryLight};
      --color-secondary-dark: ${colors.secondaryDark};
      
      /* Status colors */
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
      --color-info: ${colors.info};
      
      /* Border colors */
      --color-border: ${colors.border};
      --color-border-light: ${colors.borderLight};
      --color-border-dark: ${colors.borderDark};
      
      /* Shadow colors */
      --color-shadow: ${colors.shadow};
      --color-shadow-light: ${colors.shadowLight};
      --color-shadow-dark: ${colors.shadowDark};
      
      /* Legacy color support */
      --color-paperwhite: ${colors.paperwhite};
      --color-offblack: ${colors.offblack};
      --color-trueturquoise: ${colors.primary};
      --color-teallight: ${colors.secondary};
      --color-rust: ${colors.rust};
    }
  `;
};

// Utility functions
export const getThemeColor = (mode: ThemeMode, colorKey: keyof typeof themeColors.light) => {
  return themeColors[mode][colorKey];
};

export const getCurrentThemeColors = (mode: ThemeMode) => {
  return themeColors[mode];
};

// Theme transition utilities
export const applyThemeTransition = () => {
  document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
};

export const removeThemeTransition = () => {
  document.documentElement.style.transition = '';
};

// Apply theme to DOM
export const applyThemeToDOM = (mode: ThemeMode) => {
  const root = document.documentElement;
  
  // Set data attribute for CSS targeting
  root.setAttribute('data-theme', mode);
  
  // Apply background color
  root.style.backgroundColor = themeColors[mode].background;
  
  // Apply text color
  root.style.color = themeColors[mode].textPrimary;
};
