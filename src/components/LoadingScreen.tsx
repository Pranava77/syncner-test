import React, { useState, useEffect } from 'react';
import logo from '../assets/syncner-logo.png';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      <motion.div
        className="min-h-screen flex items-center justify-center" 
        style={{ background: 'var(--brand-bg)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Logo */}
          <motion.div 
            className="mb-8"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="p-4 rounded-2xl inline-block mb-4" 
              style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))' }}
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.3 }}
            >
              <img src={logo} alt="Syncner Logo" className="h-16 w-16 object-contain" />
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold" 
              style={{ color: 'var(--brand-text)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Syncner
            </motion.h1>
            <motion.p 
              className="text-[var(--brand-primary)] text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Loading your experience...
            </motion.p>
          </motion.div>

          {/* Progress Bar */}
          {showProgress && (
            <motion.div 
              className="w-64 mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--brand-primary)' }}>
                <span>Loading</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--brand-bg-alt)' }}>
                <motion.div 
                  className="h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))', width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </motion.div>
          )}

          {/* Loading Message */}
          <motion.p 
            className="text-[var(--brand-primary)] text-sm mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            {message}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen; 