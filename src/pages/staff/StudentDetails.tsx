import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  TargetIcon, 
  CheckCircledIcon,
  StarIcon,
  FileTextIcon,
  RocketIcon
} from '@radix-ui/react-icons';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useStaff } from '../../hooks/useStaff';


const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const { 
    selectedStudent, 
    studentDetailsLoading, 
    error, 
    getStudentDetails, 
    clearSelectedStudent 
  } = useStaff();

  // Fetch student details when component mounts
  useEffect(() => {
    if (studentId) {
      getStudentDetails(studentId);
    }
    
    // Cleanup when component unmounts
    return () => {
      clearSelectedStudent();
    };
  }, [studentId, getStudentDetails, clearSelectedStudent]);

  // Use selectedStudent data from backend
  const studentData = selectedStudent;
  
  // Debug logging
  console.log('StudentDetails - selectedStudent:', selectedStudent);
  console.log('StudentDetails - studentData:', studentData);
  
  // Show loading state while data is being fetched
  if (studentDetailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>Loading student details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Error Loading Student</h2>
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          <button 
            onClick={() => getStudentDetails(studentId!)}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Show message if no student data is available
  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No Student Data</h2>
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-muted)' }}>Student information not found.</p>
          <button 
            onClick={() => navigate('/staff/students')}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  // Radar chart data for performance metrics
  const radarData = [
    { metric: 'Performance', value: studentData.performance?.performance || 0 },
    { metric: 'Potential', value: studentData.performance?.potential || 0 },
    { metric: 'Contribution', value: studentData.performance?.contribution || 0 },
    { metric: 'Creativity', value: studentData.performance?.creativity || 0 },
    { metric: 'Skill', value: studentData.performance?.skill || 0 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-5 h-5" style={{ color: 'var(--color-success)' }} />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />;
      default:
        return <ClockIcon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'var(--color-success)' };
      case 'in-progress':
        return { color: 'var(--color-warning)' };
      default:
        return { color: 'var(--color-text-muted)' };
    }
  };

  const getAttendanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Great';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    return 'Poor';
  };

  const getProgressLabel = (score: number) => {
    if (score >= 90) return 'Great';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Poor';
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/staff/students')}
                className="p-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
                style={{ color: 'var(--color-accent-primary)' }}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 
                  className="text-xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Student Details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {studentDetailsLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent-primary)]"></div>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Loading student details...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-bg)' }}>
            <p style={{ color: 'var(--color-error)' }}>
              Error: {error}
            </p>
          </div>
        )}

        {/* Top Section: Student Details + Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Student Details */}
          <div 
            className="rounded-xl shadow-sm p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h2 
              className="text-lg font-heading mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Student Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span 
                  className="text-sm font-label"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Roll Number:
                </span>
                <span 
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {studentData._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-sm font-label"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Course & Dept:
                </span>
                <span 
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {studentData.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-sm font-label"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Student Name:
                </span>
                <span 
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {studentData.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-sm font-label"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Batch:
                </span>
                <span 
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {studentData.batch}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-sm font-label"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Enrolled Career Track:
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-accent-tertiary)',
                    color: 'var(--color-accent-primary)'
                  }}
                >
                  {studentData.careerTrack}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-sm font-label"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Enrolled Date:
                </span>
                <span 
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {studentData.enrolledDate}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Performance Overview */}
          <div 
            className="rounded-xl shadow-sm p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h2 
              className="text-lg font-heading mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Performance Overview
            </h2>
            
            {/* Radar Chart */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="var(--color-accent-primary)"
                    fill="var(--color-accent-primary)"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div 
              className="text-center text-sm mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              (Optional)
            </div>
            
            <button 
              className="w-full px-4 py-2 rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)'
              }}
            >
              View Portfolio
            </button>
          </div>
        </div>

        {/* Middle Section: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="rounded-xl shadow-sm p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-center">
              <div 
                className="text-3xl font-heading mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                                  {studentData.attendancePercentage}%
              </div>
              <div 
                className="text-lg font-label mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Attendance
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                                  {getAttendanceLabel(studentData.attendancePercentage)}
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-sm p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-center">
              <div 
                className="text-3xl font-heading mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                                  {studentData.progress}
              </div>
              <div 
                className="text-lg font-label mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Progress
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {getProgressLabel(studentData.progress)}
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-sm p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-center">
              <div 
                className="text-3xl font-heading mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                                  {studentData.leaderboardScore}%
              </div>
              <div 
                className="text-lg font-label mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Leaderboard
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                (Career Track Specific)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Learning Timeline */}
        <div 
          className="rounded-xl shadow-sm p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2 
            className="text-lg font-heading mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Learning Timeline:
          </h2>
          
          {/* Date Range Pickers */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          {/* Learning Levels */}
          <div className="space-y-6">
                        {studentData.learningTimeline && studentData.learningTimeline.length > 0 ? (
              studentData.learningTimeline.map((activity, index) => (
                <div 
                  key={index} 
                  className="rounded-lg p-4"
                  style={{
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-elevated)'
                  }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
                      <span className="text-blue-600 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {activity.type === 'learning' ? '📚' : activity.type === 'test' ? '📝' : '💻'}
                      </span>
                    </div>
                    <h3 
                      className="text-lg font-heading"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {activity.activity}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Date */}
                    <div className="flex items-center space-x-3">
                      <CalendarIcon 
                        className="w-5 h-5" 
                        style={{ color: 'var(--color-text-tertiary)' }} 
                      />
                      <span 
                        className="text-sm font-label"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Date:
                      </span>
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {new Date(activity.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    {/* Duration */}
                    <div className="flex items-center space-x-3">
                      <ClockIcon 
                        className="w-5 h-5" 
                        style={{ color: 'var(--color-text-tertiary)' }} 
                      />
                      <span 
                        className="text-sm font-label"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Duration:
                      </span>
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {activity.duration} minutes
                      </span>
                    </div>
                    
                    {/* Score */}
                    {activity.score && (
                      <div className="flex items-center space-x-3">
                        <TargetIcon 
                          className="w-5 h-5" 
                          style={{ color: 'var(--color-text-tertiary)' }} 
                        />
                        <span 
                          className="text-sm font-label"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Score:
                        </span>
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {activity.score}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No learning timeline data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
