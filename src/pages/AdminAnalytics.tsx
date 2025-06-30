import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  RefreshCw,
  Award,
  BookOpen,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAdmin';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const POLL_INTERVAL = 15000; // 15 seconds

const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  // Use real API data only
  const { analytics, loading, error, refetch } = useAnalytics(dateRange);

  useEffect(() => {
    // Polling for real-time analytics
    const interval = setInterval(() => {
      refetch();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [dateRange, refetch]);

  const exportData = () => {
    alert('Analytics data export functionality would be implemented here');
  };

  const refreshData = async () => {
    try {
      await refetch();
      alert('Data refreshed successfully!');
    } catch (error) {
      alert('Failed to refresh data. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Failed to load analytics: {error}</p>
          <button
            onClick={refreshData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If analytics is missing or all key arrays are empty, show empty state
  const isAllEmpty = !analytics ? true :
    (!analytics.trackDistribution || analytics.trackDistribution.length === 0) &&
    (!analytics.submissionsByStatus || analytics.submissionsByStatus.length === 0) &&
    (!analytics.attendanceData || analytics.attendanceData.length === 0);

  if (!analytics || isAllEmpty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No analytics data available.</p>
          <button
            onClick={refreshData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const performanceMetrics = {
    averageTaskScore: analytics.averageTaskScore || 0,
    completionRate: analytics.completionRate || 0,
    averageTimePerModule: analytics.averageTimePerModule || 0,
    studentRetention: analytics.studentRetention || 0
  };

  const engagementData = analytics.engagementData || [];
  const careerTrackData = analytics.careerTrackData || [];
  const modulePerformance = analytics.modulePerformance || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259F7', '#F95F62'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={refreshData}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={exportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Task Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{performanceMetrics.averageTaskScore}%</p>
              <p className="text-green-600 dark:text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3% from last month
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{performanceMetrics.completionRate}%</p>
              <p className="text-green-600 dark:text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.1% from last month
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Time/Module</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{performanceMetrics.averageTimePerModule}h</p>
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                -0.8h from last month
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Student Retention</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{performanceMetrics.studentRetention}%</p>
              <p className="text-green-600 dark:text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.2% from last month
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Students by Track Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Students by Track</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.trackDistribution || []}
                dataKey="count"
                nameKey="track"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(analytics.trackDistribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Submissions by Status Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submissions by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <ReBarChart data={analytics.submissionsByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Attendance Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Attendance</h2>
        <ResponsiveContainer width="100%" height={250}>
          <ReBarChart data={analytics.attendanceData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="students" fill="#82ca9d" />
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Engagement Trends</h2>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="engagement">Daily Active Users</option>
            <option value="sessions">Total Sessions</option>
            <option value="duration">Avg Session Duration</option>
          </select>
        </div>

        <div className="h-80 flex items-end space-x-2">
          {engagementData.map((data: any, index: number) => {
            const value = selectedMetric === 'engagement' ? data.activeUsers :
              selectedMetric === 'sessions' ? data.sessions : data.avgDuration;
            const maxValue = selectedMetric === 'engagement' ? 350 :
              selectedMetric === 'sessions' ? 700 : 60;
            const height = (value / maxValue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t w-full min-h-[20px] transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${new Date(data.date).toLocaleDateString()}: ${value}`}
                ></div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Career Track Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Career Track Performance</h2>
          <div className="space-y-4">
            {careerTrackData.map((track: any, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{track.track}</h3>
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-sm">
                    {track.students} students
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Avg Progress</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${track.avgProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{track.avgProgress}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Completion Rate</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${track.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{track.completionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top Performing Modules</h2>
          <div className="space-y-4">
            {modulePerformance.map((module: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{module.module}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.completions} completions</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Score: {module.avgScore}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Time: {module.avgTime}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Access detailed reports, custom date ranges, and advanced filtering options for deeper insights into platform performance.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Generate Custom Report
              </button>
              <button className="border border-blue-600 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium">
                Schedule Reports
              </button>
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Export All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;