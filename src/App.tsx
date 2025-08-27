import  { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { getDefaultRoute } from './utils/routing';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import OnboardingFlow from './pages/OnboardingFlow';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { KeepAlive } from 'react-activation';
import StudentProfile from './pages/StudentProfile';
import AdminProfile from './pages/AdminProfile';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchCurrentUser, restoreSession } from './redux/slices/authSlice';
import AdminStaff from './pages/AdminStaff';
import TrainingLevels from './pages/TrainingLevels';
import StaffSidebar from './pages/staff/StaffSidebar';
import AdminUsers from './pages/AdminUsers';
import AdminAdmin from './pages/AdminAdmin';
import AdminCurriculum from './pages/AdminCurriculum';
import LevelLearnPage from './pages/LevelLearnPage';
import LevelTestPage from './pages/LevelTestPage';
import LevelExercisePage from './pages/LevelExercisePage';
import ProjectsPage from './pages/ProjectsPage';

function AdminWrapper() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout />
    </ProtectedRoute>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, isRestoringSession } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  
  const location = useLocation();

  useEffect(() => {
    dispatch(restoreSession());
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  useEffect(() => {
    console.log('App.tsx Auth State:', {
      isAuthenticated,
      user,
      isLoading,
      isRestoringSession,
      userRole: user?.role,
      profileComplete: user?.profileComplete
    });
  }, [isAuthenticated, user, isLoading, isRestoringSession]);

  useEffect(() => {
    // Apply theme on mount and whenever isDarkMode changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#121212'; // Dark mode primary background
      document.body.style.backgroundColor = '#121212';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#FFFFFF'; // Light mode primary background
      document.body.style.backgroundColor = '#FFFFFF';
    }
  }, [isDarkMode]);

  // Show loading while initializing authentication or restoring session
  if (isLoading || isRestoringSession) {
    return (
      <ErrorBoundary>
        <LoadingScreen 
          message={isRestoringSession ? "Restoring session..." : "Loading..."}
          showProgress={true}
          progressDuration={2500}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
          {/* Student main pages with Layout sidebar */}
          <Route path="/student/*" element={<StudentLayout />}>
            <Route path="dashboard" element={<KeepAlive id="student-dashboard"><StudentDashboard /></KeepAlive>} />
            <Route path="training" element={<TrainingLevels />} />
            <Route path="training/:levelId" element={<TrainingLevels />} />
            <Route path="training/:levelId/learn" element={<LevelLearnPage />} />
            <Route path="training/:levelId/test" element={<LevelTestPage />} />
            <Route path="training/:levelId/exercise" element={<LevelExercisePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="profile" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StudentProfile />
              </motion.div>
            } />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminWrapper />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="admins" element={<AdminAdmin />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="curriculum" element={<AdminCurriculum />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdminProfile />
              </motion.div>
            } />
          </Route>
          {/* Staff routes */}
          <Route path="/staff/*" element={
            <ProtectedRoute>
              <StaffSidebar />
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;