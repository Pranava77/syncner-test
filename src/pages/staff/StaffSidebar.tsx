import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { logoutUser } from '../../redux/slices/authSlice';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChartIcon,
  DashboardIcon,
  ExitIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon,
  GearIcon,
  LightningBoltIcon,
  FileTextIcon,
  ChatBubbleIcon,
  StarIcon,
  GroupIcon as Users,
  GlobeIcon,
  RocketIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  DownloadIcon,
  TargetIcon as Target,
  ArrowTopRightIcon as TrendingUp,
  PersonIcon
} from '@radix-ui/react-icons';
import StudentTracking from './StudentTracking';
import Leaderboard from './Leaderboard';
import StaffProfile from './StaffProfile';
import StudentDetails from './StudentDetails';
import StudentPortfolioPage from './StudentPortfolioPage';

import syncnerLogo from '../../assets/syncner-logo.png';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useStaff } from '../../hooks/useStaff';

const COLORS = ['#00B8D9', '#FFBB28', '#FF8042', '#A259F7', '#F95F62', '#00C49F'];

const StaffSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
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
      console.error('StaffSidebar: Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const staffNavItems = [
    { path: '/staff', icon: HomeIcon, label: 'Dashboard' },
    { path: '/staff/students', icon: Users, label: 'Student Tracking' },
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
      {/* Desktop Sidebar - Exact Layout.tsx Design */}
      <div 
        className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} shadow-lg border-r flex-col transition-all duration-300 relative`}
        style={{ 
          backgroundColor: 'var(--color-secondary-bg)', 
          borderColor: 'var(--color-border)' 
        }}
      >
        {/* Logo Section - Exact Layout.tsx Design */}
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
            onClick={() => navigate('/staff')}
            style={{ zIndex: 10 }}
          />
          {!sidebarCollapsed && (
            <span 
              className="ml-3 text-2xl font-heading" 
              style={{ 
                fontFamily: 'Amatic SC, FK Grotesk, Inter, Helvetica Neue, Arial, sans-serif',
                color: 'var(--color-text-primary)'
              }}
            >
              Syncner
            </span>
          )}
        </div>

        {/* Arrow toggle at vertical center right edge, overlapping border - Exact Layout.tsx Design */}
        <button
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 border shadow-lg p-1 rounded-xl transition"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ 
            backgroundColor: 'var(--color-secondary-bg)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRightIcon className="h-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          ) : (
            <ChevronLeftIcon className="h-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          )}
        </button>

        {/* Navigation - Exact Layout.tsx Design */}
        <nav className="flex-1 flex flex-col justify-between">
          <div>
            {staffNavItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm transition-colors`}
                  style={{
                    backgroundColor: isActive(item.path) 
                      ? 'var(--color-accent-tertiary)' 
                      : 'transparent',
                    color: isActive(item.path) 
                      ? 'var(--color-accent-primary)' 
                      : 'var(--color-text-primary)',
                    borderRight: isActive(item.path) ? '2px solid var(--color-accent-primary)' : 'none'
                  }}
                >
                  <Icon className="h-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section - Exact Layout.tsx Design */}
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-4 pb-6">
            <ThemeSwitcher variant="icon" size="md" className="mb-2 p-2 rounded-lg bg-[var(--color-accent-primary)]" />
            
            {/* Profile Section - Collapsed */}
            <Link
              to="/staff/profile"
              className="flex items-center justify-center w-10 h-10 rounded-md mb-2"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
              title="Profile"
              aria-label="View profile"
            >
              <span 
                className="text-base font-heading"
                style={{ color: 'var(--color-text-inverse)' }}
              >
                {user?.name?.charAt(0) || 'S'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sign Out"
              aria-label="Sign Out"
              style={{ 
                backgroundColor: 'var(--color-tertiary-bg)',
                color: 'var(--color-accent-primary)'
              }}
            >
              <ExitIcon className="h-5 h-5" />
            </button>
            <div 
              className="mt-4 text-center text-xs font-label opacity-80 select-none"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              v1.0
            </div>
          </div>
        ) : (
          <div 
            className="p-6 border-t" 
            style={{ borderColor: 'var(--color-accent-primary)' }}
          >
            {/* Theme Switcher */}
            <div className="mb-4">
              <ThemeSwitcher variant="full-width" className="w-full" />
            </div>
            
            {/* Profile Section - Expanded */}
            <Link
              to="/staff/profile"
              className="flex items-center gap-3 w-full px-3 py-2 mb-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-secondary-bg)] group hover:bg-[var(--color-tertiary-bg)]"
              tabIndex={0}
              aria-label="View profile"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors group-hover:border-[var(--color-accent-primary)]" style={{ 
                backgroundColor: 'var(--color-accent-primary)', 
                borderColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)' 
              }}>
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {user?.name || 'Staff Member'}
                </span>
                <span className="text-xs capitalize truncate opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
                  staff
                </span>
              </div>
              <PersonIcon className="h-4 w-4 opacity-60 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-secondary)' }} />
            </Link>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-tertiary-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-secondary-bg)]"
              style={{
                color: 'var(--color-text-secondary)'
              }}
            >
              <ExitIcon className="h-4 h-4 mr-2" />
              Sign Out
            </button>
            
            <div 
              className="mt-4 text-center text-xs opacity-50 select-none"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              v1.0
            </div>
          </div>
        )}
      </div>

      {/* Mobile Header - Exact Layout.tsx Design */}
      <div 
        className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={syncnerLogo} alt="Syncner Logo" className="h-8 h-8 object-contain" />
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeSwitcher variant="icon" size="md" className="mr-2 p-2 rounded-lg bg-[var(--color-accent-primary)]" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {isMobileMenuOpen ? <Cross1Icon className="h-6 h-6" /> : <HamburgerMenuIcon className="h-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Exact Layout.tsx Design */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMobileMenu} />
      )}

      {/* Mobile Sidebar - Exact Layout.tsx Design */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] shadow-xl z-50 transform transition-transform duration-300 ease-in-out scroll-smooth ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ 
                backgroundColor: 'var(--color-accent-primary)', 
                color: 'var(--color-text-inverse)' 
              }}>
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'Staff Member'}</p>
                <p className="text-xs capitalize opacity-70" style={{ color: 'var(--color-text-secondary)' }}>staff</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-1.5 rounded-md hover:bg-[var(--color-tertiary-bg)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Cross1Icon className="h-4 h-4" />
            </button>
          </div>
          {user?.college && (
            <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{user?.college}</p>
          )}
        </div>

        <nav className="space-y-1">
          {staffNavItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className="flex items-center px-6 py-3 text-sm transition-colors"
                style={{ 
                  backgroundColor: isActive(item.path) ? 'var(--color-accent-tertiary)' : 'transparent',
                  color: isActive(item.path) ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                  borderRight: isActive(item.path) ? '2px solid var(--color-accent-primary)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="h-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Theme Switcher */}
          <div className="mb-4">
            <ThemeSwitcher variant="full-width" className="w-full" />
          </div>
          
          {/* Profile Section - Mobile */}
          <Link
            to="/staff/profile"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 w-full px-3 py-2 mb-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-primary-bg)] group hover:bg-[var(--color-tertiary-bg)]"
            tabIndex={0}
            aria-label="View profile"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors group-hover:border-[var(--color-accent-primary)]" style={{ 
              backgroundColor: 'var(--color-accent-primary)', 
              borderColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)' 
            }}>
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'Staff Member'}</span>
              <span className="text-xs capitalize truncate opacity-70" style={{ color: 'var(--color-text-secondary)' }}>staff</span>
            </div>
            <PersonIcon className="h-4 w-4 opacity-60 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-tertiary-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-primary-bg)]"
            style={{
              color: 'var(--color-text-secondary)'
            }}
          >
            <ExitIcon className="h-4 h-4 mr-2" />
            Sign Out
          </button>
          <div className="mt-4 text-center text-xs opacity-50 select-none" style={{ color: 'var(--color-text-secondary)' }}>v1.0</div>
        </div>
      </div>

      {/* Main Content - Design */}
      <div className="flex-1 overflow-hidden">
        <main 
          className="h-full overflow-y-auto scroll-smooth"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <Routes>
            <Route path="/" element={<StaffMainDashboard />} />
            <Route path="/students" element={<StudentTracking />} />
            <Route path="/students/:studentId" element={<StudentDetails />} />
            <Route path="/portfolio/:studentId" element={<StudentPortfolioPage />} />
            <Route path="/test-portfolio" element={<div>Test Portfolio Route Working!</div>} />


            <Route path="/profile" element={<StaffProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Main Dashboard Component - Exact AdminDashboard Replication
const StaffMainDashboard: React.FC = () => {
  const { analytics, analyticsLoading, error, getAnalytics } = useStaff();

  // Fetch analytics data on component mount
  useEffect(() => {
    getAnalytics();
  }, [getAnalytics]);

  const exportData = () => {
    alert('CSV export functionality would be implemented here');
  };

  if (analyticsLoading) {
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
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if analytics failed to load
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <div className="text-center">
          <p 
            className="text-lg text-red-500 mb-4"
          >
            Error loading analytics: {error}
          </p>
          <button
            onClick={() => getAnalytics()}
            className="px-4 py-2 rounded-lg transition-colors font-medium"
            style={{ 
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)' 
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Fallbacks for missing analytics
  const userCount = analytics?.totalStudents ?? 0;
  const activeStudents = analytics?.activeStudents ?? 0;
  const completionRate = analytics?.completionRate ?? 0;
  const trackDistribution = analytics?.trackDistribution ?? [];
  const avgProgress = analytics?.avgProgress ?? 0;

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
      {/* Header - Exact AdminDashboard Design */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 
            className="text-3xl font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Staff Analytics
          </h1>
          <p 
            className="mt-1 font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Comprehensive insights into student performance and progress
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => getAnalytics()}
            disabled={analyticsLoading}
            className="px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'var(--color-accent-secondary)',
              color: 'var(--color-text-primary)' 
            }}
          >
            {analyticsLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Loading...
              </>
            ) : (
              <>
                <RocketIcon className="h-4 w-4" />
                Refresh
              </>
            )}
          </button>
        <button
          onClick={exportData}
          className="px-5 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow"
          style={{ 
            backgroundColor: 'var(--color-accent-primary)',
            color: 'var(--color-text-inverse)' 
          }}
        >
          <DownloadIcon className="h-5 w-5" />
          Export CSV
        </button>
        </div>
      </div>

      {/* Analytics Cards - Exact AdminDashboard Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-10">
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
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <Target 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Course Completion</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{completionRate}%</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Students who completed at least one level
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
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <Target 
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
            >{avgProgress}%</p>
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
            <FileTextIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Active Tracks</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{analytics?.trackStructure?.length || 0}</p>
          </div>
        </div>






      </div>

      {/* Students by Track Charts - Combined Row - Exact AdminDashboard Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Pie Chart */}
        <div 
          className="rounded-xl shadow-sm p-6 flex flex-col items-center"
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
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={trackDistribution}
                    dataKey="count"
                    nameKey="track"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
                    fontSize="32"
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
                    fontSize="14"
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
            <div className="flex flex-wrap justify-center items-center gap-3 mt-6 w-full">
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

        {/* Bar Chart */}
        <div 
          className="rounded-xl shadow-sm p-6 flex flex-col items-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 
            className="text-lg font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >Students per Track</h2>
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trackDistribution} barCategoryGap={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#22283122" />
                <XAxis dataKey="track" tick={{ fill: '#A0AEC0', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: '#181F2A', border: 'none', borderRadius: 8, color: '#fff', boxShadow: '0 2px 8px #00B8D955' }}
                  itemStyle={{ color: '#00B8D9' }}
                  cursor={{ fill: '#00B8D922' }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 6, 6]}
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


    </div>
  );
};

export default StaffSidebar;
