import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  PersonIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClockIcon
} from '@radix-ui/react-icons';
import syncnerLogo from '../../assets/syncner-logo.png';

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTrack, setFilterTrack] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaderboardData([
        {
          id: 1,
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          progress: 95,
          track: 'Backend',
          level: 'Advanced',
          completedLevels: 12,
          totalLevels: 15,
          lastActive: '2 hours ago',
          achievements: 8,
          rank: 1
        },
        {
          id: 2,
          name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          progress: 88,
          track: 'Full Stack',
          level: 'Intermediate',
          completedLevels: 10,
          totalLevels: 15,
          lastActive: '1 day ago',
          achievements: 6,
          rank: 2
        },
        {
          id: 3,
          name: 'John Doe',
          email: 'john.doe@example.com',
          progress: 75,
          track: 'Full Stack',
          level: 'Intermediate',
          completedLevels: 8,
          totalLevels: 15,
          lastActive: '3 hours ago',
          achievements: 5,
          rank: 3
        },
        {
          id: 4,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          progress: 65,
          track: 'Frontend',
          level: 'Beginner',
          completedLevels: 6,
          totalLevels: 15,
          lastActive: '1 day ago',
          achievements: 3,
          rank: 4
        },
        {
          id: 5,
          name: 'Alex Brown',
          email: 'alex.brown@example.com',
          progress: 58,
          track: 'Backend',
          level: 'Beginner',
          completedLevels: 5,
          totalLevels: 15,
          lastActive: '2 days ago',
          achievements: 2,
          rank: 5
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = leaderboardData.filter(student =>
    filterTrack === 'all' || student.track === filterTrack
  );

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progress - a.progress;
      case 'achievements':
        return b.achievements - a.achievements;
      case 'completedLevels':
        return b.completedLevels - a.completedLevels;
      default:
        return a.rank - b.rank;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="w-6 h-6" style={{ color: '#FFD700' }} />;
      case 2:
        return <TrophyIcon className="w-6 h-6" style={{ color: '#C0C0C0' }} />;
      case 3:
        return <TrophyIcon className="w-6 h-6" style={{ color: '#CD7F32' }} />;
      default:
        return <span className="text-lg font-bold" style={{ color: 'var(--color-text-tertiary)' }}>#{rank}</span>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'var(--color-success)';
    if (progress >= 80) return 'var(--color-accent-primary)';
    if (progress >= 70) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-heading font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Student Leaderboard
          </h1>
          <p 
            className="font-label text-lg"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Track student performance, achievements, and competitive rankings
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sortedData.slice(0, 3).map((student, index) => (
            <motion.div
              key={student.id}
              className={`p-6 rounded-xl shadow-lg text-center ${
                index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
              }`}
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)',
                transform: index === 0 ? 'scale(1.05)' : 'scale(1)'
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-4">
                {getRankIcon(student.rank)}
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {student.name}
              </h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                {student.track} • {student.level}
              </p>
              <div className="text-3xl font-bold mb-2" style={{ color: getProgressColor(student.progress) }}>
                {student.progress}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {student.completedLevels}/{student.totalLevels} levels
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-4 py-2 border rounded-lg transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Tracks</option>
            <option value="Full Stack">Full Stack</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="progress">Sort by Progress</option>
            <option value="achievements">Sort by Achievements</option>
            <option value="completedLevels">Sort by Completed Levels</option>
            <option value="rank">Sort by Rank</option>
          </select>
        </div>

        {/* Leaderboard Table */}
        <div 
          className="rounded-xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <motion.img
                  src={syncnerLogo}
                  alt="Syncner Logo"
                  className="w-6 h-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                <span style={{ color: 'var(--color-text-tertiary)' }}>Loading leaderboard...</span>
              </div>
            </div>
          ) : (
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
                    Track & Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Achievements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {sortedData.map((student, index) => (
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
                      <div className="flex items-center">
                        {getRankIcon(student.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.name}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.track}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          {student.level}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 mr-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${student.progress}%`,
                                backgroundColor: getProgressColor(student.progress)
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.progress}%
                        </span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {student.completedLevels}/{student.totalLevels} levels
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 mr-2" style={{ color: '#FFD700' }} />
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.achievements}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {student.lastActive}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="p-6 rounded-xl shadow-lg text-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
              {leaderboardData.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Total Students
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg text-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
              {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((acc, s) => acc + s.progress, 0) / leaderboardData.length) : 0}%
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Average Progress
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg text-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: '#FFD700' }}>
              {leaderboardData.reduce((acc, s) => acc + s.achievements, 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Total Achievements
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
