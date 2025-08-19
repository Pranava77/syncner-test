import React, { useState } from 'react';
import { useAppDispatch } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  BarChartIcon,
  DashboardIcon,
  ExitIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@radix-ui/react-icons';
import StudentTracking from './staff/StudentTracking';
import Leaderboard from './staff/Leaderboard';
import StaffProfile from './staff/StaffProfile';
import syncnerLogo from '../assets/syncner-logo.png';

const StaffDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const sidebarItems = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/staff/dashboard', isMain: true },
    { icon: PersonIcon, label: 'Student Tracking', path: '/staff/dashboard/students' },
    { icon: BarChartIcon, label: 'Leaderboard', path: '/staff/dashboard/leaderboard' },
    { icon: BarChartIcon, label: 'Staff Profile', path: '/staff/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Sidebar */}
      <motion.div
        className={`flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <motion.img
              src={syncnerLogo}
              alt="Syncner Logo"
              className="w-8 h-8"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            {!sidebarCollapsed && (
              <motion.h1
                className="text-xl font-heading font-bold"
                style={{ color: 'var(--color-text-primary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Staff Portal
              </motion.h1>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{ 
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                  item.isMain ? 'text-lg' : 'text-base'
                }`}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary-bg)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <item.icon className={`${item.isMain ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'var(--color-text-inverse)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-error)';
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExitIcon className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<StaffMainDashboard />} />
          <Route path="/students" element={<StudentTracking />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<StaffProfile />} />
        </Routes>
      </div>
    </div>
  );
};

// Main Dashboard Component
const StaffMainDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 
            className="text-3xl font-heading font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Staff Dashboard
          </h1>
          <p 
            className="font-label text-lg"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Monitor student progress, track completion rates, and view collective performance metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  0
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
                  Track Completion
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  0%
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
                  0
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
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Avg Progress Rate
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  0%
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <BarChartIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div 
            className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={() => navigate('/staff/dashboard/students')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Student Tracking
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Monitor individual student progress, track completion rates, and view detailed analytics
            </p>
          </div>

          <div 
            className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={() => navigate('/staff/dashboard/leaderboard')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Leaderboard
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              View student rankings, performance metrics, and competitive achievements
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StaffDashboard; 