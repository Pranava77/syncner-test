import React from 'react';
import { BarChartIcon as BarChart3, DownloadIcon, GroupIcon as Users, TargetIcon as Target, ArrowTopRightIcon as TrendingUp } from '@radix-ui/react-icons';
import { useAppDispatch } from '../redux/store';
import { useSelector } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00B8D9', '#FFBB28', '#FF8042', '#A259F7', '#F95F62', '#00C49F'];

const AdminDashboard: React.FC = () => {
  const analyticsState = useSelector((state: { analytics: any }) => state.analytics);
  const analytics = analyticsState.data;
  const analyticsLoading = analyticsState.loading;
  const dispatch = useAppDispatch();

  const exportData = () => {
    alert('CSV export functionality would be implemented here');
  };

  React.useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (analyticsLoading) {
    return <LoadingScreen message="Loading analytics..." />;
  }

  // Fallbacks for missing analytics
  const userCount = analytics?.userCount ?? 0;
  const activeStudents = analytics?.activeStudents ?? 0;
  const completionRate = analytics?.completionRate ?? 0;
  const studentRetention = analytics?.studentRetention ?? 0;
  const trackDistribution = analytics?.trackDistribution ?? [];

  return (
    <div className="min-h-screen bg-offblack p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl  text-paperwhite font-heading">Admin Dashboard</h1>
          <p className="text-teallight mt-1 font-label">Monitor student progress and performance</p>
        </div>
        <button
          onClick={exportData}
          className="bg-trueturquoise text-offblack px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
        >
          <DownloadIcon className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-paperwhite/10 mb-8">
        <nav className="flex space-x-8">
          <button
            className={
              'flex items-center gap-2 px-4 py-2 text-lg font-medium rounded-t-lg transition-colors duration-150 text-trueturquoise border-b-2 border-trueturquoise bg-offblack'
            }
            disabled
          >
            <BarChart3 className="w-5 h-5" />
            Overview
          </button>
        </nav>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Users className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p className="text-teallight text-sm">Total Users</p>
            <p className="text-2xl font-bold text-paperwhite">{userCount}</p>
          </div>
        </div>
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Users className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p className="text-teallight text-sm">Active Students</p>
            <p className="text-2xl font-bold text-paperwhite">{activeStudents}</p>
          </div>
        </div>
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Target className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p className="text-teallight text-sm">Completion Rate</p>
            <p className="text-2xl font-bold text-paperwhite">{completionRate}%</p>
            <p className="text-trueturquoise text-xs flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.1% from last month
            </p>
          </div>
        </div>
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Target className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p className="text-teallight text-sm">Student Retention</p>
            <p className="text-2xl font-bold text-paperwhite">{studentRetention}%</p>
            <p className="text-trueturquoise text-xs flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1.2% from last month
            </p>
          </div>
        </div>
      </div>

      {/* Students by Track Pie Chart */}
      <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6 mb-10">
        <h2 className="text-lg font-semibold text-paperwhite mb-4">Students by Track</h2>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={trackDistribution}
                dataKey="count"
                nameKey="track"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {trackDistribution.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;