import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircledIcon, 
  ClockIcon, 
  PlayIcon,
  ReaderIcon,
  FileTextIcon,
  CodeIcon
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
}

const EnhancedLearningTimeline: React.FC<EnhancedLearningTimelineProps> = ({
  timeline
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

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'learn':
        return <ReaderIcon className="w-5 h-5" />;
      case 'test':
        return <FileTextIcon className="w-5 h-5" />;
      case 'exercise':
        return <CodeIcon className="w-5 h-5" />;
      default:
        return <ReaderIcon className="w-5 h-5" />;
    }
  };

  const formatTimeSpent = (seconds: number) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full">


      {/* Timeline Container */}
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div 
          className="absolute left-8 top-0 bottom-0 w-1"
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
              {/* Timeline Node */}
              <div className="flex items-start gap-6">
                {/* Left Side - Timeline Node */}
                <div className="flex-shrink-0 relative">
                  {/* Timeline Node */}
                  <div 
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg ${
                      level.status === 'completed' 
                        ? 'bg-green-100 border-green-500' 
                        : level.status === 'in-progress'
                        ? 'bg-yellow-100 border-yellow-500'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    {getLevelStatusIcon(level.status)}
                  </div>
                  
                  {/* Level Number Badge */}
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                  >
                    {level.level}
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="flex-1">
                  {/* Level Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: level.status === 'completed' 
                            ? 'var(--color-success-bg)' 
                            : level.status === 'in-progress'
                            ? 'var(--color-warning-bg)'
                            : 'var(--color-info-bg)',
                          color: level.status === 'completed' 
                            ? 'var(--color-success)' 
                            : level.status === 'in-progress'
                            ? 'var(--color-warning)'
                            : 'var(--color-info)'
                        }}
                      >
                        {level.status === 'completed' ? 'Completed' : 
                         level.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                    
                    <h3 
                      className="text-xl font-bold mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {level.courseName}
                    </h3>
                    
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {level.description}
                    </p>
                  </div>

                  {/* Progress Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Learn Section */}
                    <div 
                      className="p-4 rounded-xl border relative"
                      style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        borderColor: 'var(--color-border-subtle)'
                      }}
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-info-bg)',
                            color: 'var(--color-info)'
                          }}
                        >
                          {getSectionIcon('learn')}
                        </div>
                        <span 
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Learn
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: level.learn.completed ? 'var(--color-success)' : 'var(--color-warning)',
                            width: level.learn.completed ? '100%' : '50%'
                          }}
                        />
                      </div>
                      
                      {/* Status and Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Status
                          </span>
                          <span 
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: level.learn.completed 
                                ? 'var(--color-success-bg)' 
                                : 'var(--color-warning-bg)',
                              color: level.learn.completed 
                                ? 'var(--color-success)' 
                                : 'var(--color-warning)'
                            }}
                          >
                            {level.learn.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        
                        {level.learn.completed && (
                          <>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                Time Spent
                              </span>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {formatTimeSpent(level.learn.timeSpent)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                Completed
                              </span>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {formatDateTime(level.learn.endTime)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Test Section */}
                    <div 
                      className="p-4 rounded-xl border relative"
                      style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        borderColor: 'var(--color-border-subtle)'
                      }}
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-warning-bg)',
                            color: 'var(--color-warning)'
                          }}
                        >
                          {getSectionIcon('test')}
                        </div>
                        <span 
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Test
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: level.test.completed ? 'var(--color-success)' : 'var(--color-warning)',
                            width: level.test.completed ? '100%' : '50%'
                          }}
                        />
                      </div>
                      
                      {/* Status and Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Status
                          </span>
                          <span 
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: level.test.completed 
                                ? 'var(--color-success-bg)' 
                                : 'var(--color-warning-bg)',
                              color: level.test.completed 
                                ? 'var(--color-success)' 
                                : 'var(--color-warning)'
                            }}
                          >
                            {level.test.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        
                        {level.test.completed && (
                          <>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                Score
                              </span>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {level.test.score}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                Attempts
                              </span>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {level.test.attempts}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Exercise Section */}
                    <div 
                      className="p-4 rounded-xl border relative"
                      style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        borderColor: 'var(--color-border-subtle)'
                      }}
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-success-bg)',
                            color: 'var(--color-success)'
                          }}
                        >
                          {getSectionIcon('exercise')}
                        </div>
                        <span 
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Exercise
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: level.exercise.completed ? 'var(--color-success)' : 'var(--color-warning)',
                            width: level.exercise.completed ? '100%' : '50%'
                          }}
                        />
                      </div>
                      
                      {/* Status and Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Status
                          </span>
                          <span 
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: level.exercise.completed 
                                ? 'var(--color-success-bg)' 
                                : 'var(--color-warning-bg)',
                              color: level.exercise.completed 
                                ? 'var(--color-success)' 
                                : 'var(--color-warning)'
                            }}
                          >
                            {level.exercise.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        
                        {level.exercise.completed && (
                          <>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                Time Spent
                              </span>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {formatTimeSpent(level.exercise.timeSpent)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                Completed
                              </span>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {formatDateTime(level.exercise.endTime)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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
