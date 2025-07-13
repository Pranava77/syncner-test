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
    (!analytics.trackDistribution || analytics.trackDistribution.length === 0);

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
    completionRate: analytics.completionRate || 0,
    studentRetention: analytics.studentRetention || 0
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259F7', '#F95F62'];

  return (
    <div className="space-y-8 bg-offblack min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl  text-paperwhite font-heading">Analytics Dashboard</h1>
          <p className="text-teallight mt-1 font-label">Comprehensive insights into platform performance</p>
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
            className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight hover:text-offblack transition-colors flex items-center"
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
    </div>
  );
};

export default AdminAnalytics;