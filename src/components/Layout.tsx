import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { 
  HomeIcon, 
  ReaderIcon, 
  FileTextIcon, 
  GroupIcon, 
  GearIcon, 
  ExitIcon,
  BarChartIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  ListBulletIcon,
  PersonIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@radix-ui/react-icons';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from './LoadingScreen';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const controls = useAnimation();
  const logoRef = useRef(null);
  const hoverTimeout = useRef<number | null>(null);

  const handleLogoHover = () => {
    hoverTimeout.current = setTimeout(async () => {
      await controls.start({
        scale: 2.2,
        y: -120,
        x: 200,
        rotate: 30,
        opacity: 0.7,
        transition: { duration: 1.2, type: 'spring', bounce: 0.4 }
      });
      await controls.start({
        scale: 0.5,
        y: -300,
        x: 600,
        rotate: 60,
        opacity: 0,
        transition: { duration: 1.1, type: 'spring', bounce: 0.2 }
      });
      // Reset after animation
      setTimeout(() => {
        controls.set({ scale: 1, y: 0, x: 0, rotate: 0, opacity: 1 });
      }, 800);
    }, 5000);
  };

  const handleLogoLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    controls.start({ scale: 1, y: 0, x: 0, rotate: 0, opacity: 1, transition: { duration: 0.4 } });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Layout: Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const studentNavItems = [
    { path: '/student/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/student/training/current', icon: ReaderIcon, label: 'Training' },
    { path: '/student/tasks', icon: FileTextIcon, label: 'Tasks' },
    { path: '/student/tasks/upcoming', icon: ListBulletIcon, label: 'Upcoming Tasks' },
    { path: '/student/submissions', icon: FileTextIcon, label: 'My Submissions' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: GroupIcon, label: 'Admin Dashboard' },
    { path: '/admin/analytics', icon: BarChartIcon, label: 'Analytics' },
    { path: '/admin/diagnostics', icon: PersonIcon, label: 'System Diagnostics' },
    { path: '/admin/settings', icon: GearIcon, label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoggingOut) {
    return <LoadingScreen message="Signing Out..." />;
  }

  return (
    <div className="flex h-screen bg-black transition-colors">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-offblack shadow-lg border-r border-gray-200 dark:border-gray-700 flex-col transition-all duration-300 relative`}>
        {/* Always show logo at the very top, centered */}
        <div className="flex items-center justify-center py-6 border-b border-gray-200 dark:border-gray-700">
          <motion.img
            src={logo}
            alt="Syncner Logo"
            className="h-10 w-10 object-contain cursor-pointer"
            initial={{ scale: 1, y: 0, x: 0, rotate: 0, opacity: 1 }}
            animate={controls}
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
            ref={logoRef}
            style={{ zIndex: 10 }}
          />
          {!isSidebarCollapsed && <span className="ml-3 text-paperwhite font-bold text-lg">Syncner</span>}
        </div>
        {/* Arrow toggle at vertical center right edge, overlapping border */}
        <button
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 bg-offblack border border-paperwhite/20 shadow-lg p-1 rounded-xl hover:bg-paperwhite/10 transition"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
        >
          {isSidebarCollapsed ? <ChevronRightIcon className="h-5 w-5 text-paperwhite" /> : <ChevronLeftIcon className="h-5 w-5 text-paperwhite" />}
        </button>
        <nav className="mt-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise'
                    : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'
                }`}
              >
                <Icon className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-4 pb-6">
          <Link
              to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-trueturquoise mb-2"
              title="Profile"
            aria-label="View profile"
          >
              <span className="text-offblack text-base font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-paperwhite/10 hover:bg-trueturquoise/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <ExitIcon className="h-5 w-5 text-trueturquoise" />
            </button>
          </div>
        ) : (
          <div className="p-6 border-t border-trueturquoise">
            {/* Unified Profile Section - clickable */}
            <Link
              to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
              className="flex items-center gap-3 w-full px-3 py-3 mb-2 rounded-lg transition-colors bg-paperwhite/10 hover:bg-trueturquoise/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise group"
              tabIndex={0}
              aria-label="View profile"
            >
              <div className="bg-trueturquoise p-2 rounded-lg flex items-center justify-center">
                <span className="text-offblack text-base font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-paperwhite truncate">{user?.name}</span>
                <span className="text-xs text-teallight capitalize truncate">{user?.role}</span>
            </div>
              <PersonIcon className="h-5 w-5 text-trueturquoise opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
              className="flex items-center w-full px-3 py-2 text-sm text-paperwhite hover:bg-trueturquoise/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
              <ExitIcon className="h-4 w-4 mr-2 text-trueturquoise" />
            Sign Out
          </button>
        </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 object-contain" />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <Cross1Icon className="h-6 w-6" /> : <HamburgerMenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMobileMenu} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-offblack shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Cross1Icon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user?.college}</p>
        </div>

        <nav className="py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise'
                    : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Unified Profile Section - clickable */}
          <Link
            to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
            onClick={closeMobileMenu}
            className="flex items-center gap-3 w-full px-3 py-3 mb-2 rounded-lg transition-colors bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/60 focus:outline-none focus:ring-2 focus:ring-blue-400 group"
            tabIndex={0}
            aria-label="View profile"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full flex items-center justify-center">
              <span className="text-white text-base font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize truncate">{user?.role}</span>
            </div>
            <PersonIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            <ExitIcon className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
