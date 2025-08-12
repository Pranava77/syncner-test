import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { restoreSession, fetchCurrentUser } from './redux/slices/authSlice';
import { setDarkMode } from './redux/slices/themeSlice';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingFlow from './pages/OnboardingFlow';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAdmin from './pages/AdminAdmin';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminProfile from './pages/AdminProfile';
import AdminSettings from './pages/AdminSettings';
import AdminStaff from './pages/AdminStaff';
import AdminUsers from './pages/AdminUsers';
import StudentProfile from './pages/StudentProfile';
import TrainingLevels from './pages/TrainingLevels';
import TrainingLevelDetail from './pages/TrainingLevelDetail';
import LevelLearnPage from './pages/LevelLearnPage';
import LevelTestPage from './pages/LevelTestPage';
import LevelExercisePage from './pages/LevelExercisePage';
import ProjectsPage from './pages/ProjectsPage';
import './index.css';

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
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = '#0f172a'; // Dark background
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.backgroundColor = '#ffffff'; // Light background
    }
    
    // Add theme transition class to body
    document.body.classList.add('theme-transition');
  }, [isDarkMode]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if current theme is set to 'system'
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme === 'system') {
        dispatch(setDarkMode(e.matches));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch]);

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
      <Router>
        <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-offblack text-paperwhite' 
            : 'bg-paperwhite-light text-offblack-light'
        }`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="training" element={<TrainingLevels />} />
              <Route path="training/:levelId" element={<TrainingLevelDetail />} />
              <Route path="training/:levelId/learn" element={<LevelLearnPage />} />
              <Route path="training/:levelId/test" element={<LevelTestPage />} />
              <Route path="training/:levelId/exercise" element={<LevelExercisePage />} />
              <Route path="projects" element={<ProjectsPage />} />
            </Route>
            
            {/* Staff Routes */}
            <Route path="/staff" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<StaffDashboard />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="admin" element={<AdminAdmin />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="curriculum" element={<AdminCurriculum />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;