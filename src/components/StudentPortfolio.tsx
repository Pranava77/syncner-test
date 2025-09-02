import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchPortfolio, 
  selectPortfolio, 
  selectPortfolioLoading, 
  selectPortfolioError 
} from '../redux/slices/portfolioSlice';
import ErrorBoundary from './ErrorBoundary';
import { motion } from 'framer-motion';
import { StudentPortfolioData } from '../services/portfolioService';

interface Task {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  completed: boolean;
  submissionLink?: string;
}

interface Material {
  id: string;
  title: string;
  description: string;
  externalLink?: string;
  order: number;
  completed?: boolean;
  accessedAt?: string | null;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    title: string;
    description: string;
    content: string;
    submissionLink?: string;
  } | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl p-6 rounded-xl"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Modal content */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-opacity-10"
          style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mt-2">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {task.title}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Description:</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {task.description}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Instructions:</h4>
              <div 
                className="text-sm p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-tertiary-bg)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {task.content}
              </div>
            </div>
            {task.submissionLink && (
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Submission Link:</h4>
                <a 
                  href={task.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-lg inline-block"
                  style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'white'
                  }}
                >
                  View Submission
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StudentPortfolioProps {
  studentId?: string;
  studentData?: StudentPortfolioData;
}

const StudentPortfolioContent: React.FC<StudentPortfolioProps> = ({ 
  studentId = 'me',
  studentData 
}) => {
  const dispatch = useAppDispatch();
  const portfolio = useAppSelector(selectPortfolio);
  const loading = useAppSelector(selectPortfolioLoading);
  const error = useAppSelector(selectPortfolioError);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // If studentData is provided, use that instead of fetching
  const data = studentData || portfolio;

  useEffect(() => {
    // Only fetch if studentData is not provided
    if (!studentData) {
      dispatch(fetchPortfolio(studentId));
    }
  }, [dispatch, studentId, studentData]);

  if (!studentData && loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ color: 'var(--color-accent-primary)' }}></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Loading Portfolio...
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Fetching student portfolio data
          </p>
        </div>
      </div>
    );
  }

  if (!studentData && error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-error)' }}>
            Error Loading Portfolio
          </h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={() => dispatch(fetchPortfolio(studentId))}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              color: 'white'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Portfolio Data
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Portfolio data not available for this student
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Student Info Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {data.student.name}'s Portfolio
          </h1>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {data.student.careerTrack} Track
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Progress</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
              {data.progress.percentage}%
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {data.progress.completedLevels} of {data.progress.totalLevels} levels
            </div>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Attendance</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
              {data.attendance.percentage}%
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {data.attendance.presentDays} of {data.attendance.totalDays} days
            </div>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Leaderboard</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
              {data.leaderboard.score} pts
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Rank: {data.leaderboard.rank || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Levels Section */}
      <div className="space-y-6">
        {data.learningLevels.map((level) => (
          <div 
            key={level.level}
            className="border rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Level {level.level}: {level.courseName}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {level.description}
                  </p>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: level.status === 'completed' 
                      ? 'var(--color-success-bg)' 
                      : level.status === 'in-progress'
                      ? 'var(--color-warning-bg)'
                      : 'var(--color-error-bg)',
                    color: level.status === 'completed'
                      ? 'var(--color-success)'
                      : level.status === 'in-progress'
                      ? 'var(--color-warning)'
                      : 'var(--color-error)'
                  }}
                >
                  {level.status}
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Learn Section */}
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Learning Materials
                </h4>
                <div className="space-y-2">
                  {level.learn.materials.map((material: Material) => (
                    <div 
                      key={material.id}
                      className="p-2 rounded border"
                      style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                    >
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {material.title}
                      </div>
                      {material.completed && (
                        <div className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Section */}
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Assessment
                </h4>
                <div className="p-4 rounded border" style={{ backgroundColor: 'var(--color-tertiary-bg)' }}>
                  <div className="text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Score: {level.test.score}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Attempts: {level.test.attempts}
                  </div>
                </div>
              </div>

              {/* Exercise Section */}
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Practice Exercise
                </h4>
                <div className="space-y-2">
                  {level.exercise.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-2 rounded border cursor-pointer hover:border-accent-primary"
                      style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {task.title}
                      </div>
                      {task.status && (
                        <div 
                          className="text-xs mt-1"
                          style={{ 
                            color: task.status === 'approved' 
                              ? 'var(--color-success)'
                              : task.status === 'submitted'
                              ? 'var(--color-warning)'
                              : 'var(--color-error)'
                          }}
                        >
                          {task.status === 'approved' ? '✓ Approved' : 
                           task.status === 'submitted' ? '⏳ Submitted' : 
                           '❌ Not Submitted'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TaskModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </div>
  );
};

const StudentPortfolio: React.FC<StudentPortfolioProps> = (props) => {
  return (
    <ErrorBoundary>
      <StudentPortfolioContent {...props} />
    </ErrorBoundary>
  );
};

export default StudentPortfolio;