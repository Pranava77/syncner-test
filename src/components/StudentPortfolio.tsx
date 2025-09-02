import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { PortfolioService, StudentPortfolioData } from '../services/portfolioService';



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

  return (<>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="relative w-full max-w-2xl p-6 rounded-xl"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-opacity-10"
          style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
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
                  Submit Task
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>);
};

const formatTimeSpent = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const getRecommendedRoles = (careerTrack: string): string[] => {
  switch (careerTrack.toLowerCase()) {
    case 'full-stack':
    case 'fullstack':
      return [
        'Full Stack Developer',
        'Software Engineer',
        'Web Developer',
        'Application Developer',
        'DevOps Engineer'
      ];
    case 'ai-ml':
      return [
        'Machine Learning Engineer',
        'AI Developer',
        'Data Scientist',
        'Research Engineer',
        'MLOps Engineer'
      ];
    case 'ui-ux':
      return [
        'UI/UX Designer',
        'Product Designer',
        'Interaction Designer',
        'Frontend Developer',
        'Web Designer'
      ];
    case 'data-science':
      return [
        'Data Scientist',
        'Data Analyst',
        'Business Intelligence Analyst',
        'Data Engineer',
        'Research Analyst'
      ];
    default:
      return [
        'Software Developer',
        'Application Developer',
        'Technical Analyst',
        'Technology Consultant',
        'Project Manager'
      ];
  }
};

// Commented out as it's currently unused
// interface PortfolioTask {
//   id: string;
//   title: string;
//   description: string;
//   completed: boolean;
// }

// Commented out as it's currently unused
// interface PortfolioModule {
//   id: string;
//   moduleNumber: string;
//   title: string;
//   completed: boolean;
//   completedDate: string;
//   assessmentScore: number;
//   timeSpent: string;
//   mcqScore: number;
//   tasksCompleted: number;
//   totalTasks: number;
//   tasks: PortfolioTask[];
//   isExpanded?: boolean;
// }

interface StudentPortfolioProps {
  studentId: string;
  studentData?: StudentPortfolioData;
}

