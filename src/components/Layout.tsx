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
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import logo from '../assets/syncner-logo.png';

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

  // Theme toggle handler
  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    dispatch({ type: 'theme/toggle' });
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

  return (
    <div className="flex h-screen bg-[var(--brand-bg)] transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-[var(--brand-bg)] shadow-lg border-r border-[var(--brand-bg-alt)] flex-col">
        <div className="p-6 border-b border-[var(--brand-bg-alt)]">
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
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[var(--brand-bg-alt)] text-[var(--brand-primary)] border-r-2 border-[var(--brand-primary)]'
                    : 'text-[var(--brand-text)] hover:bg-[var(--brand-bg-alt)] hover:text-[var(--brand-primary)]'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[var(--brand-bg-alt)]">
          {/* Unified Profile Section - clickable */}
          <Link
            to={user?.role === 'admin' ? '/admin/profile' : '/profile'}
            className="flex items-center gap-3 w-full px-3 py-3 mb-2 rounded-lg transition-colors bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:bg-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] group"
            tabIndex={0}
            aria-label="View profile"
          >
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 rounded-full flex items-center justify-center">
              <span className="text-white text-base font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--brand-text)] truncate">{user?.name}</span>
              <span className="text-xs text-[var(--brand-primary)] capitalize truncate">{user?.role}</span>
            </div>
            <UserIcon className="h-5 w-5 text-[var(--brand-primary)] opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="flex items-center w-full px-3 py-2 text-sm text-[var(--brand-text)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition-colors mb-2"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2 text-sm text-[var(--brand-text)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--brand-primary)] mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--brand-bg)] border-b border-[var(--brand-bg-alt)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[var(--brand-text)] hover:text-[var(--brand-primary)] transition-colors"
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
      <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[var(--brand-bg)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 border-b border-[var(--brand-bg-alt)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 rounded-full">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--brand-text)]">{user?.name}</p>
                <p className="text-xs text-[var(--brand-primary)] capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-[var(--brand-primary)] hover:text-[var(--brand-accent)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-[var(--brand-primary)]">{user?.college}</p>
        </div>

        <nav className="py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[var(--brand-bg-alt)] text-[var(--brand-primary)] border-r-2 border-[var(--brand-primary)]'
                    : 'text-[var(--brand-text)] hover:bg-[var(--brand-bg-alt)] hover:text-[var(--brand-primary)]'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--brand-bg-alt)]">
          {/* Unified Profile Section - clickable */}
          <Link
            to={user?.role === 'admin' ? '/admin/profile' : '/profile'}
            onClick={closeMobileMenu}
            className="flex items-center gap-3 w-full px-3 py-3 mb-2 rounded-lg transition-colors bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:bg-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] group"
            tabIndex={0}
            aria-label="View profile"
          >
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 rounded-full flex items-center justify-center">
              <span className="text-white text-base font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--brand-text)] truncate">{user?.name}</span>
              <span className="text-xs text-[var(--brand-primary)] capitalize truncate">{user?.role}</span>
            </div>
            <UserIcon className="h-5 w-5 text-[var(--brand-primary)] opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
          {/* Theme Toggle Button (Mobile) */}
          <button
            onClick={() => { handleThemeToggle(); closeMobileMenu(); }}
            className="flex items-center w-full px-3 py-2 text-sm text-[var(--brand-text)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition-colors mb-2"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-3 text-base text-[var(--brand-text)] hover:bg-[var(--brand-bg-alt)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--brand-primary)] mr-3" />
            ) : (
              <LogOut className="h-5 w-5 mr-3" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto p-4 lg:p-8 bg-[var(--brand-bg)] pt-20 lg:pt-8">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;