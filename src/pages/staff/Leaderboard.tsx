import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  PersonIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TargetIcon,
  CheckIcon,
  PlayIcon,
  FileTextIcon,
  BarChartIcon as ChartIcon
} from '@radix-ui/react-icons';
import syncnerLogo from '../../assets/syncner-logo.png';

const StudentProfile: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Mock student data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setStudentData({
        rollNumber: '713315104704',
        name: 'Ramesh',
        careerTrack: 'Full Stack Development',
        enrolledDate: '21-03-2025',
        courseDept: 'B.E / IT',
        batch: '2023-2027',
        performance: {
          performance: 85,
          communication: 78,
          collaboration: 92,
          problemSolving: 88,
          creativity: 75
        },
        attendance: 80,
        progress: 80,
        leaderboardRank: 80,
        timeline: [
          {
            level: 3,
            title: 'Introduction to HTML',
            learn: { status: 'completed', attempts: 1, score: null, startDate: '10/08/2025 10:00 AM', endDate: '10/08/2025 11:30 AM' },
            test: { status: 'completed', attempts: 2, score: 80, startDate: '12/08/2025 02:00 PM', endDate: '12/08/2025 03:00 PM' },
            exercise: { status: 'in-progress', attempts: null, score: null, startDate: '14/08/2025 00:03 PM', endDate: null }
          },
          {
            level: 2,
            title: 'Introduction to HTML',
            learn: { status: 'completed', attempts: 1, score: null, startDate: '05/08/2025 09:00 AM', endDate: '05/08/2025 10:30 AM' },
            test: { status: 'completed', attempts: 2, score: 85, startDate: '07/08/2025 01:00 PM', endDate: '07/08/2025 02:00 PM' },
            exercise: { status: 'completed', attempts: null, score: null, startDate: '08/08/2025 11:00 AM', endDate: '08/08/2025 12:30 PM' }
          },
          {
            level: 1,
            title: 'Introduction to HTML',
            learn: { status: 'completed', attempts: 1, score: null, startDate: '01/08/2025 08:00 AM', endDate: '01/08/2025 09:30 AM' },
            test: { status: 'completed', attempts: 2, score: 90, startDate: '03/08/2025 12:00 PM', endDate: '03/08/2025 01:00 PM' },
            exercise: { status: 'completed', attempts: null, score: null, startDate: '04/08/2025 10:00 AM', endDate: '04/08/2025 11:30 AM' }
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'var(--color-success)';
    if (score >= 80) return 'var(--color-accent-primary)';
    if (score >= 70) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return 'Great';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Poor';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <PlayIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <motion.img
            src={syncnerLogo}
            alt="Syncner Logo"
            className="w-16 h-16 mx-auto mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading student profile...
          </p>
        </div>
      </div>
    );
  }

  if (!studentData) {
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
      {/* Breadcrumbs */}
      <div className="p-6 pb-4">
        <nav className="flex items-center space-x-2 text-sm">
          <span style={{ color: 'var(--color-text-tertiary)' }}>Staffs</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>Student Profile</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{studentData.name}</span>
        </nav>
      </div>

      {/* Header with Search */}
      <div className="px-6 pb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Student Profile
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Student..."
              className="pl-10 pr-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'var(--color-text-inverse)' }}>
            M
          </div>
        </div>
      </div>

      <div className="flex gap-6 px-6">
        {/* Left Sub-Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
              Staffs → Student Timeline
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                Dashboard
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors" style={{ 
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)'
              }}>
                Leaderboards
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                Staff Profile
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                Sign-out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Student Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Student Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Roll number
                  </label>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.rollNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Student Name
                  </label>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Enrolled Career Track
                  </label>
                  <p className="text-sm px-3 py-1 rounded-full inline-block" style={{ 
                    backgroundColor: '#8B5CF6',
                    color: 'white'
                  }}>
                    {studentData.careerTrack}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Enrolled Date
                  </label>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.enrolledDate}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Course & Dept
                  </label>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.courseDept}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Batch
                  </label>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {studentData.batch}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Performance Metrics
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-center">
                  <ChartIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Performance Radar Chart
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    Performance: {studentData.performance.performance}% | 
                    Communication: {studentData.performance.communication}% | 
                    Collaboration: {studentData.performance.collaboration}% | 
                    Problem Solving: {studentData.performance.problemSolving}% | 
                    Creativity: {studentData.performance.creativity}%
                  </p>
                </div>
              </div>
            </div>

            {/* View Portfolio Button */}
            <button className="px-6 py-2 rounded-lg transition-colors font-medium" style={{ 
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)' 
            }}>
              View Portfolio
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: getPerformanceColor(studentData.attendance) }}>
                {studentData.attendance}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Avg Attendance ({getPerformanceLabel(studentData.attendance)})
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: getPerformanceColor(studentData.progress) }}>
                {studentData.progress}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Progress ({getPerformanceLabel(studentData.progress)})
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: getPerformanceColor(studentData.leaderboardRank) }}>
                {studentData.leaderboardRank}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Leaderboard (Career Track Specific)
              </div>
            </div>
          </div>

          {/* Learning Timeline Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Learning Timeline
            </h2>
            
            {/* Date Range Pickers */}
            <div className="flex gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  From:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="dd-mm-yyyy"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border text-sm w-32"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  To:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="dd-mm-yyyy"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border text-sm w-32"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
              </div>
            </div>

            {/* Course Levels */}
            <div className="space-y-6">
              {studentData.timeline.map((level: any, index: number) => (
                <div key={level.level} className="border rounded-lg p-4" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Level {level.level}: {level.title}
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Learn */}
                    <div className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(level.learn.status)}
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Learn
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {level.learn.startDate} — {level.learn.endDate}
                      </div>
                    </div>

                    {/* Test */}
                    <div className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(level.test.status)}
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Test ({level.test.score}% - {level.test.attempts} attempts)
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {level.test.startDate} — {level.test.endDate}
                      </div>
                    </div>

                    {/* Exercise */}
                    <div className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(level.exercise.status)}
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Exercise
                        </span>
                        {level.exercise.status === 'in-progress' && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ 
                            backgroundColor: 'var(--color-accent-tertiary)',
                            color: 'var(--color-accent-primary)'
                          }}>
                            In-Progress
                          </span>
                        )}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {level.exercise.startDate}
                        {level.exercise.endDate && ` — ${level.exercise.endDate}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
