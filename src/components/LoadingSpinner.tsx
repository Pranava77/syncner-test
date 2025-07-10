import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'blue' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    white: 'border-white',
    blue: 'border-[var(--brand-primary)]',
    gray: 'border-[var(--brand-text)]',
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

export default LoadingSpinner; 