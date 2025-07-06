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
import StudentLayout from './components/StudentLayout';
import LoadingScreen from './components/LoadingScreen';
import { KeepAlive } from 'react-activation';

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
      <LoadingScreen 
        message={isInitializing ? "Initializing..." : isRestoringSession ? "Restoring session..." : "Loading..."}
        showProgress={true}
        progressDuration={2500}
      />
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
      element: <StudentLayout />,
      children: [
        { path: 'dashboard', element: <KeepAlive id="student-dashboard"><StudentDashboard /></KeepAlive> },
        { path: 'training/:moduleId', element: <KeepAlive id="training-module"><TrainingModule /></KeepAlive> },
        { path: 'training/current', element: <KeepAlive id="training-current"><TrainingModule /></KeepAlive> },
        { path: 'tasks', element: <KeepAlive id="task-portal"><TaskPortal /></KeepAlive> },
        { path: 'tasks/upcoming', element: <KeepAlive id="upcoming-tasks"><UpcomingTasks /></KeepAlive> },
        { path: 'resume', element: <KeepAlive id="resume-generator"><ResumeGenerator /></KeepAlive> },
        { path: 'submissions', element: <KeepAlive id="student-submissions"><StudentSubmissions /></KeepAlive> },
        { index: true, element: <Navigate to="dashboard" replace /> },
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