import React from 'react';
import { DownloadIcon, GroupIcon as Users, TargetIcon as Target, ArrowTopRightIcon as TrendingUp, LayersIcon } from '@radix-ui/react-icons';
import { useAppDispatch } from '../redux/store';
import { useSelector } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import LevelProgressChart from '../components/LevelProgressChart';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#00B8D9', '#FFBB28', '#FF8042', '#A259F7', '#F95F62', '#00C49F'];

const AdminDashboard: React.FC = () => {
  const analyticsState = useSelector((state: any) => state.analytics);
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
  const levelProgress = analytics?.levelProgress?.levelProgress ?? [];
  const overallMetrics = analytics?.levelProgress?.overallMetrics ?? {
    totalStudents: 0,
    averageLevelReached: 0,
    overallCompletionRate: 0
  };

  if (!analytics) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <div className="text-center">
          <p 
            className="text-lg"
            style={{ color: 'var(--color-text-primary)' }}
          >
            No analytics data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 lg:p-8"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 
            className="text-3xl font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Analytics
          </h1>
          <p 
            className="mt-1 font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Comprehensive insights into platform performance
          </p>
        </div>
        <button
          onClick={exportData}
          className="bg-trueturquoise px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
          style={{ color: 'var(--color-text-inverse)' }}
        >
          <DownloadIcon className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Users className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Total Students</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{userCount}</p>
          </div>
        </div>
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Users className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Active Students</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{activeStudents}</p>
          </div>
        </div>
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <Target className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Completion Rate</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{completionRate}%</p>
            <p className="text-trueturquoise text-xs flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.1% from last month
            </p>
          </div>
        </div>
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="bg-trueturquoise/10 p-3 rounded-lg">
            <LayersIcon className="h-6 w-6 text-trueturquoise" />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Avg Level Reached</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{overallMetrics.averageLevelReached}</p>
            <p className="text-trueturquoise text-xs flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {overallMetrics.overallCompletionRate}% completed levels
            </p>
          </div>
        </div>
      </div>

      {/* Level Progress Section */}
      <div className="mb-12">
        <LevelProgressChart 
          levelProgress={levelProgress}
          overallMetrics={overallMetrics}
          loading={analyticsLoading}
        />
      </div>

      {/* Students by Track Pie Chart */}
      <div 
        className="rounded-xl shadow-sm p-8 mb-12 flex flex-col items-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h2 
          className="text-lg font-semibold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >Students by Track</h2>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={trackDistribution}
                  dataKey="count"
                  nameKey="track"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  labelLine={false}
                  label={false}
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
                  fontSize="38"
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
                  fontSize="16"
                  fill="#A0AEC0"
                  style={{ pointerEvents: 'none', fontWeight: 400, opacity: 0.7 }}
                >
                  students
                </text>
                <RechartsTooltip
                  contentStyle={{ background: '#181F2A', border: 'none', borderRadius: 8, color: '#fff', boxShadow: '0 2px 8px #00B8D955' }}
                  itemStyle={{ color: '#00B8D9' }}
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
                <span 
                  className="text-xs font-medium opacity-80"
                  style={{ color: 'var(--color-text-primary)' }}
                >{entry.track}</span>
                <span 
                  className="text-xs ml-1 opacity-60"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >({entry.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Bar Chart: Students per Track */}
      <div 
        className="rounded-xl shadow-sm p-8 mb-12 flex flex-col items-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h2 
          className="text-lg font-semibold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >Students per Track</h2>
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trackDistribution} barCategoryGap={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#22283122" />
              <XAxis dataKey="track" tick={{ fill: '#A0AEC0', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <RechartsTooltip
                contentStyle={{ background: '#181F2A', border: 'none', borderRadius: 8, color: '#fff', boxShadow: '0 2px 8px #00B8D955' }}
                itemStyle={{ color: '#00B8D9' }}
                cursor={{ fill: '#00B8D922' }}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 8, 8]}
                minPointSize={2}
                isAnimationActive={true}
              >
                {trackDistribution.map((entry: any, idx: number) => (
                  <Cell
                    key={`bar-cell-${idx}`}
                    fill={`url(#barGradient${idx})`}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={0.5}
                  />
                ))}
              </Bar>
              {/* Gradients for bars */}
              <defs>
                {trackDistribution.map((entry: any, idx: number) => (
                  <linearGradient id={`barGradient${idx}`} key={idx} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.85} />
                    <stop offset="100%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.45} />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;