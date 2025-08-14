import React, { useState, useEffect } from 'react';
import {
  ReloadIcon,
  ExclamationTriangleIcon,
  TargetIcon as Target,
  ArrowTopRightIcon as TrendingUp
} from '@radix-ui/react-icons';

import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer
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
    } catch (error: unknown) {
      alert(`Failed to refresh data: ${(error as Error).message}. Please try again.`);
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
            className="mt-4 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            style={{ color: 'var(--color-text-inverse)' }}
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
            className="mt-4 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            style={{ color: 'var(--color-text-inverse)' }}
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
    <div 
      className="space-y-8 min-h-screen p-4 lg:p-8"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
          className="text-3xl font-heading"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Analytics Dashboard
        </h1>
          <p className="mt-1 font-label" style={{ color: 'var(--color-text-secondary)' }}>Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-teallight rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise focus:border-transparent"
            style={{ 
              backgroundColor: 'var(--color-secondary-bg)',
              color: 'var(--color-text-primary)'
            }}
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
            <ReloadIcon className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <button
            onClick={exportData}
            className="bg-trueturquoise px-4 py-2 rounded-lg hover:bg-teallight transition-colors flex items-center"
            style={{ color: 'var(--color-text-inverse)' }}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export
          </button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Students</p>
              <p 
                className="text-3xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {analytics.totalStudents}
              </p>
              <p className="text-trueturquoise text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.1% from last month
              </p>
            </div>
            <div className="bg-teallight/10 p-3 rounded-lg">
              <svg className="h-6 w-6 text-trueturquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h-2a2 2 0 01-2-2V3a1 1 0 011-1h4a1 1 0 011 1v15a2 2 0 01-2 2zM7 20H5a2 2 0 01-2-2V9a1 1 0 011-1h4a1 1 0 011 1v9a2 2 0 01-2 2z"></path></svg>
            </div>
          </div>
        </div>
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Active Students</p>
              <p 
                className="text-3xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {analytics.activeStudents}
              </p>
              <p className="text-trueturquoise text-sm flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.2% from last month
              </p>
            </div>
            <div className="bg-rust/10 p-3 rounded-lg">
              <svg className="h-6 w-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h-2a2 2 0 01-2-2V3a1 1 0 011-1h4a1 1 0 011 1v15a2 2 0 01-2 2zM7 20H5a2 2 0 01-2-2V9a1 1 0 011-1h4a1 1 0 011 1v9a2 2 0 01-2 2z"></path></svg>
            </div>
          </div>
        </div>
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teallight text-sm">Completion Rate</p>
              <p 
                className="text-3xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {performanceMetrics.completionRate}%
              </p>
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
        {typeof performanceMetrics.studentRetention === 'number' && (
          <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teallight text-sm">Student Retention</p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {performanceMetrics.studentRetention}%
                </p>
                <p className="text-trueturquoise text-sm flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +1.2% from last month
                </p>
              </div>
              <div className="bg-rust/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h-2a2 2 0 01-2-2V3a1 1 0 011-1h4a1 1 0 011 1v15a2 2 0 01-2 2zM7 20H5a2 2 0 01-2-2V9a1 1 0 011-1h4a1 1 0 011 1v9a2 2 0 01-2 2z"></path></svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Students by Track Pie Chart */}
      <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6">
        <h2 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Students by Track
        </h2>
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
              {(analytics.trackDistribution || []).map((_: unknown, index: number) => (
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