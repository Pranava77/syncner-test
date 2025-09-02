import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchPortfolio, 
  selectPortfolio, 
  selectPortfolioLoading, 
  selectPortfolioError 
} from '../redux/slices/portfolioSlice';
import { useLevels } from '../hooks/useLevels';
import ErrorBoundary from './ErrorBoundary';
import { motion } from 'framer-motion';
import { StudentPortfolioData } from '../services/portfolioService';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  ClockIcon,
  CheckCircledIcon,
  Cross2Icon,
  GlobeIcon,
  FileTextIcon,
  ReaderIcon,
  PlayIcon
} from '@radix-ui/react-icons';

interface Task {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  completed: boolean;
  submissionLinks: string[];
  score?: number;
  attempts?: number;
  lastAttemptAt?: string | null;
  feedback?: string;
  status?: 'not-submitted' | 'submitted' | 'approved' | 'rejected';
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
  task: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl p-6 rounded-xl border"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-opacity-10"
          style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
        >
          <Cross2Icon className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
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
                className="text-sm p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-tertiary-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {task.content}
              </div>
            </div>
            {task.submissionLinks && task.submissionLinks.length > 0 && (
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {task.submissionLinks.length > 1 ? 'Submissions:' : 'Submission:'}
                </h4>
                <div className="flex flex-col gap-2">
                  {task.submissionLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                          backgroundColor: 'var(--color-accent-primary)',
                          color: 'var(--color-text-inverse)'
                        }}
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        {task.submissionLinks.length > 1 ? `View Submission #${index + 1}` : 'View Submission'}
                      </a>
                      <div 
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: task.status === 'approved' 
                            ? 'var(--color-success-bg)'
                            : task.status === 'submitted'
                            ? 'var(--color-warning-bg)'
                            : 'var(--color-error-bg)',
                          color: task.status === 'approved'
                            ? 'var(--color-success)'
                            : task.status === 'submitted'
                            ? 'var(--color-warning)'
                            : 'var(--color-error)'
                        }}
                      >
                        {task.status === 'approved' ? 'Approved' : 
                         task.status === 'submitted' ? 'Submitted' : 
                         'Not Submitted'}
                      </div>
                    </div>
                  ))}
                </div>
                {task.feedback && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Feedback:</h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {task.feedback}
                    </p>
                  </div>
                )}
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
  studentData?: StudentPortfolioData & {
    learningLevels: Array<{
      level: number;
      courseName: string;
      description: string;
      status: 'not-started' | 'in-progress' | 'completed';
      readFirst?: {
        brief?: string;
        whyLearn?: string;
        whereUsed?: string;
        customExample?: string;
      };
      difficulty: string;
      duration: string;
      estimatedHours: number;
      skills: string[];
      prerequisites: string[];
      learn: {
        completed: boolean;
        startTime: string | null;
        endTime: string | null;
        timeSpent: number;
        content: Array<Material>;
        title: string;
        status: string;
        materials: Array<Material>;
      };
      test: {
        completed: boolean;
        score: number;
        attempts: number;
        startTime: string | null;
        endTime: string | null;
        content: Array<{
          id: string;
          title: string;
          question: string;
          order: number;
        }>;
        title: string;
        status: string;
        questions: Array<{
          id: string;
          title: string;
          question: string;
          options: string[];
          answer?: string;
          order: number;
        }>;
      };
      exercise: {
        completed: boolean;
        startTime: string | null;
        endTime: string | null;
        timeSpent: number;
        content: Array<{
          id: string;
          title: string;
          description: string;
          content: string;
          order: number;
        }>;
        title: string;
        status: string;
        tasks: Array<Task>;
      };
    }>;
  };
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
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  // If studentData is provided, use that instead of fetching
  const data = studentData || portfolio;

  // Use the levels hook to get curriculum data
  const { levels: curriculumLevels, loading: curriculumLoading } = useLevels(data?.student?.careerTrack);

  useEffect(() => {
    // Only fetch if studentData is not provided
    if (!studentData) {
      dispatch(fetchPortfolio(studentId));
    }
  }, [dispatch, studentId, studentData]);

  // Merge portfolio data with curriculum data
  const mergedLevels = useMemo(() => {
    if (!data?.learningLevels || !curriculumLevels) return [];
    
    return data.learningLevels.map((portfolioLevel: { level: number }) => {
      // Find matching curriculum level
      const curriculumLevel = curriculumLevels.find((cl: { order: number }) => cl.order === portfolioLevel.level);
      
      if (!curriculumLevel) return portfolioLevel;

      // Merge the data, preferring portfolio data for progress/completion
      return {
        ...portfolioLevel,
        readFirst: curriculumLevel.readFirst,
        difficulty: curriculumLevel.difficulty,
        duration: curriculumLevel.duration,
        estimatedHours: curriculumLevel.estimatedHours,
        skills: curriculumLevel.skills,
        prerequisites: curriculumLevel.prerequisites
      };
    });
  }, [data?.learningLevels, curriculumLevels]);

  if ((!studentData && loading) || curriculumLoading) {
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
      {/* Student Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {data.student.name}
            </h1>
            {data.student.readyToHire && (
              <div 
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{ 
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)'
                }}
              >
                Ready to Hire
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div>{data.student.college || 'Not specified'}</div>
            <div>•</div>
            <div>{data.student.careerTrack} Track</div>
            <div>•</div>
            <div>Duration: {data.student.duration}</div>
          </div>
        </div>
        <div className="text-sm text-right" style={{ color: 'var(--color-text-tertiary)' }}>
          Last verified: {new Date(data.student.createdAt).toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Skills Tags */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {['SQL', 'Python', 'EDA', 'Data Viz', 'Communication'].map((skill) => (
            <div
              key={skill}
              className="px-3 py-1 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Introduction */}
      <div 
        className="mb-8 p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Introduction
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {data.student.introduction || 'Full-stack developer in the making, passionate about solving real business problems with code. Skilled in SQL, Python, and data visualization, and ready to contribute to impactful projects.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Progress</div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
            >
              <CheckCircledIcon 
                className="w-5 h-5" 
                style={{ color: 'var(--color-accent-primary)' }} 
              />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
            {data.progress.percentage}%
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {data.progress.completedLevels} of {data.progress.totalLevels} levels
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Attendance</div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
            >
              <ClockIcon 
                className="w-5 h-5" 
                style={{ color: 'var(--color-accent-primary)' }} 
              />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
            {data.attendance.percentage}%
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {data.attendance.presentDays} of {data.attendance.totalDays} days
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Leaderboard</div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
            >
              <GlobeIcon 
                className="w-5 h-5" 
                style={{ color: 'var(--color-accent-primary)' }} 
              />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
            {data.leaderboard.score} pts
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Rank: {data.leaderboard.rank || 'N/A'}
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Portfolio
        </h2>
        <div className="space-y-4">
          {mergedLevels.map((level: any) => (
            <div 
              key={level.level}
              className="border rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              {/* Level Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ 
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    {level.level.toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {level.courseName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <div>MCQ {level.test.score}%</div>
                      <div>•</div>
                      <div>Tasks {level.exercise.tasks.filter((t: Task) => t.completed).length}/{level.exercise.tasks.length}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="px-3 py-1 rounded-full text-sm"
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
                  {expandedLevel === level.level ? (
                    <ChevronDownIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                  )}
                </div>
              </div>

              {/* Level Details */}
              {expandedLevel === level.level && (
                <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Learn Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ReaderIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Learning Materials
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {level.learn.materials.map((material: Material) => (
                          <div 
                            key={material.id}
                            className="p-3 rounded-lg border"
                            style={{ 
                              backgroundColor: 'var(--color-tertiary-bg)',
                              borderColor: 'var(--color-border)'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {material.title}
                              </div>
                              {material.completed && (
                                <CheckCircledIcon 
                                  className="w-4 h-4" 
                                  style={{ color: 'var(--color-success)' }} 
                                />
                              )}
                            </div>
                            {material.externalLink && (
                              <a
                                href={material.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 mt-1 text-xs"
                                style={{ color: 'var(--color-accent-primary)' }}
                              >
                                <ExternalLinkIcon className="w-3 h-3" />
                                View Resource
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileTextIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Assessment
                        </h4>
                      </div>
                      <div 
                        className="p-4 rounded-lg border"
                        style={{ 
                          backgroundColor: 'var(--color-tertiary-bg)',
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            MCQ Test
                          </div>
                          {level.test.completed && (
                            <CheckCircledIcon 
                              className="w-4 h-4" 
                              style={{ color: 'var(--color-success)' }} 
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>Score:</span>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {level.test.score}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>Attempts:</span>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {level.test.attempts}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exercise Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <PlayIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Practice Exercise
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {level.exercise.tasks.map((task: Task) => (
                          <div 
                            key={task.id}
                            className="p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:border-accent-primary"
                            style={{ 
                              backgroundColor: 'var(--color-tertiary-bg)',
                              borderColor: 'var(--color-border)'
                            }}
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {task.title}
                              </div>
                              {task.status && (
                                <div 
                                  className="px-2 py-0.5 rounded-full text-xs"
                                  style={{
                                    backgroundColor: task.status === 'approved' 
                                      ? 'var(--color-success-bg)'
                                      : task.status === 'submitted'
                                      ? 'var(--color-warning-bg)'
                                      : 'var(--color-error-bg)',
                                    color: task.status === 'approved'
                                      ? 'var(--color-success)'
                                      : task.status === 'submitted'
                                      ? 'var(--color-warning)'
                                      : 'var(--color-error)'
                                  }}
                                >
                                  {task.status === 'approved' ? 'Approved' : 
                                   task.status === 'submitted' ? 'Submitted' : 
                                   'Not Submitted'}
                                </div>
                              )}
                            </div>
                            {task.submissionLinks && task.submissionLinks.length > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                {task.submissionLinks.map((link: string, index: number) => (
                                  <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs"
                                    style={{ color: 'var(--color-accent-primary)' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLinkIcon className="w-3 h-3" />
                                    {task.submissionLinks.length > 1 ? `Submission #${index + 1}` : 'View Submission'}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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