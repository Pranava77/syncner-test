import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
  TargetIcon,
  RocketIcon,
  FileTextIcon
} from '@radix-ui/react-icons';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useStaff } from '../../hooks/useStaff';
import syncnerLogo from '../../assets/syncner-logo.png';


// Utility function to format dates and times
const formatDateTime = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'Not Available';
  
  // Handle text values
  if (typeof dateValue === 'string') {
    if (dateValue === 'In Progress' || dateValue === 'Not Started') {
      return dateValue;
    }
  }
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format as "DD MMM YYYY, HH:MM AM/PM"
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Utility function to get relative time (e.g., "2 days ago")
const getRelativeTime = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return '';
  
  // Handle text values
  if (typeof dateValue === 'string') {
    if (dateValue === 'In Progress' || dateValue === 'Not Started') {
      return '';
    }
  }
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 0) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInMinutes > 0) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return '';
  }
};

const StudentDetails: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();



  const {
    selectedStudent,
    studentDetailsLoading,
    error,
    getStudentDetails,
    clearError
  } = useStaff();
  


  // Fetch student details when component mounts or studentId changes
  useEffect(() => {
    if (studentId) {
      getStudentDetails(studentId);
    }
  }, [studentId, getStudentDetails]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [error, clearError]);

  const radarData = selectedStudent ? [
    { subject: 'Attendance', A: selectedStudent.summaryStats.consistency, fullMark: 100 },
    { subject: 'Progress', A: selectedStudent.summaryStats.progress, fullMark: 100 },
    { subject: 'Leaderboard', A: selectedStudent.summaryStats.leaderboard, fullMark: 100 }
  ] : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-5 h-5" style={{ color: '#10B981' }} />;
      case 'in-progress':
        return <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>;
      default:
        return <ClockIcon className="w-5 h-5" style={{ color: '#6B7280' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (studentDetailsLoading && !selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading student details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/staff/students')}
            className="px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            No student data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Top Header/Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/students')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Students
            </button>
          </div>
          

        </div>
      </div>

      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Student Details and Performance */}
            <div className="lg:col-span-2">
              {/* Student Details Card */}
              <div 
                className="p-6 rounded-xl shadow-sm mb-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h2 
                  className="text-2xl font-bold mb-6"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Student Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>Roll number:</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selectedStudent._id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>Student Name:</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selectedStudent.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-medium text-sm opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Course & Dept:</span>
                    <span className="font-medium opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{selectedStudent.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-medium text-sm opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Batch:</span>
                    <span className="font-medium opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{selectedStudent.batch || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enrolled Career Track:</span>
                    <span 
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)'
                      }}
                    >
                      {selectedStudent.careerTrack}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enrolled Date:</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selectedStudent.enrolledDate}</span>
                  </div>
                </div>
              </div>

              {/* Performance Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  { 
                    label: 'Attendance', 
                    value: selectedStudent.summaryStats.consistency, 
                    subtitle: 'Attendance Rate', 
                    icon: BarChartIcon,
                    isStreak: true,
                    unit: '%'
                  },
                  { 
                    label: 'Progress', 
                    value: selectedStudent.summaryStats.progress, 
                    subtitle: 'Course Completion', 
                    icon: RocketIcon,
                    isStreak: false,
                    unit: '%'
                  },
                  { 
                    label: 'Leaderboard', 
                    value: selectedStudent.summaryStats.leaderboard, 
                    subtitle: 'Overall Score', 
                    icon: StarIcon,
                    isStreak: false,
                    unit: '%'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="p-6 rounded-xl shadow-sm text-center flex flex-col items-center"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-sm)',
                      borderColor: 'var(--color-border)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                      {stat.value}{stat.unit}
                    </div>
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{stat.label}</div>
                    <div className="text-xs opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>{stat.subtitle}</div>
                    {stat.isStreak && (
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {selectedStudent.summaryStats.consistency > 0 ? `${selectedStudent.summaryStats.consistency}% attendance rate` : 'No attendance data'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Learning Timeline */}
              <div 
                className="p-6 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="mb-6">
                  <h2 
                    className="text-xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Learning Timeline
                  </h2>
                </div>

                <div className="space-y-8">
                  {selectedStudent.learningTimeline.map((level, index) => (
                    <motion.div
                      key={level.level}
                      className="relative group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Modern Vertical Line with Gradient */}
                      {index < selectedStudent.learningTimeline.length - 1 && (
                        <div className="absolute left-8 top-12 w-0.5 h-20">
                          <div 
                            className="w-full h-full rounded-full"
                            style={{ 
                              background: 'linear-gradient(to bottom, var(--color-accent-primary), var(--color-border))'
                            }}
                          />
                        </div>
                      )}

                      <div className="flex items-start gap-6">
                        {/* Modern Status Icon with Ring */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 group-hover:scale-110"
                            style={{ 
                              backgroundColor: 'var(--color-surface)',
                              borderColor: getStatusColor(level.status)
                            }}
                          >
                            {getStatusIcon(level.status)}
                          </div>
                          {/* Glow Effect */}
                          <div className="absolute inset-0 w-16 h-16 rounded-full opacity-20 blur-md transition-all duration-300 group-hover:opacity-40"
                            style={{ backgroundColor: getStatusColor(level.status) }}
                          />
                        </div>

                        {/* Enhanced Level Content */}
                        <div className="flex-1">
                          {/* Level Header with Badge */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                              style={{ 
                                backgroundColor: getStatusColor(level.status) + '20',
                                color: getStatusColor(level.status)
                              }}
                            >
                              Level {level.level}
                            </div>
                            <h3 
                              className="text-lg font-semibold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {level.courseName}
                            </h3>
                          </div>

                          {/* Modern Timeline Items */}
                          <div className="space-y-4">
                            {/* Learn */}
                            <div className="group/item relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                              style={{ 
                                backgroundColor: 'var(--color-secondary-bg)',
                                border: `1px solid ${level.learn.completed ? 'var(--color-success)' : 'var(--color-border)'}`
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/item:scale-110"
                                  style={{ 
                                    backgroundColor: level.learn.completed ? 'var(--color-success)' : 'var(--color-tertiary-bg)',
                                    color: level.learn.completed ? 'white' : 'var(--color-text-secondary)'
                                  }}
                                >
                                  <FileTextIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                      Learn
                                    </span>
                                    {level.learn.completed && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{ 
                                          backgroundColor: 'var(--color-success)',
                                          color: 'white'
                                        }}
                                      >
                                        ✓ Completed
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {formatDateTime(level.learn.startTime)} → {formatDateTime(level.learn.endTime)}
                                  </div>
                                  {getRelativeTime(level.learn.endTime) && (
                                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                      {getRelativeTime(level.learn.endTime)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Test */}
                            <div className="group/item relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                              style={{ 
                                backgroundColor: 'var(--color-secondary-bg)',
                                border: `1px solid ${level.test.completed ? 'var(--color-success)' : 'var(--color-border)'}`
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/item:scale-110"
                                  style={{ 
                                    backgroundColor: level.test.completed ? 'var(--color-success)' : 'var(--color-tertiary-bg)',
                                    color: level.test.completed ? 'white' : 'var(--color-text-secondary)'
                                  }}
                                >
                                  <TargetIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                      Test
                                    </span>
                                    {level.test.completed && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{ 
                                          backgroundColor: 'var(--color-success)',
                                          color: 'white'
                                        }}
                                      >
                                        ({level.test.score}% - {level.test.attempts} attempts)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {formatDateTime(level.test.startTime)} → {formatDateTime(level.test.endTime)}
                                  </div>
                                  {getRelativeTime(level.test.endTime) && (
                                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                      {getRelativeTime(level.test.endTime)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Exercise */}
                            <div className="group/item relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                              style={{ 
                                backgroundColor: 'var(--color-secondary-bg)',
                                border: `1px solid ${level.exercise.completed ? 'var(--color-success)' : 'var(--color-accent-primary)'}`
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/item:scale-110"
                                  style={{ 
                                    backgroundColor: level.exercise.completed ? 'var(--color-success)' : 'var(--color-accent-primary)',
                                    color: 'white'
                                  }}
                                >
                                  <FileTextIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                      Exercise
                                    </span>
                                    {level.exercise.completed ? (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{ 
                                          backgroundColor: 'var(--color-success)',
                                          color: 'white'
                                        }}
                                      >
                                        ✓ Completed
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium animate-pulse"
                                        style={{ 
                                          backgroundColor: 'var(--color-accent-primary)',
                                          color: 'white'
                                        }}
                                      >
                                        In Progress
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {formatDateTime(level.exercise.startTime)} → {formatDateTime(level.exercise.endTime)}
                                  </div>
                                  {getRelativeTime(level.exercise.endTime) && (
                                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                      {getRelativeTime(level.exercise.endTime)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Performance and Portfolio */}
            <div className="lg:col-span-1">
              {/* Skill Radar Chart */}
              <div 
                className="p-6 rounded-xl shadow-sm mb-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="relative">
                  <h3 
                    className="text-lg font-semibold mb-4 text-center"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Student Metrics Overview
                  </h3>
                </div>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--color-border)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Radar
                        name="Student Metrics"
                        dataKey="A"
                        stroke="var(--color-accent-primary)"
                        fill="var(--color-accent-primary)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Attendance • Progress • Overall Score (Progress + Attendance + Consistency)
                  </span>
                </div>
              </div>

              {/* View Portfolio Button */}
              <div 
                className="p-6 rounded-xl shadow-sm text-center"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <button 
                  className="w-full px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-1"
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
                  onClick={() => navigate(`/staff/students/${studentId}/portfolio`)}
                >
                  View Portfolio
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>


    </div>
  );
};

export default StudentDetails;
