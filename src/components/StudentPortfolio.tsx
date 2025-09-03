import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchPortfolio, 
  selectPortfolio, 
  selectPortfolioLoading, 
  selectPortfolioError 
} from '../redux/slices/portfolioSlice';
// Removed useStudentLevels - portfolio API already has all the data we need
import ErrorBoundary from './ErrorBoundary';
import { motion } from 'framer-motion';
import { StudentPortfolioData } from '../services/portfolioService';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  CheckCircledIcon,
  Cross2Icon,
  Share1Icon
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
                            : 'var(--color-error-bg)',
                          color: task.status === 'approved'
                            ? 'var(--color-success)'
                            : 'var(--color-error)'
                        }}
                      >
                        {task.status === 'approved' ? 'Approved' : 'Not Submitted'}
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

// Function to generate track-specific introductions
const getTrackSpecificIntroduction = (careerTrack: string): string => {
  const trackIntroductions = {
    'full-stack': `Full-stack developer in the making, passionate about solving real business problems with code. Skilled in modern web technologies including React, Node.js, and databases, ready to contribute to impactful projects that bridge the gap between frontend and backend development.`,
    'data-science': `Data science enthusiast with a passion for extracting meaningful insights from complex datasets. Skilled in statistical analysis, machine learning, and data visualization using Python, R, and SQL. Ready to drive data-driven decision making in real-world applications.`,
    'ai-ml': `AI/ML practitioner focused on building intelligent systems that can learn and adapt. Passionate about developing machine learning models and AI solutions using Python, TensorFlow, and PyTorch. Ready to solve complex problems and improve human experiences through artificial intelligence.`,
    'ui-ux': `UI/UX designer with a keen eye for creating intuitive and engaging user experiences. Passionate about understanding user needs and translating them into beautiful, functional designs using Figma, Adobe Creative Suite, and modern design principles. Ready to make technology more accessible and enjoyable.`
  };

  return trackIntroductions[careerTrack as keyof typeof trackIntroductions] || 
    `Passionate ${careerTrack.replace('-', ' ')} professional in the making, dedicated to continuous learning and growth in the field. Ready to apply skills and knowledge to create meaningful impact in the industry.`;
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

  useEffect(() => {
    // Only fetch if studentData is not provided
    if (!studentData) {
      dispatch(fetchPortfolio(studentId));
    }
  }, [dispatch, studentId, studentData]);

  // Listen for progress updates to refresh portfolio data
  useEffect(() => {
    if (!studentData) { // Only listen for updates if we're fetching our own data
      const handleProgressUpdate = () => {
        dispatch(fetchPortfolio(studentId));
      };

      // Listen for progress update events
      window.addEventListener('progress-updated', handleProgressUpdate);
      window.addEventListener('section-completed', handleProgressUpdate);
      window.addEventListener('level-completed', handleProgressUpdate);
      
      return () => {
        window.removeEventListener('progress-updated', handleProgressUpdate);
        window.removeEventListener('section-completed', handleProgressUpdate);
        window.removeEventListener('level-completed', handleProgressUpdate);
      };
    }
  }, [dispatch, studentId, studentData]);

  // Use portfolio data directly - it already contains all the information we need
  const mergedLevels = useMemo(() => {
    return data?.learningLevels || [];
  }, [data?.learningLevels]);

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/portfolio/public/${data?.student?._id || studentId}`;
    const shareText = `Check out ${data?.student?.name}'s portfolio on Syncner!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.student?.name}'s Portfolio`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback to copy to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Portfolio link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Portfolio link copied to clipboard!');
    }
  };

  if ((!studentData && loading)) {
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section - Matching the image design */}
        <div className="text-center mb-8">
          {/* Profile Image Placeholder */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)'
            }}
          >
            {data.student.name.charAt(0)}
          </div>
          
          {/* Student Name and Status */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {data.student.name}
            </h1>
            <p className="text-base sm:text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              {data.student.college || 'Not specified'}, India
            </p>
            
            {/* Track and Duration Info - Responsive Layout */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4">
              <div 
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
                style={{ 
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
              >
                Track: {data.student.careerTrack === 'full-stack' ? 'Full Stack Development' : 
                        data.student.careerTrack === 'ai-ml' ? 'AI & Machine Learning' :
                        data.student.careerTrack === 'ui-ux' ? 'UI/UX Design' :
                        data.student.careerTrack === 'data-science' ? 'Data Science' :
                        data.student.careerTrack}
              </div>
              <div 
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
              >
                Duration: {data.student.duration}
          </div>
              <div 
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
              >
          Last verified: {new Date(data.student.createdAt).toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

            {/* Ready to Hire Badge and Share Button */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {data.student.readyToHire && (
                <div 
                  className="inline-block px-6 py-2 rounded-full text-lg font-bold"
                  style={{ 
                    backgroundColor: 'var(--color-success)',
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  Ready to Hire
                </div>
              )}
              
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }}
              >
                <Share1Icon className="w-4 h-4" />
                Share Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Skills Section */}
      <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {(data.student.skills || ['SQL', 'Python', 'EDA', 'Data Viz', 'Communication']).map((skill) => (
            <div
              key={skill}
                className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

        {/* Certificate ID Section */}
      <div 
        className="mb-8 p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Certificate ID:
        </h2>
              <p 
                className="text-base sm:text-lg font-mono"
                style={{ color: 'var(--color-accent-primary)' }}
              >
                {data.student.certificateId}
        </p>
      </div>
            <button
              className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ 
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onClick={() => {
                navigator.clipboard.writeText(data.student.certificateId);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              }}
            >
              Copy ID
            </button>
          </div>
        </div>

        {/* Introduction Section */}
        <div 
          className="mb-8 p-6 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Introduction:
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {data.student.introduction || getTrackSpecificIntroduction(data.student.careerTrack)}
          </p>
        </div>

        {/* Recommended Roles Section */}
        <div 
          className="mb-8 p-4 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Recommended Roles
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.student.recommendedRoles.map((role) => (
              <span
                key={role}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {role}
              </span>
            ))}
        </div>
      </div>

        {/* Portfolio Section - Matching the image design */}
      <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Portfolio:
        </h2>
          
          <div className="grid gap-6">
            {mergedLevels.map((level: any, index: number) => (
              <motion.div
                key={level.level || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-xl overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
                {/* Level Card Header */}
                <div 
                  className="p-6 border-b"
                  style={{ 
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Level Number Circle */}
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mx-auto sm:mx-0"
                    style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)'
                    }}
                  >
                      {(level.level || index + 1).toString().padStart(2, '0')}
                  </div>
                    
                    {/* Level Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        {level.courseName || `Foundations: Linux & Shell`}
                    </h3>
                    </div>
                    
                    {/* MCQ and Tasks Info */}
                    <div className="text-center sm:text-right">
                      <div 
                        className="px-3 sm:px-4 py-2 rounded-full text-sm font-bold mb-2"
                    style={{
                      backgroundColor: (level.status || 'not-started') === 'completed' 
                        ? 'var(--color-success)'
                        : (level.status || 'not-started') === 'in-progress'
                        ? 'var(--color-warning)'
                            : 'var(--color-error)',
                          color: 'var(--color-text-inverse)'
                        }}
                      >
                        MCQ {level.test?.score || 86}%
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Tasks {level.exercise?.tasks?.filter((t: Task) => t.completed).length || 0}/{level.exercise?.tasks?.length || 5}
                      </div>
                    </div>
                </div>
              </div>

                {/* Expandable Content */}
              {expandedLevel === level.level && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Dynamic Task Items based on actual exercise data */}
                        {level.exercise?.tasks && level.exercise.tasks.length > 0 ? (
                          level.exercise.tasks.map((task: Task, i: number) => (
                            <div 
                              key={task.id || i}
                              className="p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                            style={{ 
                              backgroundColor: 'var(--color-tertiary-bg)',
                              borderColor: 'var(--color-border)'
                            }}
                          >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    Task: {task.title}
                                  </h4>
                                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Brief: {task.description}
                                  </p>
                                </div>
                                
                                <div className="flex flex-col items-end gap-3">
                                  {/* Task Status Indicator */}
                                  <div>
                                    {task.status === 'approved' && (
                                      <div 
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                        style={{
                                          backgroundColor: 'var(--color-success-bg)',
                                          color: 'var(--color-success)'
                                        }}
                                      >
                                        <CheckCircledIcon className="w-3 h-3" />
                                        Approved
                                      </div>
                                    )}

                                    {(!task.status || task.status === 'not-submitted') && (
                                      <div 
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                        style={{
                                          backgroundColor: 'var(--color-error-bg)',
                                          color: 'var(--color-error)'
                                        }}
                                      >
                                        <Cross2Icon className="w-3 h-3" />
                                        Not Submitted
                              </div>
                              )}
                            </div>
                                  
                                  {/* View Button */}
                                  {task.submissionLinks && task.submissionLinks.length > 0 ? (
                                    <button
                                      className="py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                                      style={{
                                        backgroundColor: 'var(--color-accent-primary)',
                                        color: 'var(--color-text-inverse)'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(task.submissionLinks[0], '_blank');
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                                      }}
                                    >
                                      View
                                    </button>
                                  ) : (
                                    <button
                                      className="py-2 px-4 rounded-lg text-sm font-medium"
                                      style={{
                                        backgroundColor: 'var(--color-tertiary-bg)',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'not-allowed'
                                      }}
                                      disabled
                                    >
                                      View
                                    </button>
                            )}
                          </div>
                      </div>
                    </div>
                          ))
                        ) : (
                          // No tasks available message
                          <div 
                            className="p-6 text-center rounded-lg border"
                            style={{ 
                              backgroundColor: 'var(--color-tertiary-bg)',
                              borderColor: 'var(--color-border)'
                            }}
                          >
                            <div className="text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              📋
                            </div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              No tasks available for this level yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Click to Expand Indicator */}
                <div 
                  className="p-4 text-center border-t cursor-pointer hover:bg-opacity-50 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)'
                  }}
                  onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                >
                  <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-accent-primary)' }}>
                    {expandedLevel === level.level ? (
                      <>
                        <ChevronDownIcon className="w-4 h-4" />
                        <span>Hide Details</span>
                      </>
                    ) : (
                      <>
                        <ChevronRightIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
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