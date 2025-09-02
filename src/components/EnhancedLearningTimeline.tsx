import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../redux/store';
import { selectLearningProgress } from '../redux/slices/learningJourneySlice';
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
  const learningProgress = useAppSelector(selectLearningProgress);

  // Merge timeline data with learning progress
  const mergedTimeline = timeline.map(level => {
    const progress = learningProgress.find(p => p.levelId === level.level.toString());
    if (progress) {
      return {
        ...level,
        learn: {
          ...level.learn,
          progress: progress.learnProgress || 0,
          completed: progress.learnProgress === 100
        },
        test: {
          ...level.test,
          progress: progress.testProgress || 0,
          score: progress.testProgress || 0,
          completed: progress.testProgress === 100
        },
        exercise: {
          ...level.exercise,
          progress: progress.exerciseProgress || 0,
          completed: progress.exerciseProgress === 100
        },
        status: progress.overallProgress === 100 ? 'completed' :
               progress.overallProgress > 0 ? 'in-progress' : 'not-started'
      };
    }
    return level;
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
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ReaderIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                    <span className="font-medium">Learn</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Progress: {level.learn.progress}%
                  </div>
                </div>

                {/* Test Section */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                    <span className="font-medium">Test</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Score: {level.test.score}%
                  </div>
                </div>

                {/* Exercise Section */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CodeIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                    <span className="font-medium">Exercise</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Progress: {level.exercise.progress}%
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