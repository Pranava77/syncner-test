import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PersonIcon,
  BarChartIcon,
  CheckCircledIcon,
  ClockIcon,
  StarIcon,
  MagnifyingGlassIcon,
  StarFilledIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@radix-ui/react-icons';
import { useStaff } from '../../hooks/useStaff';
import syncnerLogo from '../../assets/syncner-logo.png';

const StudentTracking: React.FC = () => {
  const navigate = useNavigate();
  const {
    students,
    studentsLoading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    clearError
  } = useStaff();

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>(filters.status || 'all');
  const [filterTrack, setFilterTrack] = useState<'all' | string>(filters.careerTrack || 'all');

  // Update filters when local state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchTerm });
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateFilters]);

  useEffect(() => {
    updateFilters({ status: filterStatus });
  }, [filterStatus, updateFilters]);

  useEffect(() => {
    updateFilters({ careerTrack: filterTrack });
  }, [filterTrack, updateFilters]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [error, clearError]);

  const handlePageChange = (newPage: number) => {
    updatePagination({ currentPage: newPage });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (filterStatus !== 'all' && student.status === filterStatus) ||
    (filterTrack !== 'all' && student.careerTrack === filterTrack)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--color-success)';
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

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (studentsLoading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <PersonIcon className="w-6 h-6" style={{ color: 'var(--color-text-inverse)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Student Tracking
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Monitor student progress and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Track Filter */}
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">All Tracks</option>
              <option value="full-stack">Full Stack</option>
              <option value="ai-ml">AI/ML</option>
              <option value="ui-ux">UI/UX</option>
              <option value="data-science">Data Science</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {pagination.totalStudents} students
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-bg)', borderColor: 'var(--color-error)' }}>
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Track & Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Streak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student._id}
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
                          {student.careerTrack}
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
                      <div>
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.attendancePercentage}%
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {student.presentDays}/{student.totalDays} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {student.currentStreak} days
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Best: {student.longestStreak} days
                        </div>
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
                        {formatLastActive(student.lastActive)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/staff/students/${student._id}`)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
                        style={{ color: 'var(--color-accent-primary)' }}
                      >
                        <StarFilledIcon className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Showing page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-accent-tertiary)]"
                    style={{ color: 'var(--color-accent-primary)' }}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-accent-tertiary)]"
                    style={{ color: 'var(--color-accent-primary)' }}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {studentsLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
              <span>Updating students...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTracking;
