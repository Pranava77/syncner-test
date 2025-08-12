import React from 'react';
import { LayersIcon } from '@radix-ui/react-icons';

interface LevelProgressData {
  level: number;
  totalStudents: number;
  studentsAtLevel: number;
  studentsCompletedLevel: number;
  completionPercentage: number;
}

interface OverallMetrics {
  totalStudents: number;
  averageLevelReached: number;
  overallCompletionRate: number;
}

interface LevelProgressChartProps {
  levelProgress: LevelProgressData[];
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
      <div className="bg-paperwhite/10 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trueturquoise"></div>
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
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-lg font-semibold flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <LayersIcon className="h-5 w-5 text-trueturquoise" />
          Level Progress Overview
        </h2>
        <div className="text-right">
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Total Students: {overallMetrics.totalStudents}
          </p>
          <p className="text-sm text-trueturquoise">
            Overall Completion: {overallMetrics.overallCompletionRate}%
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {levelProgress.length > 0 ? (
          levelProgress.map((levelData) => (
            <div 
              key={levelData.level} 
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border-subtle)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-trueturquoise/20 rounded-lg flex items-center justify-center">
                    <span className="text-trueturquoise font-bold text-sm">{levelData.level}</span>
                  </div>
                  <div>
                    <h3 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Level {levelData.level}
                    </h3>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {levelData.studentsCompletedLevel} of {levelData.totalStudents} students completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-trueturquoise">{levelData.completionPercentage}%</p>
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
                  className="bg-gradient-to-r from-trueturquoise to-teallight h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${levelData.completionPercentage}%` }}
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
                  className="text-4xl mb-4"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  📊
                </div>
            <p 
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No level progress data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelProgressChart; 