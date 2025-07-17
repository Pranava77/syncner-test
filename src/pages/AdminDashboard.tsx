import React from 'react';
import { BarChartIcon as BarChart3, DownloadIcon, GroupIcon as Users, TargetIcon as Target, ArrowTopRightIcon as TrendingUp } from '@radix-ui/react-icons';
import { useAppDispatch } from '../redux/store';
import { useSelector } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00B8D9', '#FFBB28', '#FF8042', '#A259F7', '#F95F62', '#00C49F'];

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-[#181F2A] border-none rounded-lg px-4 py-2 shadow-lg mt-2 text-left min-w-[120px]" style={{ color: '#fff' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: entry.color || '#00B8D9' }}></span>
          <span className="font-semibold text-paperwhite text-sm">{entry.track}</span>
        </div>
        <div className="text-xs text-teallight">{entry.count} students</div>
      </div>
    );
  }
  return null;
};

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
  const userCount = analytics?.totalStudents ?? 0;
  const activeStudents = analytics?.activeStudents ?? 0;
  const completionRate = analytics?.completionRate ?? 0;
  const studentRetention = analytics?.studentRetention;
  const trackDistribution = analytics?.trackDistribution ?? [];

  if (!analytics) {
    return (
      <div className="min-h-screen bg-offblack flex items-center justify-center">
        <div className="text-center">
          <p className="text-paperwhite text-lg">No analytics data available.</p>
        </div>
      </div>
    );
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

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-paperwhite/10 rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Users className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p className="text-teallight text-sm">Total Students</p>
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
        {typeof studentRetention === 'number' && (
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
        )}
      </div>

      {/* Students by Track Pie Chart */}
      <div className="bg-paperwhite/10 rounded-xl shadow-sm p-8 mb-12 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-paperwhite mb-6">Students by Track</h2>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={trackDistribution.map((entry: any, idx: number) => ({ ...entry, color: COLORS[idx % COLORS.length] + '99' }))}
                  dataKey="count"
                  nameKey="track"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  labelLine={false}
                  label={({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, index }) => {
                    if (typeof percent !== 'number' || percent < 0.12) return null;
                    if (typeof midAngle !== 'number' || typeof index !== 'number' || !trackDistribution[index]) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#00B8D9"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={500}
                        style={{ opacity: 0.8 }}
                      >
                        {trackDistribution[index]?.track}
                      </text>
                    );
                  }}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                  stroke="#181F2A"
                  strokeWidth={1}
                >
                  {trackDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length] + '99'}
                    />
                  ))}
                </Pie>
                {/* Minimal Center Label */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="26"
                  fontWeight="bold"
                  fill="#00B8D9"
                  style={{ pointerEvents: 'none', opacity: 0.95 }}
                >
                  {userCount}
                </text>
                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#A0AEC0"
                  style={{ pointerEvents: 'none', fontWeight: 400, opacity: 0.7 }}
                >
                  students
                </text>
                <RechartsTooltip
                  content={<CustomPieTooltip />}
                  wrapperStyle={{ top: 240, left: '50%', transform: 'translateX(-50%)' }}
                  cursor={{ fill: '#00B8D922' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap sm:flex-nowrap flex-col sm:flex-row justify-center items-center gap-4 mt-8 w-full">
            {trackDistribution.map((entry: any, idx: number) => (
              <div
                key={entry.track}
                className="flex items-center gap-2 group transition-all"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full transition-all group-hover:shadow-lg"
                  style={{ background: COLORS[idx % COLORS.length] + 'cc' }}
                ></span>
                <span className="text-paperwhite text-xs font-medium opacity-80">{entry.track}</span>
                <span className="text-teallight text-xs ml-1 opacity-60">({entry.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;