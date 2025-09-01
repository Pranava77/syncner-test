import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { PortfolioService, StudentPortfolioData } from '../services/portfolioService';

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
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-success-bg)',
                    color: 'var(--color-success)'
                  }}
                >
                  Ready to Hire
                </span>
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
                    6 months
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
            {['SQL', 'Python', 'EDA', 'Data Viz', 'Communication'].map((skill) => (
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
                {['Full Stack Developer', 'Front-end Developer', 'Back-end Developer', 'Software Developer', 'AI Full stack Developer'].map((role) => (
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
                <span className="text-sm font-mono">SYNCNER-2025-STU1234-9X5T7K</span>
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
                Full-stack developer in the making, passionate about solving real business problems with code. Skilled in
                SQL, Python, and data visualization, and ready to contribute to impactful projects.
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
                            <span>Time: 5h-20m</span>
                            <span>MCQ {level.test?.score || 0}%</span>
                            <span>Tasks {level.exercise?.completed ? '5/5' : '0/5'}</span>
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
                            5/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5].map((taskNum) => (
                        <div
                          key={taskNum}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                Task: Build a web using HTML/CSS
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Brief: Create a HTML Website
                              </p>
                            </div>
                            <button
                              className="px-3 py-1 rounded text-sm"
                              style={{
                                backgroundColor: 'var(--color-tertiary-bg)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              View
                            </button>
                          </div>
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
