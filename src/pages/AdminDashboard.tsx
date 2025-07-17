import React from 'react';
import { BarChartIcon as BarChart3, DownloadIcon } from '@radix-ui/react-icons';
import { useAppDispatch } from '../redux/store';
import { useSelector } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';

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

      {/* Overview Tab Content */}
      {/* TODO: Add your analytics/overview widgets here */}
      <div>
        {/* Example: */}
        <pre className="text-paperwhite bg-paperwhite/10 rounded p-4 overflow-x-auto">
          {JSON.stringify(analytics, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AdminDashboard;