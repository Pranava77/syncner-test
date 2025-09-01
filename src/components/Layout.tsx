import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { 
  HomeIcon, 
  GearIcon, 
  ExitIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  PersonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LightningBoltIcon,
  GlobeIcon,
  RocketIcon,
  FileTextIcon,
  IdCardIcon,
  ChatBubbleIcon,
  LockClosedIcon,
  EnvelopeClosedIcon,
  StarIcon,
  GroupIcon as Users,
  IdCardIcon as PortfolioIcon,
} from '@radix-ui/react-icons';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from './LoadingScreen';
import ThemeSwitcher from './ThemeSwitcher';
import { motion, useAnimation } from 'framer-motion';
import { useRef } from 'react';

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  const controls = useAnimation();
  const logoRef = useRef<HTMLImageElement>(null);
  const hoverTimeout = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLogoAnimating) {
        // Random shake: direction and intensity
        const dx = (Math.random() - 0.5) * 24; // -12 to +12 px
        const dy = (Math.random() - 0.5) * 16; // -8 to +8 px
        const rot = (Math.random() - 0.5) * 24; // -12 to +12 deg
        controls.start({
          x: dx,
          y: dy,
          rotate: rot,
          transition: { duration: 0.18, type: 'spring', bounce: 0.6 }
        }).then(() => {
          controls.start({
            x: 0,
            y: 0,
            rotate: 0,
            transition: { duration: 0.18, type: 'spring', bounce: 0.6 }
          });
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [controls, isLogoAnimating]);

  const handleLogoHover = () => {
    setIsLogoAnimating(true);
    hoverTimeout.current = setTimeout(async () => {
      // Move to center of the viewport using transform only
      await controls.start({
        scale: 4,
        x: window.innerWidth / 2 - (logoRef.current?.getBoundingClientRect().left || 0) - 20, // 20 = half logo size
        y: window.innerHeight / 2 - (logoRef.current?.getBoundingClientRect().top || 0) - 20,
        rotate: 0,
        opacity: 1,
        zIndex: 50,
        transition: { duration: 1.2, type: 'spring', bounce: 0.4 }
      });
      // Pause briefly at center
      await controls.start({
        scale: 4,
        transition: { duration: 0.5 }
      });
      // Return to original position and size
      await controls.start({
        scale: 1,
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        zIndex: 10,
        transition: { duration: 1.2, type: 'spring', bounce: 0.4 }
      });
      setIsLogoAnimating(false);
    }, 3000);

    // Start shaking after 1 second
    setTimeout(() => {
      let shake = true;
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        if (!shake || shakeCount > 10) {
          controls.start({ x: 0, rotate: 0, transition: { duration: 0.1 } });
          clearInterval(shakeInterval);
          return;
        }
        controls.start({ x: shakeCount % 2 === 0 ? -8 : 8, rotate: shakeCount % 2 === 0 ? -8 : 8, transition: { duration: 0.08 } });
        shakeCount++;
      }, 80);
      // Stop shaking after 2s (so total 3s hover)
      setTimeout(() => { shake = false; }, 1600);
    }, 1000);
  };

  const handleLogoLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    controls.start({ scale: 1, y: 0, x: 0, rotate: 0, opacity: 1, transition: { duration: 0.4 } });
    setIsLogoAnimating(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Separate main and bottom nav items for students
  const mainStudentNavItems = [
    { path: '/student/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/student/training/current', icon: LightningBoltIcon, label: 'Training' },
    { path: '/student/portfolio', icon: PortfolioIcon, label: 'Portfolio' },
    { path: '/student/projects', icon: FileTextIcon, label: 'Projects' },
    { path: '/student/my-resume', icon: IdCardIcon, label: 'My Resume', locked: true },
    { path: '/student/mock-interview', icon: ChatBubbleIcon, label: 'Mock Interview', locked: true },
    { path: '/student/leaderboard', icon: StarIcon, label: 'Leaderboard', locked: true },
    { path: '/student/internships', icon: EnvelopeClosedIcon, label: 'Internships', locked: true },
    { path: '/student/job-portal', icon: GlobeIcon, label: 'Job Portal', locked: true },
  ];

  const adminNavItems = [
    { path: '/admin', icon: RocketIcon, label: 'Analytics' },
    { path: '/admin/users', icon: PersonIcon, label: 'User Management' },
    { path: '/admin/admins', icon: IdCardIcon, label: 'Admin Management' },
    { path: '/admin/staff', icon: Users, label: 'Staff Management' },
    { path: '/admin/curriculum', icon: FileTextIcon, label: 'Level Management' },
    { path: '/admin/settings', icon: GearIcon, label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : mainStudentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoggingOut) {
    return <LoadingScreen message="Signing Out..." />;
  }

  return (
    <div className="flex h-screen transition-colors" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} shadow-lg border-r flex-col transition-all duration-300 relative`}
        style={{ 
          backgroundColor: 'var(--color-secondary-bg)', 
          borderColor: 'var(--color-border)' 
        }}
      >
        {/* Always show logo at the very top, centered */}
        <div 
          className="flex items-center justify-center py-6 border-b" 
          style={{ 
            position: 'relative',
            borderColor: 'var(--color-border)'
          }}
        >
          <motion.img
            src={logo}
            alt="Syncner Logo"
            className="h-10 w-10 object-contain cursor-pointer"
            initial={{ scale: 1, y: 0, x: 0, rotate: 0, opacity: 1, zIndex: 10 }}
            animate={controls}
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
            ref={logoRef}
            style={{ zIndex: 10 }}
          />
          {!isSidebarCollapsed && (
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
        {/* Arrow toggle at vertical center right edge, overlapping border */}
        <button
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 border shadow-lg p-1 rounded-xl transition"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ 
            backgroundColor: 'var(--color-secondary-bg)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {isSidebarCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
          )}
        </button>
        <nav className="flex-1 flex flex-col justify-between">
          <div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isLocked = 'locked' in item && item.locked;
              
              if (isLocked) {
                return (
                  <div
                    key={item.path}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm transition-colors cursor-not-allowed`}
                    title="Coming Soon"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Icon className="h-5 w-5" />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="ml-3">{item.label}</span>
                        <LockClosedIcon className="h-4 w-4 ml-auto" />
                      </>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm transition-colors`}
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
                  <Icon className="h-5 w-5" />
                  {!isSidebarCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
            {/* AttendanceHeatmap removed from here */}
          </div>
          {/* Bottom section for Mock Interview and Leaderboard */}
          <div className="mt-auto w-full">
            {/* AttendanceHeatmap removed from sidebar */}
          </div>
        </nav>
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-4 pb-6">
            <ThemeSwitcher variant="icon" size="md" className="mb-2 p-2 rounded-lg bg-[var(--color-accent-primary)]" />
            <Link
              to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
              className="flex items-center justify-center w-10 h-10 rounded-md mb-2"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
              title="Profile"
              aria-label="View profile"
            >
              <span 
                className="text-base font-heading"
                style={{ color: 'var(--color-text-inverse)' }}
              >
                {user?.name?.charAt(0) || 'U'}
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
              <ExitIcon className="h-5 w-5" />
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
            
            {/* Unified Profile Section - clickable */}
            <Link
              to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
              className="flex items-center gap-3 w-full px-3 py-2 mb-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-secondary-bg)] group hover:bg-[var(--color-tertiary-bg)]"
              tabIndex={0}
              aria-label="View profile"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors group-hover:border-[var(--color-accent-primary)]" style={{ 
                backgroundColor: 'var(--color-accent-primary)', 
                borderColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)' 
              }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {user?.name}
                </span>
                <span className="text-xs capitalize truncate opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
                  {user?.role}
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
              <ExitIcon className="h-4 w-4 mr-2" />
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

      {/* Mobile Header */}
      <div 
        className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 object-contain" />
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeSwitcher variant="icon" size="md" className="mr-2 p-2 rounded-lg bg-[var(--color-accent-primary)]" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
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
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</p>
                <p className="text-xs capitalize opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{user?.role}</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-1.5 rounded-md hover:bg-[var(--color-tertiary-bg)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Cross1Icon className="h-4 w-4" />
            </button>
          </div>
          {user?.college && (
            <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{user?.college}</p>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isLocked = 'locked' in item && item.locked;
            
            if (isLocked) {
              return (
                <div
                  key={item.path}
                  className="flex items-center px-6 py-3 text-sm transition-colors cursor-not-allowed"
                style={{ color: 'var(--color-text-muted)' }}
                  title="Coming Soon"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                  <LockClosedIcon className="h-4 w-4 ml-auto" />
                </div>
              );
            }
            
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
                <Icon className="h-5 w-5 mr-3" />
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
          
          {/* Unified Profile Section - clickable */}
          <Link
            to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
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
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</span>
              <span className="text-xs capitalize truncate opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{user?.role}</span>
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
            <ExitIcon className="h-4 w-4 mr-2" />
            Sign Out
          </button>
          <div className="mt-4 text-center text-xs opacity-50 select-none" style={{ color: 'var(--color-text-secondary)' }}>v1.0</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main 
          className="h-full overflow-y-auto scroll-smooth"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
