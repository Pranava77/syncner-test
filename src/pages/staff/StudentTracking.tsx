import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClockIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@radix-ui/react-icons';
import syncnerLogo from '../../assets/syncner-logo.png';

const StudentTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          level: 'Intermediate'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          progress: 45,
          status: 'active',
          lastActive: '1 day ago',
          track: 'Frontend',
          level: 'Beginner'
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          progress: 90,
          status: 'completed',
          lastActive: '3 days ago',
          track: 'Backend',
          level: 'Advanced'
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
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
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
                  </motion.tr>
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
