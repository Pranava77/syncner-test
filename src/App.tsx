import  { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { fetchCurrentUser, restoreSession } from './redux/slices/authSlice';
import { getDefaultRoute } from './utils/routing';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import TrainingModule from './pages/TrainingModule';
import TaskPortal from './pages/TaskPortal';
import ResumeGenerator from './pages/ResumeGenerator';
import OnboardingFlow from './pages/OnboardingFlow';
import ProtectedRoute from './components/ProtectedRoute';
import UpcomingTasks from './pages/UpcomingTasks';
import StudentSubmissions from './pages/StudentTasks';
import AdminDiagnostics from './pages/AdminDiagnostics';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, isRestoringSession } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Restore session from localStorage
      dispatch(restoreSession());
      
      const token = localStorage.getItem('token');
      
      if (token && !user) {
        try {
          // Fetch current user data
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.error('App: Failed to fetch current user:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          dispatch(restoreSession()); // Update state after clearing
        }
      }
      
      setIsInitializing(false);
    };

    initializeAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    // Apply theme on mount and whenever isDarkMode changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#111827'; // Tailwind dark:bg-gray-900
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f9fafb'; // Tailwind bg-gray-50
    }
  }, [isDarkMode]);

  // Show loading while initializing authentication or restoring session
  if (isInitializing || isLoading || isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const routes = [
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: '/login',
      element: isAuthenticated && user && !isLoading && !isRestoringSession ? (
        <Navigate to={getDefaultRoute(user)} replace />
      ) : (
        <LoginPage />
      ),
    },
    {
      path: '/register',
      element: isAuthenticated && user && !isLoading && !isRestoringSession ? (
        <Navigate to={getDefaultRoute(user)} replace />
      ) : (
        <RegisterPage />
      ),
    },
    {
      path: '/onboarding',
      element: (
        <ProtectedRoute>
          <OnboardingFlow />
        </ProtectedRoute>
      ),
    },
    {
      path: '/student',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: 'dashboard', element: <StudentDashboard /> },
        { path: 'training/:moduleId', element: <TrainingModule /> },
        { path: 'training/current', element: <TrainingModule /> },
        { path: 'tasks', element: <TaskPortal /> },
        { path: 'tasks/upcoming', element: <UpcomingTasks /> },
        { path: 'resume', element: <ResumeGenerator /> },
        { path: 'submissions', element: <StudentSubmissions /> },
      ],
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute requireAdmin>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: '', element: <AdminDashboard /> },
        { path: 'analytics', element: <AdminAnalytics /> },
        { path: 'diagnostics', element: <AdminDiagnostics /> },
        { path: 'settings', element: <AdminSettings /> },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return (
    <RouterProvider router={router} />
  );
}

export default App;