/**
 * Theme utility functions for consistent theming across components
 */

export const getThemeStyles = {
  // Main container styles
  primaryContainer: {
    backgroundColor: 'var(--color-primary-bg)',
  },
  
  secondaryContainer: {
    backgroundColor: 'var(--color-secondary-bg)',
  },
  
  surface: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-md)',
  },
  
  elevatedSurface: {
    backgroundColor: 'var(--color-surface-elevated)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
  },
  
  // Text styles
  primaryText: {
    color: 'var(--color-text-primary)',
  },
  
  secondaryText: {
    color: 'var(--color-text-secondary)',
  },
  
  tertiaryText: {
    color: 'var(--color-text-tertiary)',
  },
  
  mutedText: {
    color: 'var(--color-text-muted)',
  },
  
  // Interactive elements
  border: {
    borderColor: 'var(--color-border)',
  },
  
  subtleBorder: {
    borderColor: 'var(--color-border-subtle)',
  },
  
  // Common combinations
  card: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-md)',
  },
  
  modal: {
    backgroundColor: 'var(--color-surface-elevated)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
  },
  
  page: {
    backgroundColor: 'var(--color-primary-bg)',
  },
  
  sidebar: {
    backgroundColor: 'var(--color-secondary-bg)',
    borderColor: 'var(--color-border)',
  },
};

export const getTextClassNames = (variant: 'primary' | 'secondary' | 'tertiary' | 'muted' = 'primary') => {
  const baseClasses = '';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} [color:var(--color-text-primary)]`;
    case 'secondary':
      return `${baseClasses} [color:var(--color-text-secondary)]`;
    case 'tertiary':
      return `${baseClasses} [color:var(--color-text-tertiary)]`;
    case 'muted':
      return `${baseClasses} [color:var(--color-text-muted)]`;
    default:
      return `${baseClasses} [color:var(--color-text-primary)]`;
  }
};

export const getBackgroundClassNames = (variant: 'primary' | 'secondary' | 'surface' | 'elevated' = 'primary') => {
  switch (variant) {
    case 'primary':
      return '[background-color:var(--color-primary-bg)]';
    case 'secondary':
      return '[background-color:var(--color-secondary-bg)]';
    case 'surface':
      return '[background-color:var(--color-surface)]';
    case 'elevated':
      return '[background-color:var(--color-surface-elevated)]';
    default:
      return '[background-color:var(--color-primary-bg)]';
  }
};

// Common class name replacements for quick theming
export const themeClassReplacements = {
  'bg-black': '[background-color:var(--color-primary-bg)]',
  'bg-offblack': '[background-color:var(--color-primary-bg)]',
  'bg-white': '[background-color:var(--color-surface)]',
  'text-white': '[color:var(--color-text-primary)]',
  'text-paperwhite': '[color:var(--color-text-primary)]',
  'text-teallight': '[color:var(--color-text-tertiary)]',
  'text-gray-900': '[color:var(--color-text-primary)]',
  'text-gray-800': '[color:var(--color-text-secondary)]',
  'text-gray-600': '[color:var(--color-text-tertiary)]',
  'text-gray-400': '[color:var(--color-text-muted)]',
  'border-gray-200': '[border-color:var(--color-border)]',
  'border-gray-700': '[border-color:var(--color-border)]',
  'border-paperwhite/20': '[border-color:var(--color-border)]',
};
