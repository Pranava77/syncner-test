import React from 'react';
import { DailyActivity } from '../types/staff';

interface DailyActivityChartProps {
  dailyActivity: DailyActivity[];
}

const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ dailyActivity }) => {
  // Get max minutes for scaling
  const maxMinutes = Math.max(...dailyActivity.map(day => day.totalMinutes), 60);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Daily Learning Activity
        </h3>
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Last 30 days
        </div>
      </div>

      <div className="grid grid-cols-30 gap-1">
        {dailyActivity.map((day, index) => {
          const height = (day.totalMinutes / maxMinutes) * 100;
          const date = new Date(day.date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={day.date}
              className="relative group"
              title={`${date.toLocaleDateString()}: ${day.totalMinutes} minutes`}
            >
              {/* Activity bar */}
              <div
                className="w-full rounded-t transition-all duration-200 group-hover:opacity-80"
                style={{
                  height: `${Math.max(height, 5)}%`,
                  minHeight: '4px',
                  backgroundColor: day.isPresent
                    ? day.totalMinutes > 0
                      ? 'var(--color-success)'
                      : 'var(--color-warning)'
                    : 'var(--color-border)',
                  border: isToday ? '2px solid var(--color-accent-primary)' : undefined
                }}
              />

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10"
                   style={{
                     backgroundColor: 'var(--color-surface)',
                     color: 'var(--color-text-primary)',
                     border: '1px solid var(--color-border)'
                   }}>
                <div className="font-medium">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {day.totalMinutes} minutes
                </div>
                {day.activities.length > 0 && (
                  <div className="mt-1 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {day.activities.slice(0, 2).join(', ')}
                    {day.activities.length > 2 && '...'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-success)' }} />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-warning)' }} />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};

export default DailyActivityChart;
