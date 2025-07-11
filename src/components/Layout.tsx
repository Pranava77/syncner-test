import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { 
  Home, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Users, 
  Settings, 
  LogOut,

  BarChart3,
  Menu,
  X,
  List,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from './LoadingScreen';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    { path: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/student/training/current', icon: BookOpen, label: 'Training' },
    { path: '/student/tasks', icon: Briefcase, label: 'Tasks' },
    { path: '/student/tasks/upcoming', icon: List, label: 'Upcoming Tasks' },
    { path: '/student/submissions', icon: FileText, label: 'My Submissions' },
    { path: '/student/resume', icon: FileText, label: 'Resume' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: Users, label: 'Students' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/diagnostics', icon: ShieldCheck, label: 'System Diagnostics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoggingOut) {
    return <LoadingScreen message="Signing Out..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Syncner Logo" className="h-10 w-10 object-contain" />
          </div>
        </div>

        <nav className="mt-6 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Unified Profile Section - clickable */}
          <Link
            to={user?.role === 'admin' ? '/admin/profile' : '/profile'}
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
            <UserIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
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
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMobileMenu} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
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
              <X className="h-5 w-5" />
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
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
            to={user?.role === 'admin' ? '/admin/profile' : '/profile'}
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
            <UserIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-8">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
