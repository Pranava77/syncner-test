import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircledIcon, 
  ClockIcon, 
  PlayIcon, 
  ReaderIcon, 
  FileTextIcon, 
  CodeIcon, 
  RocketIcon, 
  TargetIcon, 
  StarIcon, 
  CheckIcon, 
  ChevronRightIcon, 
  ChevronDownIcon, 
  MarginIcon, 
  CalendarIcon 
} from '@radix-ui/react-icons';

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

interface StudentPortfolioData {
  student: {
    _id: string;
    name: string;
    email: string;
    careerTrack: string;
    college?: string;
    department?: string;
    createdAt: string;
  };
  progress: {
    currentLevel: number;
    completedLevels: number;
    totalLevels: number;
    percentage: number;
    totalPoints: number;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
    currentStreak: number;
    longestStreak: number;
  };
  leaderboard: {
    score: number;
    rank: number | null;
    breakdown: {
      progressScore: number;
      attendanceScore: number;
      consistencyScore: number;
      timeScore: number;
    };
  };
  learningLevels: any[]; // Array of learning level objects
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16 px-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Student Portfolio
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Comprehensive learning progress and achievements dashboard
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white text-sm">
              📊 Real-time Progress Tracking
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - User Profile & Skills */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <div 
              className="p-8 rounded-3xl border-0 shadow-2xl backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'var(--color-border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Profile Picture & Basic Info */}
              <div className="flex items-start gap-6 mb-8">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                >
                  {studentData.student?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                
                <div className="flex-1">
                  <h2 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {studentData.student?.name || 'Student Name'}
                  </h2>
                  <p 
                    className="text-sm mb-1 flex items-center gap-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <MarginIcon className="w-4 h-4" />
                    {studentData.student?.college || 'College Name'}
                  </p>
                  <p 
                    className="text-sm mb-3 flex items-center gap-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <CodeIcon className="w-4 h-4" />
                    {studentData.student?.department || 'Department'}
                  </p>
                  
                  {/* Career Track Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
                    <RocketIcon className="w-3 h-3" />
                    {studentData.student?.careerTrack || 'Career Track'}
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="mb-8 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  👤 Student Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{studentData.student?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Enrolled:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {studentData.student?.createdAt ? formatDate(studentData.student.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Summary */}
              <div className="mb-8">
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  📈 Progress Summary
                </h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Overall Progress</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {studentData.progress?.percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${studentData.progress?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{studentData.progress?.currentLevel || 1}</div>
                    <div className="text-sm text-blue-600">Current Level</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 mb-1">{studentData.progress?.completedLevels || 0}</div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                </div>
              </div>
              
              {/* Attendance */}
              <div>
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  📅 Attendance
                </h3>
                
                {/* Attendance Stats */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-orange-600 mb-1">{studentData.attendance?.percentage || 0}%</div>
                    <div className="text-sm text-orange-600">Attendance Rate</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-orange-700">{studentData.attendance?.presentDays || 0}</div>
                      <div className="text-xs text-orange-600">Present Days</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-700">{studentData.attendance?.totalDays || 0}</div>
                      <div className="text-xs text-orange-600">Total Days</div>
                    </div>
                  </div>
                  
                  {/* Streak Info */}
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600">Current Streak</span>
                      <span className="font-semibold text-orange-700">{studentData.attendance?.currentStreak || 0} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600">Longest Streak</span>
                      <span className="font-semibold text-orange-700">{studentData.attendance?.longestStreak || 0} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Learning Progress & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Data Check */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                📊 Data Check
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Student:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.student?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Track:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.student?.careerTrack || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Progress:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.progress?.percentage || 0}%
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Attendance:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.attendance?.percentage || 0}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Learning Progress & Details */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                🎯 Learning Progress & Details
              </h3>
              
              {/* Status Legend */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">Status Legend</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-600">Not Started</span>
                  </div>
                </div>
              </div>
              
              {/* Learning Levels */}
              {studentData.learningLevels && studentData.learningLevels.length > 0 ? (
                <div className="space-y-4">
                  {studentData.learningLevels.map((level, index) => (
                    <div
                      key={level.id || `level-${index}`}
                      className="border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                      style={{
                        borderColor: level.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)',
                        backgroundColor: 'var(--color-surface)'
                      }}
                    >
                      {/* Level Header */}
                      <div 
                        className="p-6 cursor-pointer transition-all duration-200 hover:bg-opacity-50"
                        style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                        onClick={() => toggleModule(level.id || `level-${index}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Level Number Badge */}
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                              style={{
                                backgroundColor: level.status === 'completed' 
                                  ? 'var(--color-success)' 
                                  : 'var(--color-accent-primary)'
                              }}
                            >
                              {level.level || index + 1}
                            </div>
                            
                            {/* Level Info */}
                            <div className="flex-1">
                              <h4 
                                className="text-lg font-semibold mb-2"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {level.courseName || `Level ${level.level || index + 1}`}
                              </h4>
                              {level.description && (
                                <p 
                                  className="text-sm mb-3"
                                  style={{ color: 'var(--color-text-secondary)' }}
                                >
                                  {level.description}
                                </p>
                              )}
                              
                              {/* Progress Summary */}
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>
                                    Status: {level.status || 'unknown'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>
                                    Learn: {level.learn?.completed ? '✅' : '⏳'} {level.learn?.timeSpent ? formatTimeSpent(level.learn.timeSpent) : '0h 0m'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>
                                    Test: {level.test?.completed ? '✅' : '⏳'} {level.test?.score || 0}/100 ({level.test?.attempts || 0} attempts)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>
                                    Exercise: {level.exercise?.completed ? '✅' : '⏳'} {level.exercise?.timeSpent ? formatTimeSpent(level.exercise.timeSpent) : '0h 0m'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <span 
                            className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                            style={{
                              backgroundColor: level.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                              color: level.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
                            }}
                          >
                            {level.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                          </span>
                          
                          {/* Expand/Collapse Icon */}
                          {expandedModules.has(level.id || `level-${index}`) ? (
                            <ChevronDownIcon className="w-6 h-6" style={{ color: 'var(--color-text-tertiary)' }} />
                          ) : (
                            <ChevronRightIcon className="w-6 h-6" style={{ color: 'var(--color-text-tertiary)' }} />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedModules.has(level.id || `level-${index}`) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gradient-to-br from-gray-50 to-blue-50"
                        >
                          <div className="p-8 border-t border-gray-200">
                            
                            {/* Learning Section Details */}
                            <div className="mb-8">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xl font-semibold flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                                    📚
                                  </div>
                                  Learning Materials
                                </h4>
                                <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                  level.learn?.completed 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}>
                                  {level.learn?.completed ? '✅ Completed' : '⏳ In Progress'}
                                </span>
                              </div>
                              
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.learn?.status || 'Not started'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Time Spent:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.learn?.timeSpent ? formatTimeSpent(level.learn.timeSpent) : '0h 0m'}
                                    </span>
                                  </div>
                                  {level.learn?.startTime && (
                                    <div className="flex justify-between">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.learn.startTime)}
                                      </span>
                                    </div>
                                  )}
                                  {level.learn?.endTime && (
                                    <div className="flex justify-between">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.learn.endTime)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Test Section Details */}
                            <div className="mb-8">
                              <h4 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                                  📝
                                </div>
                                Assessment
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  level.test?.completed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {level.test?.completed ? 'Completed' : 'Not Attempted'}
                                </span>
                              </h4>
                              
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.test?.completed ? 'Completed' : 'Not Attempted'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Score:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.test?.score || 0}/100
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Attempts:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.test?.attempts || 0}
                                    </span>
                                  </div>
                                  {level.test?.startTime && (
                                    <div className="flex justify-between">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.test.startTime)}
                                      </span>
                                    </div>
                                  )}
                                  {level.test?.endTime && (
                                    <div className="flex justify-between">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.test.endTime)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Exercise Section Details */}
                            <div className="mb-6">
                              <h4 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                                  💻
                                </div>
                                Practice Exercise
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  level.exercise?.completed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {level.exercise?.completed ? 'Completed' : 'Not Attempted'}
                                </span>
                              </h4>
                              
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.exercise?.completed ? 'Completed' : 'Not Attempted'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Time Spent:</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                      {level.exercise?.timeSpent ? formatTimeSpent(level.exercise.timeSpent) : '0h 0m'}
                                    </span>
                                  </div>
                                  {level.exercise?.startTime && (
                                    <div className="flex justify-between">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.exercise.startTime)}
                                      </span>
                                    </div>
                                  )}
                                  {level.exercise?.endTime && (
                                    <div className="flex justify-between">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {formatDate(level.exercise.endTime)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Exercise Tasks */}
                            {level.exercise && level.exercise.tasks && level.exercise.tasks.length > 0 && (
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h5 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                  <TargetIcon className="w-5 h-5" />
                                  Exercise Tasks
                                </h5>
                                <div className="space-y-3">
                                  {level.exercise.tasks.map((task: any, taskIndex: number) => (
                                    <div 
                                      key={task.id || `task-${taskIndex}`}
                                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
                                    >
                                      <div className={`w-3 h-3 rounded-full ${
                                        task.completed ? 'bg-green-500' : 'bg-gray-300'
                                      }`}></div>
                                      <div className="flex-1">
                                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                          {task.title || `Task ${taskIndex + 1}`}
                                        </div>
                                        {task.description && (
                                          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {task.description}
                                          </div>
                                        )}
                                      </div>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        task.completed 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {task.completed ? 'Completed' : 'Pending'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No Tasks Message */}
                            {(!level.exercise || !level.exercise.tasks || level.exercise.tasks.length === 0) && (
                              <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-gray-500">No specific tasks available for this level</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    No Learning Levels Found
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    This student hasn't started any learning levels yet
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
