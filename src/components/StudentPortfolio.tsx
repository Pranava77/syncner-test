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
  studentData?: StudentPortfolioData;
}

const StudentPortfolio: React.FC<StudentPortfolioProps> = ({
  studentId,
  studentData: initialStudentData
}) => {
  // Helper function to format time spent
  const formatTimeSpent = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  console.log('StudentPortfolio component rendered with:', { studentId, initialStudentData });
  const [activeTab, setActiveTab] = useState<'topics'>('topics');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [studentData, setStudentData] = useState<StudentPortfolioData | null>(initialStudentData || null);
  const [loading, setLoading] = useState(!initialStudentData);
  const [error, setError] = useState<string | null>(null);

  // Use the data passed from parent component (same as Learning Journey)
  useEffect(() => {
    console.log('Portfolio component: Using data from parent:', { initialStudentData, studentId });
    
    if (initialStudentData) {
      console.log('Portfolio: Using provided data, no API call needed');
      setStudentData(initialStudentData);
      setLoading(false);
    } else if (studentId) {
      console.log('Portfolio: No data provided, fetching from API...');
      const fetchPortfolio = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await PortfolioService.getStudentPortfolio(studentId);
          console.log('Portfolio data received from API:', data);
          setStudentData(data);
        } catch (err) {
          console.error('Error fetching portfolio:', err);
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
                  {studentData.student?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                
                <div className="flex-1">
                  <h1 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {studentData.student?.name || 'Student Name'}
                  </h1>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <MarginIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {studentData.student?.college ? `${studentData.student.college}, ${studentData.student.department || 'Unknown'}` : 'Location not specified'}
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
                    {studentData.progress?.percentage || 0}% completed
                    <div className="text-xs mt-1">Level {studentData.progress?.currentLevel || 1} of {studentData.progress?.totalLevels || 0}</div>
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
                  Track: {studentData.student?.careerTrack || 'Unknown'}
                </div>
                
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: 'white'
                  }}
                >
                  Enrolled: {studentData.student?.createdAt ? formatDate(studentData.student.createdAt) : 'Unknown'}
                </div>
                
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: 'white'
                  }}
                >
                  College: {studentData.student?.college || 'Not specified'}
                </div>
              </div>
              
              {/* Progress Summary */}
              <div className="mb-6">
                <h3 
                  className="text-sm font-semibold mb-3 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Progress Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Current Level:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{studentData.progress?.currentLevel || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{studentData.progress?.completedLevels || 0} / {studentData.progress?.totalLevels || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-primary)' }}>Total Points:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{studentData.progress?.totalPoints || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Attendance */}
              <div>
                <h3 
                  className="text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Attendance
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Present:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{studentData.attendance?.presentDays || 0} / {studentData.attendance?.totalDays || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-primary)' }}>Percentage:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{studentData.attendance?.percentage || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
            

          </div>
          
          {/* Right Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Info */}
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
                Student Information:
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{studentData.student?.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Department:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{studentData.student?.department || 'Not specified'}</span>
                </div>
              </div>
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
                Learning Progress & Details:
              </h2>
              
                          {/* Learning Levels Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  🎯 Learning Levels
                </h3>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    In Progress
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    Not Started
                  </span>
                </div>
              </div>
            </div>
              
                                          {/* Topics Content */}
              <div className="space-y-4">
                {/* Data Check */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Data Check:</strong> {studentData.learningLevels?.length || 0} learning levels loaded | Student: {studentData.student?.name || 'Unknown'} | Track: {studentData.student?.careerTrack || 'Unknown'} | Progress: {studentData.progress?.percentage || 0}% | Attendance: {studentData.attendance?.percentage || 0}%
                  </p>
                </div>
                
                {studentData.learningLevels && studentData.learningLevels.length > 0 ? (
                  studentData.learningLevels.map((level: any, index: number) => (
                    <div
                      key={level.id || `level-${index}`}
                      className={`border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        level.status === 'completed' ? 'border-green-200' : 
                        level.status === 'in-progress' ? 'border-yellow-200' : 'border-gray-200'
                      }`}
                      style={{
                        borderColor: level.status === 'completed' ? 'var(--color-success)' : 
                                   level.status === 'in-progress' ? 'var(--color-warning)' : 'var(--color-border)',
                        backgroundColor: 'var(--color-tertiary-bg)'
                      }}
                    >
                      {/* Module Header */}
                      <div 
                        className="p-6 cursor-pointer hover:bg-opacity-90 transition-all duration-200 group"
                        onClick={() => toggleModule(level.id || `level-${index}`)}
                        style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Module Number Badge */}
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 group-hover:scale-110 ${
                                level.status === 'completed' ? 'bg-green-500 shadow-lg' : 
                                level.status === 'in-progress' ? 'bg-yellow-500 shadow-lg' : 'bg-gray-400'
                              }`}
                              style={{
                                color: 'white'
                              }}
                            >
                              {level.level || index + 1}
                            </div>
                            
                            {/* Module Info */}
                            <div className="flex-1">
                              <h3 
                                className="text-lg font-bold mb-2"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {level.courseName || `Level ${level.level || index + 1}`}
                              </h3>
                              
                              {level.description && (
                                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  {level.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm">
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Status: {level.status || 'unknown'}
                                </span>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Learn: {level.learn?.completed ? '✅' : '⏳'} {level.learn?.timeSpent ? formatTimeSpent(level.learn.timeSpent) : '0h 0m'}
                                </span>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Test: {level.test?.completed ? '✅' : '⏳'} {level.test?.score || 0}/100 ({level.test?.attempts || 0} attempts)
                                </span>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                  Exercise: {level.exercise?.completed ? '✅' : '⏳'} {level.exercise?.timeSpent ? formatTimeSpent(level.exercise.timeSpent) : '0h 0m'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Badges */}
                          <div className="flex items-center gap-4">
                            {/* Learn Progress */}
                            <div className="text-center">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Learn</span>
                                {level.learn?.completed ? (
                                  <span className="text-green-500">✅</span>
                                ) : (
                                  <span className="text-yellow-500">⏳</span>
                                )}
                              </div>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-300"
                                  style={{
                                    backgroundColor: level.learn?.completed ? 'var(--color-success)' : 'var(--color-warning)',
                                    width: level.learn?.completed ? '100%' : '50%'
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Test Progress */}
                            <div className="text-center">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Test</span>
                                {level.test?.completed ? (
                                  <span className="text-green-500">✅</span>
                                ) : (
                                  <span className="text-yellow-500">⏳</span>
                                )}
                              </div>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-300"
                                  style={{
                                    backgroundColor: level.test?.completed ? 'var(--color-success)' : 'var(--color-warning)',
                                    width: level.test?.completed ? '100%' : '0%'
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {level.test?.score || 0}%
                              </div>
                            </div>

                            {/* Exercise Progress */}
                            <div className="text-center">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Exercise</span>
                                {level.exercise?.completed ? (
                                  <span className="text-green-500">✅</span>
                                ) : (
                                  <span className="text-yellow-500">⏳</span>
                                )}
                              </div>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-300"
                                  style={{
                                    backgroundColor: level.exercise?.completed ? 'var(--color-success)' : 'var(--color-warning)',
                                    width: level.exercise?.completed ? '100%' : '0%'
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span 
                              className="px-3 py-1 rounded-lg text-sm font-medium"
                              style={{
                                backgroundColor: level.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                                color: level.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
                              }}
                            >
                              {level.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                            </span>
                            
                            {/* Expand/Collapse Icon */}
                            {expandedModules.has(level.id || `level-${index}`) ? (
                              <ChevronDownIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedModules.has(level.id || `level-${index}`) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                        >
                          <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            
                            {/* Learning Section Details */}
                            <div className="mb-8">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-lg flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    📚
                                  </div>
                                  Learning Materials
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  level.learn?.completed 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}>
                                  {level.learn?.completed ? '✅ Completed' : '⏳ In Progress'}
                                </span>
                              </div>
                                                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                  <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                                    <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.learn?.status || 'Not started'}
                                    </span>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Time Spent:</span>
                                    <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.learn?.timeSpent ? formatTimeSpent(level.learn.timeSpent) : '0h 0m'}
                                    </span>
                                  </div>
                                  {level.learn?.startTime && (
                                    <div>
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                                      <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.learn.startTime)}
                                      </span>
                                    </div>
                                  )}
                                  {level.learn?.endTime && (
                                    <div>
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                                      <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.learn.endTime)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Test Section Details */}
                            <div className="mb-8">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-lg flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    📝
                                  </div>
                                  Assessment
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  level.test?.completed 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}>
                                  {level.test?.completed ? '✅ Completed' : '⏳ Not Attempted'}
                                </span>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Score:</span>
                                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                    {level.test?.score || 0}/100
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Attempts:</span>
                                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                    {level.test?.attempts || 0}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                    {level.test?.status || 'Not started'}
                                  </span>
                                </div>
                                {level.test?.startTime && (
                                  <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                                    <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                      {formatDate(level.test.startTime)}
                                    </span>
                                  </div>
                                )}
                                {level.test?.endTime && (
                                  <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                                    <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                      {formatDate(level.test.endTime)}
                                    </span>
                                  </div>
                                )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Exercise Section Details */}
                            <div className="mb-6">
                              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                💻 Practice Exercise
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  level.exercise?.completed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {level.exercise?.completed ? 'Completed' : 'Not Started'}
                                </span>
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                    {level.exercise?.status || 'Not started'}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Time Spent:</span>
                                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                    {level.exercise?.timeSpent ? formatTimeSpent(level.exercise.timeSpent) : '0h 0m'}
                                  </span>
                                </div>
                                {level.exercise?.startTime && (
                                  <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                                    <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                      {formatDate(level.exercise.startTime)}
                                    </span>
                                  </div>
                                )}
                                {level.exercise?.endTime && (
                                  <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                                    <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                                      {formatDate(level.exercise.endTime)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Exercise Tasks */}
                            {level.exercise && level.exercise.tasks && level.exercise.tasks.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                  📋 Exercise Tasks
                                </h4>
                                <div className="space-y-3">
                                  {level.exercise.tasks.map((task: any, taskIndex: number) => (
                                    <div
                                      key={task.id || `task-${index}-${taskIndex}`}
                                      className="flex items-center justify-between p-3 rounded-lg"
                                      style={{ backgroundColor: 'var(--color-surface)' }}
                                    >
                                      <div>
                                        <h5 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                          {task.title || `Task ${taskIndex + 1}`}
                                        </h5>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                          {task.description || task.content || 'Complete the assigned task'}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {task.completed ? (
                                          <span className="text-green-500">✅</span>
                                        ) : (
                                          <span className="text-gray-400">⏳</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No Tasks Message */}
                            {(!level.exercise || !level.exercise.tasks || level.exercise.tasks.length === 0) && (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500">No specific tasks available for this level</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      No Learning Levels Found
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      No learning levels available for this student.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
