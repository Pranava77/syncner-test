import React, { ReactNode } from 'react';

interface ThemeTextProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse';
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  className?: string;
  style?: React.CSSProperties;
}

const ThemeText: React.FC<ThemeTextProps> = ({ 
  children, 
  variant = 'primary',
  as: Component = 'span',
  className = '',
  style = {} 
}) => {
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'var(--color-text-primary)';
      case 'secondary':
        return 'var(--color-text-secondary)';
      case 'tertiary':
        return 'var(--color-text-tertiary)';
      case 'muted':
        return 'var(--color-text-muted)';
      case 'inverse':
        return 'var(--color-text-inverse)';
      default:
        return 'var(--color-text-primary)';
    }
  };

  return (
    <Component 
      className={className}
      style={{
        color: getTextColor(),
        ...style
      }}
    >
      {children}
    </Component>
  );
};

export default ThemeText;
