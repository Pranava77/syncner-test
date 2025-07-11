import  { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import StudentProfile from './pages/StudentProfile';
import AdminProfile from './pages/AdminProfile';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, isRestoringSession } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();

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
  console.log('App State:', {
    isInitializing,
    isLoading,
    isRestoringSession,
    isAuthenticated,
    user,
  });

  if (isInitializing || isLoading || isRestoringSession) {
    return (
      <LoadingScreen 
        message={isInitializing ? "Initializing..." : isRestoringSession ? "Restoring session..." : "Loading..."}
        showProgress={true}
        progressDuration={2500}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          isAuthenticated && user && !isLoading && !isRestoringSession ? (
            <Navigate to={getDefaultRoute(user)} replace />
          ) : (
            <LoginPage />
          )
        } />
        <Route path="/register" element={
          isAuthenticated && user && !isLoading && !isRestoringSession ? (
            <Navigate to={getDefaultRoute(user)} replace />
          ) : (
            <RegisterPage />
          )
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingFlow />
          </ProtectedRoute>
        } />
        <Route path="/student/*" element={<StudentLayout />}>
          <Route path="dashboard" element={<KeepAlive id="student-dashboard"><StudentDashboard /></KeepAlive>} />
          <Route path="training/:moduleId" element={<KeepAlive id="training-module"><TrainingModule /></KeepAlive>} />
          <Route path="training/current" element={<KeepAlive id="training-current"><TrainingModule /></KeepAlive>} />
          <Route path="tasks" element={<KeepAlive id="task-portal"><TaskPortal /></KeepAlive>} />
          <Route path="tasks/upcoming" element={<KeepAlive id="upcoming-tasks"><UpcomingTasks /></KeepAlive>} />
          <Route path="resume" element={<KeepAlive id="resume-generator"><ResumeGenerator /></KeepAlive>} />
          <Route path="submissions" element={<KeepAlive id="student-submissions"><StudentSubmissions /></KeepAlive>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/profile" element={
          <ProtectedRoute>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Layout>
                <StudentProfile />
              </Layout>
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute requireAdmin>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Layout>
                <AdminProfile />
              </Layout>
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute requireAdmin>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="diagnostics" element={<AdminDiagnostics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;