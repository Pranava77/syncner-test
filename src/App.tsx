import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { setApiKeyValid } from './redux/slices/geminiSlice';
import apiService from './services/api';
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
import AIChat from './components/AIChat';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  
  const [geminiApiKey, setGeminiApiKey] = useState(
    localStorage.getItem('geminiApiKey') || ''
  );
  const [showApiKeyModal, setShowApiKeyModal] = useState(!geminiApiKey);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !isAuthenticated) {
      apiService.refreshToken();
      dispatch(fetchCurrentUser()).catch((error) => {
        console.error('App: Failed to fetch current user:', error);
      });
    }
    
    setIsInitializing(false);
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Apply theme on mount
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Set API key validity in Redux
    dispatch(setApiKeyValid(!!geminiApiKey));
  }, [geminiApiKey, dispatch]);

  const handleApiKeySubmit = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem('geminiApiKey', apiKey);
    setShowApiKeyModal(false);
    dispatch(setApiKeyValid(!!apiKey));
  };

  // Show loading while initializing authentication
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showApiKeyModal) {
    return <ApiKeyModal onSubmit={handleApiKeySubmit} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminAnalytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminSettings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/training/:moduleId" element={
            <ProtectedRoute>
              <Layout>
                <TrainingModule />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/training/current" element={
            <ProtectedRoute>
              <Layout>
                <TrainingModule />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <TaskPortal />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/resume" element={
            <ProtectedRoute>
              <Layout>
                <ResumeGenerator />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;