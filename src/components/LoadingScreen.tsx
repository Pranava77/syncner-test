import React, { useState, useEffect } from 'react';
import logo from '../assets/syncner-logo.png';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progressDuration?: number; // in milliseconds
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  showProgress = true,
  progressDuration = 2000 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stop at 90% until loading is complete
          }
          return prev + 10;
        });
      }, progressDuration / 10);

      return () => clearInterval(interval);
    }
  }, [showProgress, progressDuration]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-block mb-4">
            <img src={logo} alt="Syncner Logo" className="h-20 w-20 object-contain" />
          </div>
          <h1 
            className="text-3xl mb-2 font-heading" 
            style={{ 
              fontFamily: 'Amatic SC, FK Grotesk, Inter, Helvetica Neue, Arial, sans-serif',
              color: 'var(--color-text-primary)'
            }}
          >
            Syncner
          </h1>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-64 mx-auto mb-4">
            <div 
              className="w-full rounded-full h-2"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              <div 
                className="bg-trueturquoise h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tagline below progress bar */}
        <p 
          className="text-sm font-label"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Syncing your success...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 