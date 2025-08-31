import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MarginIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon
} from '@radix-ui/react-icons';
import { PortfolioService, StudentPortfolioData } from '../services/portfolioService';

interface PortfolioTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface PortfolioModule {
  id: string;
  moduleNumber: string;
  title: string;
  completed: boolean;
  completedDate: string;
  assessmentScore: number;
  timeSpent: string;
  mcqScore: number;
  tasksCompleted: number;
  totalTasks: number;
  tasks: PortfolioTask[];
  isExpanded?: boolean;
}

interface StudentPortfolioProps {
  studentId: string;
  studentData: {
    name: string;
    location: string;
    profilePicture?: string;
    completionPercentage: number;
    status: string;
    track: string;
    duration: string;
    lastVerified: string;
    skills: string[];
    certificateId: string;
    recommendedRoles: string[];
    introduction: string;
    modules: PortfolioModule[];
  };
}

const StudentPortfolio: React.FC<StudentPortfolioProps> = ({
  studentId,
  studentData: initialStudentData
}) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'projects'>('topics');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [studentData, setStudentData] = useState<StudentPortfolioData | null>(initialStudentData || null);
  const [loading, setLoading] = useState(!initialStudentData);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio data from backend if not provided
  useEffect(() => {
    if (!initialStudentData && studentId) {
      const fetchPortfolio = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await PortfolioService.getStudentPortfolio(studentId);
          setStudentData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
        } finally {
          setLoading(false);
        }
      };

      fetchPortfolio();
    }
  }, [studentId, initialStudentData]);

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

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not completed';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - User Profile & Skills */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {/* Profile Picture & Basic Info */}
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: 'var(--color-tertiary-bg)',
                    color: 'var(--color-text-primary)',
                    border: '3px solid var(--color-border)'
                  }}
                >
                  {studentData.profilePicture ? (
                    <img 
                      src={studentData.profilePicture} 
                      alt={studentData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    studentData.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {studentData.name}
                  </h1>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <MarginIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {studentData.location}
                    </span>
                  </div>
                  
                  {/* Completion Badge */}
                  <div 
                    className="px-4 py-2 rounded-lg text-center font-semibold"
                    style={{
                      backgroundColor: 'var(--color-success)',
                      color: 'white'
                    }}
                  >
                    {studentData.completionPercentage}% completed
                    <div className="text-xs mt-1">{studentData.status}</div>
                  </div>
                </div>
              </div>
              
              {/* Track & Duration Info */}
              <div className="space-y-3 mb-6">
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: 'white'
                  }}
                >
                  Track: {studentData.track}
                </div>
                
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: 'white'
                  }}
                >
                  Duration: {studentData.duration}
                </div>
                
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: 'white'
                  }}
                >
                  Last verified: {formatDate(studentData.lastVerified)}
                </div>
              </div>
              
              {/* Skills */}
              <div className="mb-6">
                <h3 
                  className="text-sm font-semibold mb-3 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studentData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Certificate ID */}
              <div>
                <h3 
                  className="text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Certificate ID
                </h3>
                <p 
                  className="text-sm font-mono p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-tertiary-bg)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {studentData.certificateId}
                </p>
              </div>
            </div>
            
            {/* Recommended Roles */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h3 
                className="text-lg font-bold mb-4 uppercase tracking-wider"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Recommended Roles
              </h3>
              
              <div className="space-y-3">
                {studentData.recommendedRoles.map((role, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 rounded-lg flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--color-tertiary-bg)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {role}
                    </span>
                    
                    {/* Highlight current focus role */}
                    {index === 1 && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--color-warning)',
                          color: 'white'
                        }}
                      >
                        M
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Introduction */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h2 
                className="text-xl font-bold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Introduction:
              </h2>
              <p 
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {studentData.introduction}
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
              <h2 
                className="text-xl font-bold mb-6"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Portfolio:
              </h2>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'topics'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'topics' 
                      ? 'var(--color-accent-primary)' 
                      : 'var(--color-tertiary-bg)'
                  }}
                >
                  Topics Covered
                </button>
                
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'projects'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'projects' 
                      ? 'var(--color-accent-primary)' 
                      : 'var(--color-tertiary-bg)'
                  }}
                >
                  Projects
                </button>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  {studentData.modules.map((module) => (
                    <div
                      key={module.id}
                      className="border rounded-xl overflow-hidden"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-tertiary-bg)'
                      }}
                    >
                      {/* Module Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                        onClick={() => toggleModule(module.id)}
                        style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Module Number Badge */}
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                              style={{
                                backgroundColor: 'var(--color-info)',
                                color: 'white'
                              }}
                            >
                              {module.moduleNumber}
                            </div>
                            
                            {/* Module Info */}
                            <div className="flex-1">
                              <h3 
                                className="text-lg font-bold mb-2"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {module.title}
                              </h3>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Completed {formatDate(module.completedDate)}
                                </span>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Assessed: {module.assessmentScore}/100
                                </span>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Time: {module.timeSpent}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Badges */}
                          <div className="flex items-center gap-3">
                            <span 
                              className="px-3 py-1 rounded-lg text-sm font-medium"
                              style={{
                                backgroundColor: 'var(--color-success-bg)',
                                color: 'var(--color-success)'
                              }}
                            >
                              MCQ ✅ {module.mcqScore}%
                            </span>
                            <span 
                              className="px-3 py-1 rounded-lg text-sm font-medium"
                              style={{
                                backgroundColor: 'var(--color-info-bg)',
                                color: 'var(--color-info)'
                              }}
                            >
                              Tasks {module.tasksCompleted}/{module.totalTasks}
                            </span>
                            
                            {/* Expand/Collapse Icon */}
                            {expandedModules.has(module.id) ? (
                              <ChevronDownIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Tasks */}
                      {expandedModules.has(module.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <div className="p-4 space-y-3">
                            {module.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{
                                  backgroundColor: 'var(--color-surface)',
                                  borderColor: 'var(--color-border)'
                                }}
                              >
                                <div>
                                  <h4 
                                    className="font-semibold mb-1"
                                    style={{ color: 'var(--color-text-primary)' }}
                                  >
                                    Task: {task.title}
                                  </h4>
                                  <p 
                                    className="text-sm"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    {task.description}
                                  </p>
                                </div>
                                
                                <button
                                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                  style={{
                                    backgroundColor: 'var(--color-accent-primary)',
                                    color: 'white'
                                  }}
                                >
                                  View
                                </button>
                              </div>
                            ))}
                            
                            <p 
                              className="text-xs italic text-center pt-2"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Will also be showing optional tasks
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'projects' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Projects Coming Soon
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Project showcase will be available in the next update.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
