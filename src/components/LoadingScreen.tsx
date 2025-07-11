import React, { useState, useEffect } from 'react';
import logo from '../assets/syncner-logo.png';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progressDuration?: number; // in milliseconds
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
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
    <div className="min-h-screen flex items-center justify-center bg-offblack p-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="bg-trueturquoise p-4 rounded-2xl inline-block mb-4">
            <img src={logo} alt="Syncner Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-paperwhite mb-2">Syncner</h1>
          <p className="text-teallight text-sm">Loading your experience...</p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-xs text-teallight mb-2">
              <span>Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-paperwhite/20 rounded-full h-2">
              <div 
                className="bg-trueturquoise h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading Message */}
        <p className="text-teallight text-sm mt-4">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 