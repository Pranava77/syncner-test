import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { toggleDarkMode } from '../redux/slices/themeSlice';
import { 
  Home, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  BarChart3,
  Menu,
  X,
  List
} from 'lucide-react';
import logo from '../assets/syncner-logo.png';

interface LayoutProps {
  children: ReactNode;
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

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const isActive = (path: string) => location.pathname === path;

  const studentNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/training/current', icon: BookOpen, label: 'Training' },
    { path: '/tasks', icon: Briefcase, label: 'Tasks' },
    { path: '/tasks/upcoming', icon: List, label: 'Upcoming Tasks' },
    { path: '/submissions', icon: FileText, label: 'My Submissions' },
    { path: '/resume', icon: FileText, label: 'Resume' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: Users, label: 'Students' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
          <div className="flex items-center space-x-3 mb-4">
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
          
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleToggleDarkMode}
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
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
              onClick={handleToggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
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
                className={`flex items-center px-6 py-4 text-base font-medium transition-colors ${
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
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3" />
            ) : (
              <LogOut className="h-5 w-5 mr-3" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;