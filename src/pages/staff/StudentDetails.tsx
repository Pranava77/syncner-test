import React, { useState } from 'react';
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

// Mock student data matching wireframe structure
const mockStudent = {
  rollNumber: '713315104704',
  courseDept: 'B.E IT',
  name: 'Ramesh',
  batch: '2023-2027',
  careerTrack: 'Full Stack Development',
  enrolledDate: '21-03-2025',
  attendance: 80,
  progress: 80,
  leaderboard: 80,
  performance: {
    performance: 75,
    potential: 85,
    contribution: 70,
    creativity: 90,
    skill: 80
  },
  learningLevels: [
    {
      level: 3,
      title: 'Introduction to HTML',
      status: 'in-progress',
      learn: {
        completed: true,
        startDate: '10-08-2025 10:00 AM',
        endDate: '12-08-2025 11:00 AM'
      },
      test: {
        completed: true,
        score: 80,
        attempts: 2,
        startDate: '13-08-2025 02:00 PM',
        endDate: '13-08-2025 03:00 PM'
      },
      exercise: {
        completed: false,
        startDate: '14-08-2025 09:03 PM',
        endDate: 'In-Progress'
      }
    },
    {
      level: 2,
      title: 'Introduction to HTML',
      status: 'completed',
      learn: {
        completed: true,
        startDate: '05-08-2025 09:00 AM',
        endDate: '07-08-2025 10:00 AM'
      },
      test: {
        completed: true,
        score: 85,
        attempts: 2,
        startDate: '08-08-2025 01:00 PM',
        endDate: '08-08-2025 02:00 PM'
      },
      exercise: {
        completed: true,
        startDate: '09-08-2025 09:00 AM',
        endDate: '09-08-2025 10:00 AM'
      }
    },
    {
      level: 1,
      title: 'Introduction to HTML',
      status: 'completed',
      learn: {
        completed: true,
        startDate: '01-08-2025 09:00 AM',
        endDate: '03-08-2025 10:00 AM'
      },
      test: {
        completed: true,
        score: 90,
        attempts: 2,
        startDate: '04-08-2025 01:00 PM',
        endDate: '04-08-2025 02:00 PM'
      },
      exercise: {
        completed: true,
        startDate: '05-08-2025 09:00 AM',
        endDate: '05-08-2025 10:00 AM'
      }
    }
  ]
};

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Radar chart data for performance metrics
  const radarData = [
    { metric: 'Performance', value: mockStudent.performance.performance },
    { metric: 'Potential', value: mockStudent.performance.potential },
    { metric: 'Contribution', value: mockStudent.performance.contribution },
    { metric: 'Creativity', value: mockStudent.performance.creativity },
    { metric: 'Skill', value: mockStudent.performance.skill }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-yellow-600';
      default:
        return 'text-gray-400';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/staff/students')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Student Details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Student Details + Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Student Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Student Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Roll Number:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockStudent.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Course & Dept:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockStudent.courseDept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Student Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Batch:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockStudent.batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enrolled Career Track:</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                  {mockStudent.careerTrack}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enrolled Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockStudent.enrolledDate}</span>
              </div>
            </div>
          </div>

          {/* Right: Performance Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              (Optional)
            </div>
            
            <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              View Portfolio
            </button>
          </div>
        </div>

        {/* Middle Section: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockStudent.attendance}%
              </div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attendance
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {getAttendanceLabel(mockStudent.attendance)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockStudent.progress}
              </div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                Progress
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {getProgressLabel(mockStudent.progress)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockStudent.leaderboard}%
              </div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leaderboard
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                (Career Track Specific)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Learning Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Learning Timeline:
          </h2>
          
          {/* Date Range Pickers */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Learning Levels */}
          <div className="space-y-6">
            {mockStudent.learningLevels.map((level, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusIcon(level.status)}
                  <h3 className={`text-lg font-semibold ${getStatusColor(level.status)}`}>
                    Level {level.level}: {level.title}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Learn */}
                  <div className="flex items-center space-x-3">
                    <CheckCircledIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Learn:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {level.learn.startDate} -- {level.learn.endDate}
                    </span>
                  </div>
                  
                  {/* Test */}
                  <div className="flex items-center space-x-3">
                    <CheckCircledIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Test:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      ({level.test.score}% - {level.test.attempts} attempts) {level.test.startDate} -- {level.test.endDate}
                    </span>
                  </div>
                  
                  {/* Exercise */}
                  <div className="flex items-center space-x-3">
                    {level.exercise.completed ? (
                      <CheckCircledIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">Exercise:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {level.exercise.startDate} -- {level.exercise.endDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
