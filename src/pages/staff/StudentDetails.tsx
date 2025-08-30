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

// Mock student data matching wireframe structure
const mockStudent = {
  _id: '713315104704',
  name: 'Ramesh',
  email: 'ramesh@example.com',
  careerTrack: 'Full Stack Development',
  level: 'Intermediate',
  progress: 80,
  status: 'active' as const,
  lastActive: '2024-01-15T10:30:00Z',
  totalPoints: 2847,
  streakDays: 7,
  college: 'Tech University',
  department: 'B.E IT',
  batch: '2023-2027',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  currentStreak: 7,
  longestStreak: 12,
  attendancePercentage: 80,
  totalDays: 45,
  presentDays: 38,
  leaderboardScore: 80,
  enrolledDate: '21-03-2025',
  performance: {
    performance: 75,
    potential: 85,
    contribution: 70,
    creativity: 90,
    skill: 80,
    teamwork: 82
  },
  summaryStats: {
    totalLevels: 10,
    completedLevels: 7,
    currentLevel: 8,
    completionRate: 70,
    consistency: 84,
    progress: 80,
    leaderboard: 80
  },
  learningTimeline: [],
  dailyActivity: [],
  attendanceStats: {
    totalDays: 45,
    presentDays: 38,
    currentStreak: 7,
    longestStreak: 12
  },
  skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
  recommendedRoles: ['Frontend Developer', 'Full Stack Engineer', 'DevOps Engineer'],
  learningTimeline: [
    {
      level: 3,
      courseName: 'Introduction to HTML',
      description: 'HTML Fundamentals',
      status: 'in-progress' as const,
      learn: {
        completed: true,
        startTime: '10-08-2025 10:00 AM',
        endTime: '12-08-2025 11:00 AM'
      },
      test: {
        completed: true,
        score: 80,
        attempts: 2,
        startTime: '13-08-2025 02:00 PM',
        endTime: '13-08-2025 03:00 PM'
      },
      exercise: {
        completed: false,
        startTime: '14-08-2025 09:03 PM',
        endTime: 'In-Progress'
      }
    },
    {
      level: 2,
      courseName: 'Introduction to HTML',
      description: 'HTML Fundamentals',
      status: 'completed' as const,
      learn: {
        completed: true,
        startTime: '05-08-2025 09:00 AM',
        endTime: '07-08-2025 10:00 AM'
      },
      test: {
        completed: true,
        score: 85,
        attempts: 2,
        startTime: '08-08-2025 01:00 PM',
        endTime: '08-08-2025 02:00 PM'
      },
      exercise: {
        completed: true,
        startTime: '09-08-2025 09:00 AM',
        endTime: '09-08-2025 10:00 AM'
      }
    },
    {
      level: 1,
      courseName: 'Introduction to HTML',
      description: 'HTML Fundamentals',
      status: 'completed' as const,
      learn: {
        completed: true,
        startTime: '01-08-2025 09:00 AM',
        endTime: '03-08-2025 10:00 AM'
      },
      test: {
        completed: true,
        score: 90,
        attempts: 2,
        startTime: '04-08-2025 01:00 PM',
        endTime: '04-08-2025 02:00 PM'
      },
      exercise: {
        completed: true,
        startTime: '05-08-2025 09:00 AM',
        endTime: '05-08-2025 10:00 AM'
      }
    }
  ]
};

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

  // Use selectedStudent data or fallback to mock data
  const studentData = selectedStudent || mockStudent;
  
  // Debug logging
  console.log('StudentDetails - selectedStudent:', selectedStudent);
  console.log('StudentDetails - studentData:', studentData);
  console.log('StudentDetails - learningTimeline:', studentData.learningTimeline);

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
                {getProgressLabel(mockStudent.progress)}
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
              studentData.learningTimeline.map((level, index) => (
              <div 
                key={index} 
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-elevated)'
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusIcon(level.status)}
                  <h3 
                    className="text-lg font-heading"
                    style={getStatusColor(level.status)}
                  >
                    Level {level.level}: {level.courseName}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Learn */}
                  <div className="flex items-center space-x-3">
                    <CheckCircledIcon 
                      className="w-5 h-5" 
                      style={{ color: 'var(--color-success)' }} 
                    />
                    <span 
                      className="text-sm font-label"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Learn:
                    </span>
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {level.learn.startTime} -- {level.learn.endTime}
                    </span>
                  </div>
                  
                  {/* Test */}
                  <div className="flex items-center space-x-3">
                    <CheckCircledIcon 
                      className="w-5 h-5" 
                      style={{ color: 'var(--color-success)' }} 
                    />
                    <span 
                      className="text-sm font-label"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Test:
                    </span>
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      ({level.test.score}% - {level.test.attempts} attempts) {level.test.startTime} -- {level.test.endTime}
                    </span>
                  </div>
                  
                  {/* Exercise */}
                  <div className="flex items-center space-x-3">
                    {level.exercise.completed ? (
                      <CheckCircledIcon 
                        className="w-5 h-5" 
                        style={{ color: 'var(--color-success)' }} 
                      />
                    ) : (
                      <ClockIcon 
                        className="w-5 h-5" 
                        style={{ color: 'var(--color-warning)' }} 
                      />
                    )}
                    <span 
                      className="text-sm font-label"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Exercise:
                    </span>
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {level.exercise.startTime} -- {level.exercise.endTime}
                    </span>
                  </div>
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
