import React, { ReactNode } from 'react';

interface ThemeContainerProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'surface' | 'elevated' | 'accent';
  className?: string;
  style?: React.CSSProperties;
}

const ThemeContainer: React.FC<ThemeContainerProps> = ({ 
  children, 
  variant = 'primary',
  className = '',
  style = {} 
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return 'var(--color-primary-bg)';
      case 'secondary':
        return 'var(--color-secondary-bg)';
      case 'surface':
        return 'var(--color-surface)';
      case 'elevated':
        return 'var(--color-surface-elevated)';
      case 'accent':
        return 'var(--color-accent-tertiary)';
      default:
        return 'var(--color-primary-bg)';
    }
  };

  return (
    <div 
      className={className}
      style={{
        backgroundColor: getBackgroundColor(),
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ThemeContainer;