const StudentPortfolioContent: React.FC<StudentPortfolioProps> = ({
  studentId,
  studentData: initialStudentData
}) => {
  const [selectedTask, setSelectedTask] = useState<{
    title: string;
    description: string;
    content: string;
    submissionLink?: string;
  } | null>(null);
  console.log('StudentPortfolio component rendered with:', { studentId, initialStudentData });
  const [studentData, setStudentData] = useState<StudentPortfolioData | null>(initialStudentData || null);
  const [loading, setLoading] = useState(!initialStudentData);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Retry fetching data with exponential backoff
  const fetchWithRetry = async (attempt: number = 0): Promise<StudentPortfolioData> => {
    try {
      let data;
      if (initialStudentData) {
        data = initialStudentData;
      } else if (studentId) {
        data = await PortfolioService.getStudentPortfolio(studentId);
      } else {
        throw new Error('No student data or ID provided');
      }

      // Validate required data
      if (!data.student || !data.progress || !data.learningLevels) {
        throw new Error('Invalid portfolio data structure');
      }

      return data;
    } catch (err) {
      if (attempt < maxRetries) {
        // Exponential backoff: wait 2^attempt seconds before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return fetchWithRetry(attempt + 1);
      }
      throw err;
    }
  };

  // Use the data passed from parent component or fetch from API
  useEffect(() => {
    console.log('Portfolio component: Initializing with:', { initialStudentData, studentId });
    
    const fetchPortfolioData = async () => {
        try {
          setLoading(true);
          setError(null);
        
        const data = await fetchWithRetry();
        console.log('Portfolio data:', data);
        
          setStudentData(data);
        setRetryCount(0); // Reset retry count on success
        } catch (err) {
        console.error('Error loading portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
        setRetryCount(prev => prev + 1);
        } finally {
          setLoading(false);
        }
      };
    
    fetchPortfolioData();
  }, [studentId, initialStudentData, retryCount]);

  // Show loading state
  if (loading) {
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

  // Show error state
  if (error) {
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
            onClick={() => window.location.reload()}
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

  // Show no data state
  if (!studentData) {
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
    <>
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div 
              className="w-24 h-24 rounded-2xl overflow-hidden border-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-accent-primary)'
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}>
                {studentData?.student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
                </div>
                
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {studentData?.student?.name || 'Student Name'}
                  </h1>
                {studentData?.student?.readyToHire && (
                    <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: 'var(--color-success-bg)',
                      color: 'var(--color-success)'
                    }}
                  >
                    Ready to Hire
                  </span>
                )}
              </div>
              <p className="text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                {studentData?.student?.college || 'Location'}, {studentData?.student?.department || 'India'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Track:</span>
                  <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ 
                    backgroundColor: 'var(--color-accent-tertiary)',
                    color: 'var(--color-accent-primary)'
                  }}>
                    {studentData?.student?.careerTrack || 'Full Stack Development'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Duration:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData?.student?.duration || '6 months'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Last verified:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {new Date(studentData?.student?.createdAt || '').toLocaleDateString('en-US', { 
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
                  </div>
                </div>
              </div>
              
        {/* Skills Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
                                  {studentData?.learningLevels?.reduce((skills: string[], level) => {
                        // Extract skills from level description or content
                        const levelSkills = level.description?.match(/\b(?:SQL|Python|JavaScript|React|Node\.js|Express|MongoDB|HTML|CSS|Git|API|REST|GraphQL|TypeScript|AWS|Docker|Testing|CI\/CD|Agile|Scrum)\b/g) || [];
                        return [...new Set([...skills, ...levelSkills])];
                      }, []).map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: 'var(--color-tertiary-bg)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Recommended Roles */}
          <div className="lg:col-span-1">
            <div 
              className="p-6 rounded-2xl border mb-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                RECOMMENDED ROLES
              </h2>
                <div className="space-y-2">
                {getRecommendedRoles(studentData?.student?.careerTrack || '').map((role) => (
                  <div
                    key={role}
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--color-tertiary-bg)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <span className="text-sm font-medium">{role}</span>
                    <span className="text-xs opacity-50">...</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                CERTIFICATE ID
              </h2>
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-tertiary-bg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <span className="text-sm font-mono">
                  {`SYNCNER-${new Date().getFullYear()}-${studentData?.student?._id?.toString()?.slice(-8).toUpperCase()}-${Math.random().toString(36).slice(-6).toUpperCase()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Portfolio */}
          <div className="lg:col-span-2">
            {/* Introduction Section */}
            <div 
              className="p-6 rounded-2xl border mb-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Introduction:
              </h2>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                {studentData?.student?.introduction || `${studentData?.student?.careerTrack || 'Full-stack'} developer in the making, passionate about solving real business problems with code. Skilled in ${studentData?.learningLevels?.reduce((skills: string[], level) => {
                  const levelSkills = level.description?.match(/\b(?:SQL|Python|JavaScript|React|Node\.js|Express|MongoDB|HTML|CSS|Git|API|REST|GraphQL|TypeScript|AWS|Docker|Testing|CI\/CD|Agile|Scrum)\b/g) || [];
                  return [...new Set([...skills, ...levelSkills])];
                }, []).slice(0, 3).join(', ') || 'modern technologies'}, and ready to contribute to impactful projects.`}
              </p>
            </div>
            
            {/* Portfolio Section */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Portfolio:
              </h2>
              
              {/* Learning Journey */}
              <div className="space-y-6">
                {studentData?.learningLevels?.map((level, index) => (
                  <div 
                    key={index}
                    className="border rounded-xl overflow-hidden"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {/* Level Header */}
                    <div 
                      className="p-4 flex items-center justify-between"
                      style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                          style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {level.courseName}
                </h3>
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>Time: {formatTimeSpent(level.learn?.timeSpent || 0)}</span>
                            <span>MCQ {level.test?.score || 0}% ({level.test?.attempts || 0} attempts)</span>
                            <span>Tasks {level.exercise?.tasks?.filter(t => t.completed)?.length || 0}/{level.exercise?.tasks?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>MCQ</span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-success-bg)',
                              color: 'var(--color-success)'
                            }}
                          >
                            {level.test?.score || 0}%
                  </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tasks</span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-success-bg)',
                              color: 'var(--color-success)'
                            }}
                          >
                            {level.exercise?.tasks?.filter(t => t.completed)?.length || 0}/{level.exercise?.tasks?.length || 0}
                  </span>
                </div>
              </div>
            </div>
              
                    {/* Tasks */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {level.exercise?.tasks?.map((task: any) => (
                        <div
                          key={task._id || task.id}
                          className="p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                      >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                {task.title}
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {task.description}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedTask({
                                title: task.title,
                                description: task.description,
                                content: task.content,
                                submissionLink: `https://github.com/yourusername/portfolio-submissions/issues/new?title=${encodeURIComponent(`Task Submission: ${task.title}`)}&body=${encodeURIComponent(`# Task: ${task.title}\n\n## Description\n${task.description}\n\n## Submission\n[Your submission here]`)}`
                              })}
                              className="px-3 py-1 rounded text-sm transition-colors duration-200"
                              style={{
                                backgroundColor: 'var(--color-accent-primary)',
                                color: 'white'
                              }}
                            >
                              View Details
                            </button>
                          </div>
                          {task.completed && (
                            <div 
                              className="mt-2 text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                              style={{
                                backgroundColor: 'var(--color-success-bg)',
                                color: 'var(--color-success)'
                              }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Completed
                            </div>
                          )}
                                    </div>
                                  ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TaskModal 
      isOpen={!!selectedTask}
      onClose={() => setSelectedTask(null)}
      task={selectedTask}
    />
    </>
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
