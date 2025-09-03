import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircledIcon, 
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
    materials: {
      id: string;
      title: string;
      description: string;
      content: string;
      completed: boolean;
      accessedAt: string | null;
    }[];
    progress: number;
  };
  test: {
    completed: boolean;
    score: number;
    attempts: number;
    startTime: string | null;
    endTime: string | null;
    title: string;
    status: string;
    questions: {
      id: string;
      title: string;
      question: string;
      options: string[];
      answer: string;
      answered: boolean;
      correct: boolean;
    }[];
    progress: number;
  };
  exercise: {
    completed: boolean;
    startTime: string | null;
    endTime: string | null;
    timeSpent: number;
    title: string;
    status: string;
    tasks: {
      id: string;
      title: string;
      description: string;
      content: string;
      completed: boolean;
      submissionLink?: string;
    }[];
    progress: number;
  };
}

interface EnhancedLearningTimelineProps {
  timeline: TimelineLevel[];
}

const EnhancedLearningTimeline: React.FC<EnhancedLearningTimelineProps> = ({
  timeline
}) => {
  // Note: We're not using Redux learning progress here as the timeline data
  // from the staff route already contains the most up-to-date progress information

  // Use timeline data as-is since it already contains the most up-to-date progress information
  // The staff route provides complete data, so we don't need to merge with Redux state
  const mergedTimeline = timeline.map(level => {
    // Ensure all required fields are present with proper defaults
    return {
      ...level,
      learn: {
        completed: level.learn?.completed || false,
        startTime: level.learn?.startTime || null,
        endTime: level.learn?.endTime || null,
        timeSpent: level.learn?.timeSpent || 0,
        title: level.learn?.title || 'Learning Materials',
        status: level.learn?.status || 'not-started',
        materials: level.learn?.materials || [],
        progress: level.learn?.completed ? 100 : 0
      },
      test: {
        completed: level.test?.completed || false,
        score: level.test?.score || 0,
        attempts: level.test?.attempts || 0,
        startTime: level.test?.startTime || null,
        endTime: level.test?.endTime || null,
        title: level.test?.title || 'Assessment',
        status: level.test?.status || 'not-started',
        questions: level.test?.questions || [],
        progress: level.test?.completed ? 100 : level.test?.score || 0
      },
      exercise: {
        completed: level.exercise?.completed || false,
        startTime: level.exercise?.startTime || null,
        endTime: level.exercise?.endTime || null,
        timeSpent: level.exercise?.timeSpent || 0,
        title: level.exercise?.title || 'Practice Exercise',
        status: level.exercise?.status || 'not-started',
        tasks: level.exercise?.tasks || [],
        progress: level.exercise?.completed ? 100 : 
          level.exercise?.tasks?.length > 0 ? 
            Math.round((level.exercise.tasks.filter((t: any) => t.completed).length / level.exercise.tasks.length) * 100) : 0
      }
    };
  });

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
          {mergedTimeline.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Level Header */}
              <div className="flex items-center gap-6">
                {/* Status Icon */}
                <div 
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg ${
                    level.status === 'completed' 
                      ? 'bg-green-100 border-green-500' 
                      : level.status === 'in-progress'
                      ? 'bg-yellow-100 border-yellow-500'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {level.status === 'completed' ? (
                    <CheckCircledIcon className="w-6 h-6 text-green-500" />
                  ) : level.status === 'in-progress' ? (
                    <div className="w-6 h-6 rounded-full border-2 border-yellow-500 bg-yellow-100" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />
                  )}
                </div>

                {/* Level Info */}
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {level.courseName}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {level.description}
                  </p>
                </div>
              </div>

              {/* Section Progress */}
              <div className="mt-4 ml-20 grid grid-cols-3 gap-4">
                {/* Learn Section */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <ReaderIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Learn</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{level.learn.progress}%</span>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <div 
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${level.learn.progress}%`,
                          backgroundColor: level.learn.completed ? 'var(--color-success)' : 'var(--color-accent-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Time Information */}
                  {level.learn.startTime && (
                    <div className="space-y-1">
                      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        <span className="font-medium">Started:</span> {new Date(level.learn.startTime).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {level.learn.endTime && (
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="font-medium">Completed:</span> {new Date(level.learn.endTime).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                      {level.learn.timeSpent > 0 && (
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="font-medium">Time Spent:</span> {Math.floor(level.learn.timeSpent / 60)}m {level.learn.timeSpent % 60}s
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Test Section */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileTextIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Test</span>
                  </div>
                  
                  {/* Score Display */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Score</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{level.test.score}%</span>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <div 
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${level.test.score}%`,
                          backgroundColor: level.test.completed ? 'var(--color-success)' : 'var(--color-accent-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Test Information */}
                  {level.test.startTime && (
                    <div className="space-y-1">
                      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        <span className="font-medium">Attempts:</span> {level.test.attempts}
                      </div>
                      {level.test.endTime && (
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="font-medium">Last Attempt:</span> {new Date(level.test.endTime).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Exercise Section */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CodeIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Exercise</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{level.exercise.progress}%</span>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <div 
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${level.exercise.progress}%`,
                          backgroundColor: level.exercise.completed ? 'var(--color-success)' : 'var(--color-accent-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Exercise Information */}
                  {level.exercise.startTime && (
                    <div className="space-y-1">
                      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        <span className="font-medium">Tasks:</span> {level.exercise.tasks.filter((t: any) => t.completed).length}/{level.exercise.tasks.length} completed
                      </div>
                      {level.exercise.endTime && (
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="font-medium">Last Activity:</span> {new Date(level.exercise.endTime).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  )}
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