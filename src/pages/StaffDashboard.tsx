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
  ChevronLeftIcon,
  HomeIcon,
  GearIcon,
  LightningBoltIcon,
  FileTextIcon,
  IdCardIcon,
  ChatBubbleIcon,
  StarIcon,
  GroupIcon as Users,
  GlobeIcon,
  RocketIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  HamburgerMenuIcon,
  Cross1Icon
} from '@radix-ui/react-icons';
import StudentTracking from './staff/StudentTracking';
import Leaderboard from './staff/Leaderboard';
import StaffProfile from './staff/StaffProfile';
import syncnerLogo from '../assets/syncner-logo.png';
import ThemeSwitcher from '../components/ThemeSwitcher';

const StaffDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('StaffDashboard: Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const staffNavItems = [
    { path: '/staff/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/staff/dashboard/students', icon: Users, label: 'Student Tracking' },
    { path: '/staff/dashboard/leaderboard', icon: StarIcon, label: 'Leaderboard' },
    { path: '/staff/dashboard/profile', icon: IdCardIcon, label: 'Staff Profile' },
  ];

  const isActive = (path: string) => window.location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <motion.img
            src={syncnerLogo}
            alt="Syncner Logo"
            className="w-16 h-16 mx-auto mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Signing Out...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen transition-colors" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} shadow-lg border-r flex-col transition-all duration-300 relative`}
        style={{ 
          backgroundColor: 'var(--color-secondary-bg)', 
          borderColor: 'var(--color-border)' 
        }}
      >
        {/* Logo Section */}
        <div 
          className="flex items-center justify-center py-6 border-b" 
          style={{ 
            position: 'relative',
            borderColor: 'var(--color-border)'
          }}
        >
          <motion.img
            src={syncnerLogo}
            alt="Syncner Logo"
            className="h-10 w-10 object-contain cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/staff/dashboard')}
          />
          {!sidebarCollapsed && (
            <motion.h1
              className="ml-3 text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Staff Portal
            </motion.h1>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {staffNavItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive(item.path) 
                    ? 'bg-opacity-10' 
                    : 'hover:bg-opacity-5'
                }`}
                style={{
                  backgroundColor: isActive(item.path) 
                    ? 'var(--color-accent-primary)' 
                    : 'transparent',
                  color: isActive(item.path) 
                    ? 'var(--color-accent-primary)' 
                    : 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.color = 'var(--color-accent-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          {/* Theme Switcher */}
          <div className="flex items-center justify-center">
            <ThemeSwitcher />
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-2 rounded-lg transition-colors hover:bg-opacity-10 flex items-center justify-center"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--color-text-tertiary)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </button>

          {/* Logout Button */}
          <button
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

          >
            <ExitIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeMobileMenu}
        >
          <div 
            className="fixed left-0 top-0 h-full w-64 shadow-lg"
            style={{ backgroundColor: 'var(--color-secondary-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <img src={syncnerLogo} alt="Syncner Logo" className="h-8 w-8" />
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Staff Portal
                </h1>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <Cross1Icon className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-2">
              {staffNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    closeMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive(item.path) 
                      ? 'bg-opacity-10' 
                      : 'hover:bg-opacity-5'
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) 
                      ? 'var(--color-accent-primary)' 
                      : 'transparent',
                    color: isActive(item.path) 
                      ? 'var(--color-accent-primary)' 
                      : 'var(--color-text-primary)'
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Bottom Section */}
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-center">
                <ThemeSwitcher />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-text-inverse)'
                }}
              >
                <ExitIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div 
          className="flex items-center justify-between p-4 border-b lg:hidden"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)' 
          }}
        >
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <HamburgerMenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <img src={syncnerLogo} alt="Syncner Logo" className="h-8 w-8" />
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Staff Portal
            </h1>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<StaffMainDashboard />} />
            <Route path="/students" element={<StudentTracking />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<StaffProfile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component - Matching Admin Design
const StaffMainDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 
            className="text-3xl font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Staff Dashboard
          </h1>
          <p 
            className="mt-1 font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Monitor student progress and track collective performance metrics
          </p>
        </div>
      </div>

      {/* Stats Cards - Matching Admin Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <Users 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Total Students</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >0</p>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <Users 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Active Students</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >0</p>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <BarChartIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Avg Progress</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >0%</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Matching Admin Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onClick={() => navigate('/staff/dashboard/students')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Student Tracking
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Monitor individual student progress and track completion rates
          </p>
        </div>

        <div 
          className="rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onClick={() => navigate('/staff/dashboard/leaderboard')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Leaderboard
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            View student rankings and performance metrics
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 