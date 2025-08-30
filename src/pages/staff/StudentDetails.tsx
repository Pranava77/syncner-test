import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  TargetIcon, 
  RocketIcon, 
  FileTextIcon, 
  HomeIcon,
  BarChartIcon,
  CheckCircledIcon,
  FrameIcon,
  StarIcon,
  CopyIcon,
  ArrowUpIcon,
  ActivityLogIcon,
  BookmarkIcon,
  CodeIcon,
  LightningBoltIcon,
  HeartIcon
} from '@radix-ui/react-icons';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

// Mock student data for demonstration
const mockStudent = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alex Johnson',
  email: 'alex.johnson@college.edu',
  college: 'Tech University',
  careerTrack: 'Full Stack Development',
  level: 'Intermediate',
  activeTodayMinutes: 241,
  profileComplete: 85,
  lastActive: '2024-01-15T10:30:00Z',
  interests: ['Web Development', 'AI/ML', 'Mobile Apps', 'Cloud Computing'],
  skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
  recommendedRoles: ['Frontend Developer', 'Full Stack Engineer', 'DevOps Engineer'],
  performance: {
    technical: 85,
    problemSolving: 78,
    creativity: 92,
    communication: 88,
    teamwork: 82,
    adaptability: 90
  },
  attendanceStats: {
    totalDays: 45,
    presentDays: 38,
    currentStreak: 7,
    longestStreak: 12
  },
  summaryStats: {
    totalPoints: 2847,
    consistency: 84,
    leaderboard: 12,
    levelProgress: 65
  },
  learningTimeline: [
    {
      date: '2024-01-15',
      activity: 'Completed React Fundamentals Module',
      type: 'learning',
      duration: 120,
      score: 92
    },
    {
      date: '2024-01-14',
      activity: 'Finished Node.js Backend Project',
      type: 'project',
      duration: 180,
      score: 88
    },
    {
      date: '2024-01-13',
      activity: 'Took Advanced JavaScript Test',
      type: 'test',
      duration: 45,
      score: 95
    },
    {
      date: '2024-01-12',
      activity: 'Completed CSS Grid Exercise',
      type: 'exercise',
      duration: 60,
      score: 90
    },
    {
      date: '2024-01-11',
      activity: 'Attended Web Development Workshop',
      type: 'workshop',
      duration: 90,
      score: null
    }
  ]
};

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated] = useState(new Date());

  // Calculate attendance percentage
  const calculateAttendancePercentage = () => {
    if (mockStudent.attendanceStats.totalDays === 0) return 0;
    return Math.round((mockStudent.attendanceStats.presentDays / mockStudent.attendanceStats.totalDays) * 100);
  };

  // Calculate leaderboard score
  const calculateLeaderboardScore = () => {
    return mockStudent.summaryStats.totalPoints + (mockStudent.attendanceStats.currentStreak * 10);
  };

  // Radar chart data for performance metrics
  const radarData = [
    { metric: 'Technical', value: mockStudent.performance.technical },
    { metric: 'Problem Solving', value: mockStudent.performance.problemSolving },
    { metric: 'Creativity', value: mockStudent.performance.creativity },
    { metric: 'Communication', value: mockStudent.performance.communication },
    { metric: 'Teamwork', value: mockStudent.performance.teamwork },
    { metric: 'Adaptability', value: mockStudent.performance.adaptability }
  ];

  // Radar chart data for summary overview
  const summaryRadarData = [
    { metric: 'Total Points', value: mockStudent.summaryStats.totalPoints / 30 },
    { metric: 'Consistency', value: mockStudent.summaryStats.consistency },
    { metric: 'Leaderboard', value: (100 - mockStudent.summaryStats.leaderboard) },
    { metric: 'Level Progress', value: mockStudent.summaryStats.levelProgress },
    { metric: 'Attendance', value: calculateAttendancePercentage() },
    { metric: 'Active Time', value: Math.min(mockStudent.activeTodayMinutes / 4, 100) }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'learning': return <BookmarkIcon className="w-4 h-4" />;
      case 'project': return <CodeIcon className="w-4 h-4" />;
      case 'test': return <FileTextIcon className="w-4 h-4" />;
      case 'exercise': return <TargetIcon className="w-4 h-4" />;
      case 'workshop': return <LightningBoltIcon className="w-4 h-4" />;
      default: return <ActivityLogIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'test': return 'bg-purple-100 text-purple-800';
      case 'exercise': return 'bg-orange-100 text-orange-800';
      case 'workshop': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mockStudent.name} • {mockStudent.careerTrack}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {isRefreshing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BarChartIcon className="w-4 h-4" />
                )}
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Info & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {mockStudent.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Student ID: {mockStudent._id}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Email: {mockStudent.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    College: {mockStudent.college}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Career Track: {mockStudent.careerTrack}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Current Level: {mockStudent.level}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${mockStudent.activeTodayMinutes > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {mockStudent.activeTodayMinutes > 0 ? 'Active Today' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Profile: {mockStudent.profileComplete}% Complete
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last Active: {getRelativeTime(mockStudent.lastActive)}
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mockStudent.interests.map((interest: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <CodeIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mockStudent.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Roles */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileTextIcon className="w-5 h-5 mr-2 text-green-500" />
                  Recommended Roles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mockStudent.recommendedRoles.map((role: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Performance Overview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockStudent.summaryStats.totalPoints.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <StarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consistency</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockStudent.summaryStats.consistency}%
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ArrowUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leaderboard</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      #{mockStudent.summaryStats.leaderboard}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <CopyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level Progress</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockStudent.summaryStats.levelProgress}%
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <RocketIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Attendance Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Attendance Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockStudent.attendanceStats.totalDays}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockStudent.attendanceStats.presentDays}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Present Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockStudent.attendanceStats.currentStreak}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockStudent.attendanceStats.longestStreak}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attendance Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateAttendancePercentage()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateAttendancePercentage()}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Learning Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-green-500" />
                Learning Timeline
              </h3>
              <div className="space-y-4">
                {mockStudent.learningTimeline.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {activity.activity}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(activity.date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {activity.duration} min
                        </span>
                        {activity.score && (
                          <span className="flex items-center">
                            <TargetIcon className="w-4 h-4 mr-1" />
                            Score: {activity.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Charts & Additional Info */}
          <div className="space-y-6">
            {/* Performance Metrics Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                Performance Metrics
              </h3>
              <div className="h-64">
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
            </motion.div>

            {/* Summary Overview Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TargetIcon className="w-5 h-5 mr-2 text-green-500" />
                Summary Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={summaryRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Summary"
                      dataKey="value"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                 <ActivityLogIcon className="w-5 h-5 mr-2 text-purple-500" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Today's Activity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {mockStudent.activeTodayMinutes} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Leaderboard Score</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calculateLeaderboardScore()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calculateAttendancePercentage()}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profile Completion</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {mockStudent.profileComplete}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
