import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  StarIcon,
  TargetIcon,
  BarChartIcon,
  RocketIcon,
  StarFilledIcon,
  CheckIcon,
  ArrowUpIcon,
  MixIcon
} from '@radix-ui/react-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [tracks, setTracks] = useState<string[]>([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          track: 'Backend',
          level: 'Advanced',
          progress: 90,
          score: 3200,
          rank: 1,
          trackRank: 1,
          achievements: ['Track Champion', 'Perfect Score', 'Speed Demon'],
          lastActive: '3 days ago',
          avatar: 'M'
        },
        {
          id: 2,
          name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          track: 'Full Stack',
          level: 'Advanced',
          progress: 88,
          score: 2980,
          rank: 2,
          trackRank: 1,
          achievements: ['Track Champion', 'Consistent Performer'],
          lastActive: '1 day ago',
          avatar: 'S'
        },
        {
          id: 3,
          name: 'John Doe',
          email: 'john.doe@example.com',
          track: 'Full Stack',
          level: 'Intermediate',
          progress: 75,
          score: 2450,
          rank: 3,
          trackRank: 2,
          achievements: ['First Place Quiz', 'Perfect Score', 'Early Bird'],
          lastActive: '2 hours ago',
          avatar: 'J'
        },
        {
          id: 4,
          name: 'Emily Chen',
          email: 'emily.chen@example.com',
          track: 'Frontend',
          level: 'Advanced',
          progress: 85,
          score: 2350,
          rank: 4,
          trackRank: 1,
          achievements: ['Track Champion', 'UI Expert'],
          lastActive: '5 hours ago',
          avatar: 'E'
        },
        {
          id: 5,
          name: 'David Kim',
          email: 'david.kim@example.com',
          track: 'Backend',
          level: 'Intermediate',
          progress: 70,
          score: 2200,
          rank: 5,
          trackRank: 2,
          achievements: ['Quick Learner', 'Problem Solver'],
          lastActive: '1 day ago',
          avatar: 'D'
        },
        {
          id: 6,
          name: 'Lisa Rodriguez',
          email: 'lisa.rodriguez@example.com',
          track: 'Full Stack',
          level: 'Intermediate',
          progress: 68,
          score: 2100,
          rank: 6,
          trackRank: 3,
          achievements: ['Team Player', 'Innovative'],
          lastActive: '3 days ago',
          avatar: 'L'
        },
        {
          id: 7,
          name: 'Alex Thompson',
          email: 'alex.thompson@example.com',
          track: 'Frontend',
          level: 'Intermediate',
          progress: 72,
          score: 2050,
          rank: 7,
          trackRank: 2,
          achievements: ['Creative Designer', 'Fast Learner'],
          lastActive: '6 hours ago',
          avatar: 'A'
        },
        {
          id: 8,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          track: 'Frontend',
          level: 'Beginner',
          progress: 45,
          score: 1800,
          rank: 12,
          trackRank: 5,
          achievements: ['Quick Learner', 'Consistent'],
          lastActive: '1 day ago',
          avatar: 'J'
        }
      ];

      setLeaderboardData(mockData);
      setTracks(['all', ...Array.from(new Set(mockData.map(item => item.track)))]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = leaderboardData
    .filter(item => selectedTrack === 'all' || item.track === selectedTrack)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'progress':
          return b.progress - a.progress;
        case 'rank':
          return a.rank - b.rank;
        default:
          return b.score - a.score;
      }
    });

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return 'var(--color-accent-primary)';
    if (rank <= 25) return 'var(--color-success)';
    return 'var(--color-text-tertiary)';
  };

  const getTrackColor = (track: string) => {
    const colors: { [key: string]: string } = {
      'Full Stack': 'var(--color-accent-primary)',
      'Frontend': 'var(--color-success)',
      'Backend': 'var(--color-warning)'
    };
    return colors[track] || 'var(--color-text-tertiary)';
  };

  const trackStats = tracks.filter(t => t !== 'all').map(track => ({
    track,
    count: leaderboardData.filter(item => item.track === track).length,
    avgScore: Math.round(leaderboardData.filter(item => item.track === track).reduce((acc, item) => acc + item.score, 0) / leaderboardData.filter(item => item.track === track).length),
    avgProgress: Math.round(leaderboardData.filter(item => item.track === track).reduce((acc, item) => acc + item.progress, 0) / leaderboardData.filter(item => item.track === track).length)
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <StarFilledIcon className="w-8 h-8" style={{ color: 'var(--color-accent-primary)' }} />
            <h1 
              className="text-3xl font-heading font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Leaderboard
            </h1>
          </div>
          <p 
            className="font-label text-lg"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Track student performance and celebrate achievements across all career tracks
          </p>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Total Students
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {leaderboardData.length}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                <PersonIcon className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Avg Score
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {Math.round(leaderboardData.reduce((acc, item) => acc + item.score, 0) / leaderboardData.length)}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <BarChartIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Avg Progress
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {Math.round(leaderboardData.reduce((acc, item) => acc + item.progress, 0) / leaderboardData.length)}%
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                <ArrowUpIcon className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Active Tracks
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {tracks.filter(t => t !== 'all').length}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <RocketIcon className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <MixIcon className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Track:</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-text-primary)'
              }}
            >
              {tracks.map(track => (
                <option key={track} value={track}>
                  {track === 'all' ? 'All Tracks' : track}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="score">Score</option>
              <option value="progress">Progress</option>
              <option value="rank">Rank</option>
            </select>
          </div>
        </div>

        {/* Track Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Track Distribution Pie Chart */}
          <div 
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Students by Track
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trackStats}
                    dataKey="count"
                    nameKey="track"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    labelLine={false}
                    label={false}
                  >
                    {trackStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getTrackColor(entry.track)}
                        opacity={0.8}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {trackStats.map((entry, idx) => (
                <div key={entry.track} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTrackColor(entry.track) }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {entry.track} ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Track Performance Bar Chart */}
          <div 
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Average Performance by Track
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="track" 
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="var(--color-accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div 
          className="rounded-xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Track Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Achievements
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filteredData.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-secondary-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ 
                            backgroundColor: getRankColor(student.rank) + '20',
                            color: getRankColor(student.rank)
                          }}
                        >
                          {student.rank === 1 && <StarFilledIcon className="w-5 h-5" />}
                          {student.rank === 2 && <StarFilledIcon className="w-5 h-5" />}
                          {student.rank === 3 && <StarFilledIcon className="w-5 h-5" />}
                          {student.rank > 3 && student.rank}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                          #{student.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ 
                            backgroundColor: 'var(--color-accent-primary)',
                            color: 'var(--color-text-inverse)'
                          }}
                        >
                          {student.avatar}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {student.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getTrackColor(student.track) + '20',
                            color: getTrackColor(student.track)
                          }}
                        >
                          {student.track}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          {student.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                        {student.score.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${student.progress}%`,
                              backgroundColor: student.progress >= 80 ? 'var(--color-success)' : 
                                             student.progress >= 60 ? 'var(--color-accent-primary)' : 
                                             student.progress >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getRankColor(student.trackRank) + '20',
                            color: getRankColor(student.trackRank)
                          }}
                        >
                          #{student.trackRank}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          in {student.track}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.achievements.slice(0, 2).map((achievement: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-accent-tertiary)',
                              color: 'var(--color-accent-primary)'
                            }}
                          >
                            {achievement}
                          </span>
                        ))}
                        {student.achievements.length > 2 && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-tertiary-bg)',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            +{student.achievements.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
