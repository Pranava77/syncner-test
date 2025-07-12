import React, { useState, useEffect } from 'react';
import {
  BarChartIcon,
  ReloadIcon,
  ReaderIcon,
  ExclamationTriangleIcon,
  StarFilledIcon as Award,
  TargetIcon as Target,
  ClockIcon as Clock,
  GroupIcon as Users,
  ArrowTopRightIcon as TrendingUp
} from '@radix-ui/react-icons';

import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';
import { useAppDispatch } from '../redux/store';
import LoadingScreen from '../components/LoadingScreen';
import { useSelector } from 'react-redux';


const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  const dispatch = useAppDispatch();
  const analyticsState = useSelector((state: any) => state.analytics);
  const analytics = analyticsState.data;
  const loading = analyticsState.loading;
  const error = analyticsState.error;

  useEffect(() => {
    // Only fetch if not present or if dateRange changes
    if (analyticsState.lastFetched === null) {
      dispatch(fetchAnalytics(dateRange));
    }
  }, [dateRange, analyticsState.lastFetched, dispatch]);

  const exportData = () => {
    alert('Analytics data export functionality would be implemented here');
  };

  const refreshData = async () => {
    try {
      await dispatch(fetchAnalytics(dateRange)).unwrap();
      alert('Data refreshed successfully!');
    } catch (error) {
      alert('Failed to refresh data. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <LoadingScreen 
        message="Loading analytics..."
        showProgress={true}
        progressDuration={1600}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-4" />
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
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
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
    <div className="space-y-8 bg-offblack min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-paperwhite">Analytics Dashboard</h1>
          <p className="text-teallight mt-1">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-teallight rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise focus:border-transparent bg-offblack text-paperwhite placeholder-teallight"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={refreshData}
            className="p-2 border border-teallight rounded-lg hover:bg-teallight/20 transition-colors"
          >
            <ReloadIcon className="h-4 w-4 text-teallight" />
          </button>
          <button
            onClick={exportData}
            className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight hover:text-offblack transition-colors font-medium flex items-center"
          >
            <ReaderIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teallight text-sm">Avg Task Score</p>
              <p className="text-3xl font-bold text-paperwhite">{performanceMetrics.averageTaskScore}%</p>
              <p className="text-trueturquoise text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3% from last month
              </p>
            </div>
            <div className="bg-teallight/10 p-3 rounded-lg">
              <Award className="h-6 w-6 text-trueturquoise" />
            </div>
          </div>
        </div>

        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teallight text-sm">Completion Rate</p>
              <p className="text-3xl font-bold text-paperwhite">{performanceMetrics.completionRate}%</p>
              <p className="text-trueturquoise text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.1% from last month
              </p>
            </div>
            <div className="bg-teallight/10 p-3 rounded-lg">
              <Target className="h-6 w-6 text-trueturquoise" />
            </div>
          </div>
        </div>

        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teallight text-sm">Avg Time/Module</p>
              <p className="text-3xl font-bold text-paperwhite">{performanceMetrics.averageTimePerModule}h</p>
              <p className="text-rust text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                -0.8h from last month
              </p>
            </div>
            <div className="bg-teallight/10 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-trueturquoise" />
            </div>
          </div>
        </div>

        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teallight text-sm">Student Retention</p>
              <p className="text-3xl font-bold text-paperwhite">{performanceMetrics.studentRetention}%</p>
              <p className="text-trueturquoise text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.2% from last month
              </p>
            </div>
            <div className="bg-rust/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-rust" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Students by Track Pie Chart */}
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-paperwhite mb-4">Students by Track</h2>
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
                {(analytics.trackDistribution || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Submissions by Status Bar Chart */}
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-paperwhite mb-4">Submissions by Status</h2>
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
      <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-paperwhite mb-4">Weekly Attendance</h2>
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
      <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-paperwhite">Engagement Trends</h2>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-teallight rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise focus:border-transparent bg-offblack text-paperwhite placeholder-teallight"
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
                  <p className="text-sm font-medium text-paperwhite">{value}</p>
                  <p className="text-xs text-teallight">
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
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-paperwhite mb-6">Career Track Performance</h2>
          <div className="space-y-4">
            {careerTrackData.map((track: any, index: number) => (
              <div key={index} className="border border-teallight rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-paperwhite">{track.track}</h3>
                  <span className="bg-trueturquoise/10 text-trueturquoise px-2 py-1 rounded text-sm">
                    {track.students} students
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-teallight">Avg Progress</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-teallight rounded-full h-2 mr-2">
                        <div
                          className="bg-trueturquoise h-2 rounded-full"
                          style={{ width: `${track.avgProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-paperwhite font-medium">{track.avgProgress}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-teallight">Completion Rate</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-teallight rounded-full h-2 mr-2">
                        <div
                          className="bg-trueturquoise h-2 rounded-full"
                          style={{ width: `${track.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-paperwhite font-medium">{track.completionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Performance */}
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-paperwhite mb-6">Top Performing Modules</h2>
          <div className="space-y-4">
            {modulePerformance.map((module: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border border-teallight rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                    <ReaderIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-paperwhite">{module.module}</h3>
                    <p className="text-sm text-teallight">{module.completions} completions</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-paperwhite">Score: {module.avgScore}%</p>
                  <p className="text-xs text-teallight">Time: {module.avgTime}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="bg-paperwhite/10 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <BarChartIcon className="h-6 w-6 text-trueturquoise" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-paperwhite mb-2">Advanced Analytics</h3>
            <p className="text-teallight text-sm mb-4">
              Access detailed reports, custom date ranges, and advanced filtering options for deeper insights into platform performance.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight hover:text-offblack transition-colors text-sm font-medium">
                Generate Custom Report
              </button>
              <button className="border border-trueturquoise text-trueturquoise px-4 py-2 rounded-lg hover:bg-trueturquoise/10 transition-colors text-sm font-medium">
                Schedule Reports
              </button>
              <button className="border border-teallight text-paperwhite px-4 py-2 rounded-lg hover:bg-teallight/10 transition-colors text-sm font-medium">
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