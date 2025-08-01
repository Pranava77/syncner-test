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
          <span className="ml-3 text-paperwhite">Loading level progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paperwhite/10 rounded-xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2">
          <LayersIcon className="h-5 w-5 text-trueturquoise" />
          Level Progress Overview
        </h2>
        <div className="text-right">
          <p className="text-sm text-teallight">Total Students: {overallMetrics.totalStudents}</p>
          <p className="text-sm text-trueturquoise">Overall Completion: {overallMetrics.overallCompletionRate}%</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {levelProgress.length > 0 ? (
          levelProgress.map((levelData) => (
            <div key={levelData.level} className="bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-trueturquoise/20 rounded-lg flex items-center justify-center">
                    <span className="text-trueturquoise font-bold text-sm">{levelData.level}</span>
                  </div>
                  <div>
                    <h3 className="text-paperwhite font-semibold">Level {levelData.level}</h3>
                    <p className="text-xs text-teallight">
                      {levelData.studentsCompletedLevel} of {levelData.totalStudents} students completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-trueturquoise">{levelData.completionPercentage}%</p>
                  <p className="text-xs text-teallight">
                    {levelData.studentsAtLevel} students reached this level
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-paperwhite/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-trueturquoise to-teallight h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${levelData.completionPercentage}%` }}
                ></div>
              </div>
              
              {/* Progress Details */}
              <div className="flex justify-between text-xs text-teallight mt-2">
                <span>0%</span>
                <span>{levelData.completionPercentage}% completed</span>
                <span>100%</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-paperwhite/30 text-4xl mb-4">📊</div>
            <p className="text-teallight">No level progress data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelProgressChart; 