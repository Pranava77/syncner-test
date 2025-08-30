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
import StudentPortfolio from '../../components/StudentPortfolio';
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
            <Route path="/students/:studentId/portfolio" element={<StudentPortfolio />} />
            <Route path="/profile" element={<StaffProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Remove duplicate StaffMainDashboard component - use AdminDashboard instead
const StaffMainDashboard: React.FC = () => {
  // Redirect to admin dashboard or use shared component
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="text-center">
        <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
          Staff analytics are now available in the main admin dashboard.
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          Please use the admin analytics section for comprehensive insights.
        </p>
      </div>
    </div>
  );
};

export default StaffSidebar;
