import React from 'react';
import syncnerLogo from '../assets/syncner-logo.png';
import { motion } from 'framer-motion';

interface LevelProgress {
  level: number;
  completionPercentage: number;
  studentsAtLevel: number;
}

interface OverallMetrics {
  totalStudents: number;
  averageCompletion: number;
  totalLevels: number;
}

interface LevelProgressChartProps {
  levelProgress: LevelProgress[];
  overallMetrics: OverallMetrics;
  loading?: boolean;
}

const LevelProgressChart: React.FC<LevelProgressChartProps> = ({
  levelProgress,
  overallMetrics,
  loading = false
}) => {
  if (loading) {
    return (
      <div 
        className="rounded-xl shadow-sm p-8"
        style={{
          backgroundColor: 'var(--color-tertiary-bg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div className="flex items-center justify-center py-12">
          <motion.img
            src={syncnerLogo}
            alt="Syncner Logo"
            className="w-8 h-8"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <span 
            className="ml-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Loading level progress...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl shadow-sm p-8"
      style={{
        backgroundColor: 'var(--color-tertiary-bg)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Level Progress Overview
        </h3>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Track student progress across all levels
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div 
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            {overallMetrics.totalStudents}
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Total Students
          </div>
        </div>
        
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div 
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            {overallMetrics.averageCompletion}%
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Avg. Completion
          </div>
        </div>
        
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div 
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            {overallMetrics.totalLevels}
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Total Levels
          </div>
        </div>
      </div>

      {/* Level Progress Bars */}
      <div className="space-y-6">
        {levelProgress.length > 0 ? (
          levelProgress.map((levelData) => (
            <div 
              key={levelData.level}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    {levelData.level}
                  </div>
                  <div>
                    <h4 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Level {levelData.level}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-accent-primary)' }}
                  >
                    {levelData.completionPercentage}%
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {levelData.studentsAtLevel} students reached this level
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full h-3 overflow-hidden"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div 
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    background: 'linear-gradient(90deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                    width: `${levelData.completionPercentage}%` 
                  }}
                ></div>
              </div>
              
              {/* Progress Details */}
              <div 
                className="flex justify-between text-xs mt-2"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <span>0%</span>
                <span>{levelData.completionPercentage}% completed</span>
                <span>100%</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div 
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No level progress data available
            </div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Level progress will appear here once students start completing levels.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelProgressChart; 