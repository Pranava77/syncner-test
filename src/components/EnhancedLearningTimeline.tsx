import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircledIcon, 
  ClockIcon, 
  PlayIcon,
  CalendarIcon
} from '@radix-ui/react-icons';

interface TimelineLevel {
  level: number;
  courseName: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  learn: {
    completed: boolean;
    startTime: string | null;
    endTime: string | null;
    timeSpent: number;
    title: string;
    status: string;
    materials: any[];
  };
  test: {
    completed: boolean;
    score: number;
    attempts: number;
    startTime: string | null;
    endTime: string | null;
    title: string;
    status: string;
    questions: any[];
  };
  exercise: {
    completed: boolean;
    startTime: string | null;
    endTime: string | null;
    timeSpent: number;
    title: string;
    status: string;
    tasks: any[];
  };
}

interface EnhancedLearningTimelineProps {
  timeline: TimelineLevel[];
  fromDate?: string;
  toDate?: string;
  onDateChange?: (from: string, to: string) => void;
}

const EnhancedLearningTimeline: React.FC<EnhancedLearningTimelineProps> = ({
  timeline,
  fromDate,
  toDate,
  onDateChange
}) => {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <PlayIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLevelStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <div className="w-6 h-6 rounded-full border-2 border-yellow-500 bg-yellow-100"></div>;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--color-success)';
      case 'in-progress':
        return 'var(--color-warning)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="w-full">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Learning Timeline
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              From:
            </label>
            <input
              type="date"
              value={fromDate || ''}
              onChange={(e) => onDateChange?.(e.target.value, toDate || '')}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-input-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              To:
            </label>
            <input
              type="date"
              value={toDate || ''}
              onChange={(e) => onDateChange?.(fromDate || '', e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-input-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div 
          className="absolute left-8 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: 'var(--color-border)' }}
        ></div>

        {/* Timeline Items */}
        <div className="space-y-8">
          {timeline.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Level Header */}
              <div className="flex items-center gap-4 mb-4">
                {/* Status Icon */}
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'var(--color-border)' }}></div>
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
                    {getLevelStatusIcon(level.status)}
                  </div>
                </div>
                
                {/* Level Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Level {level.level}: {level.courseName}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {level.description}
                  </p>
                </div>
              </div>

              {/* Sections */}
              <div className="ml-20 space-y-4">
                {/* Learn Section */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(level.learn.status)}
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {level.learn.title}
                    </span>
                  </div>
                  <div className="text-sm text-right" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatDateTime(level.learn.startTime)} -- {formatDateTime(level.learn.endTime)}
                  </div>
                </div>

                {/* Test Section */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(level.test.status)}
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {level.test.title}
                      {level.test.score > 0 && ` (${level.test.score}% - ${level.test.attempts} attempts)`}
                    </span>
                  </div>
                  <div className="text-sm text-right" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatDateTime(level.test.startTime)} -- {formatDateTime(level.test.endTime)}
                  </div>
                </div>

                {/* Exercise Section */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(level.exercise.status)}
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {level.exercise.title}
                    </span>
                  </div>
                  <div className="text-sm text-right" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatDateTime(level.exercise.startTime)} -- {formatDateTime(level.exercise.endTime)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLearningTimeline;
