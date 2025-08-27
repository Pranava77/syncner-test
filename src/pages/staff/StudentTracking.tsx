import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PersonIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClockIcon,
  StarIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrophyIcon,
  TargetIcon,
  RocketIcon
} from '@radix-ui/react-icons';
import syncnerLogo from '../../assets/syncner-logo.png';

const StudentTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudents([
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          progress: 75,
          status: 'active',
          lastActive: '2 hours ago',
          track: 'Full Stack',
          level: 'Intermediate',
          leaderboardData: {
            rank: 3,
            score: 2450,
            totalStudents: 45,
            trackRank: 2,
            trackTotal: 18,
            achievements: ['First Place Quiz', 'Perfect Score', 'Early Bird'],
            recentActivity: [
              { type: 'quiz', score: 95, date: '2 hours ago' },
              { type: 'exercise', completed: true, date: '1 day ago' },
              { type: 'test', score: 88, date: '3 days ago' }
            ]
          }
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          progress: 45,
          status: 'active',
          lastActive: '1 day ago',
          track: 'Frontend',
          level: 'Beginner',
          leaderboardData: {
            rank: 12,
            score: 1800,
            totalStudents: 45,
            trackRank: 5,
            trackTotal: 15,
            achievements: ['Quick Learner', 'Consistent'],
            recentActivity: [
              { type: 'quiz', score: 78, date: '1 day ago' },
              { type: 'exercise', completed: true, date: '2 days ago' },
              { type: 'test', score: 72, date: '1 week ago' }
            ]
          }
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          progress: 90,
          status: 'completed',
          lastActive: '3 days ago',
          track: 'Backend',
          level: 'Advanced',
          leaderboardData: {
            rank: 1,
            score: 3200,
            totalStudents: 45,
            trackRank: 1,
            trackTotal: 12,
            achievements: ['Track Champion', 'Perfect Score', 'Speed Demon', 'Mentor'],
            recentActivity: [
              { type: 'quiz', score: 100, date: '3 days ago' },
              { type: 'exercise', completed: true, date: '1 week ago' },
              { type: 'test', score: 95, date: '2 weeks ago' }
            ]
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (filterStatus !== 'all' && student.status === filterStatus)
  );

  const toggleStudentExpansion = (studentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--color-success)';
      case 'completed': return 'var(--color-accent-primary)';
      case 'inactive': return 'var(--color-error)';
      default: return 'var(--color-text-tertiary)';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'var(--color-success)';
    if (progress >= 60) return 'var(--color-accent-primary)';
    if (progress >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return 'var(--color-accent-primary)';
    if (rank <= 25) return 'var(--color-success)';
    return 'var(--color-text-tertiary)';
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
            Student Tracking
          </h1>
          <p 
            className="font-label text-lg"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Monitor individual student progress and track collective performance metrics
          </p>
        </div>

        {/* Collective Stats */}
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
                  {students.length}
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
                  Avg Progress
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0}%
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
                  Active Students
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {students.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                <CheckCircledIcon className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
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
                  Completed
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {students.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <StarIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Students Table */}
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
                <span style={{ color: 'var(--color-text-tertiary)' }}>Loading students...</span>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filteredStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-secondary-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
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
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(student.status) + '20',
                            color: getStatusColor(student.status)
                          }}
                        >
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          {student.lastActive}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStudentExpansion(student.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
                          style={{ color: 'var(--color-accent-primary)' }}
                        >
                          {expandedStudents.has(student.id) ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                          )}
                          Leaderboard
                        </button>
                      </td>
                    </motion.tr>
                    
                    {/* Expanded Leaderboard Section */}
                    <AnimatePresence>
                      {expandedStudents.has(student.id) && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                        >
                          <td colSpan={6} className="px-6 py-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
                              <div className="flex items-center gap-3 mb-6">
                                <TrophyIcon className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                  {student.name}'s Leaderboard Performance
                                </h3>
                              </div>
                              
                              {/* Leaderboard Stats Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                {/* Overall Rank */}
                                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-2xl font-bold mb-1" style={{ color: getRankColor(student.leaderboardData.rank) }}>
                                    #{student.leaderboardData.rank}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Overall Rank
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    of {student.leaderboardData.totalStudents} students
                                  </div>
                                </div>
                                
                                {/* Track Rank */}
                                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-2xl font-bold mb-1" style={{ color: getRankColor(student.leaderboardData.trackRank) }}>
                                    #{student.leaderboardData.trackRank}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Track Rank
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    of {student.leaderboardData.trackTotal} in {student.track}
                                  </div>
                                </div>
                                
                                {/* Total Score */}
                                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                                    {student.leaderboardData.score}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Total Score
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Points earned
                                  </div>
                                </div>
                                
                                {/* Progress */}
                                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-success)' }}>
                                    {student.progress}%
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Progress
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Course completion
                                  </div>
                                </div>
                              </div>
                              
                              {/* Achievements and Recent Activity */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Achievements */}
                                <div>
                                  <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                    Achievements
                                  </h4>
                                  <div className="space-y-2">
                                    {student.leaderboardData.achievements.map((achievement, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                                        <StarIcon className="w-4 h-4" style={{ color: 'var(--color-accent-primary)' }} />
                                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                          {achievement}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Recent Activity */}
                                <div>
                                  <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                    Recent Activity
                                  </h4>
                                  <div className="space-y-2">
                                    {student.leaderboardData.recentActivity.map((activity, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                                          {activity.type === 'quiz' && <TargetIcon className="w-4 h-4" style={{ color: 'var(--color-accent-primary)' }} />}
                                          {activity.type === 'exercise' && <RocketIcon className="w-4 h-4" style={{ color: 'var(--color-success)' }} />}
                                          {activity.type === 'test' && <BarChartIcon className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                            {activity.score && ` - ${activity.score}%`}
                                            {activity.completed && ' - Completed'}
                                          </div>
                                          <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                            {activity.date}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentTracking;
