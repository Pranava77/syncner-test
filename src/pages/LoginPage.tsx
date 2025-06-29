import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { toggleDarkMode } from '../redux/slices/themeSlice';
import { getDefaultRoute } from '../utils/routing';
import { Mail, Lock, AlertCircle, Moon, Sun } from 'lucide-react';
import logo from '../assets/syncner-logo.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getDefaultRoute(user);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(clearError());

    const result = await dispatch(loginUser({
      email: email.trim(),
      password: password
    }));

    if (loginUser.rejected.match(result)) {
      // console.error('LoginPage: Login error:', error);
    }
  };

  const handleTestLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleToggleDarkMode}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100 text-sm lg:text-base">Sign in to continue your career journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-2xl p-6 lg:p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 lg:p-4 flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-300 text-sm lg:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-300 text-sm lg:text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 lg:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-blue-100 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 lg:mt-6 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/10">
          <p className="text-sm font-medium text-white mb-3">Demo Credentials:</p>
          <div className="space-y-2">
            <button
              onClick={() => handleTestLogin('owner@owner.com', '12345')}
              className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <div className="text-xs lg:text-sm text-blue-100">
                <p><strong className="text-white">Platform Owner:</strong> owner@owner.com / 12345</p>
                <p className="text-blue-200 text-xs mt-1">Full admin access to all features</p>
              </div>
            </button>
            
            <button
              onClick={() => handleTestLogin('student@university.edu', 'password')}
              className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <div className="text-xs lg:text-sm text-blue-100">
                <p><strong className="text-white">Student:</strong> student@university.edu / password</p>
                <p className="text-blue-200 text-xs mt-1">Student dashboard and learning features</p>
              </div>
            </button>
            
            <button
              onClick={() => handleTestLogin('admin@university.edu', 'password')}
              className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <div className="text-xs lg:text-sm text-blue-100">
                <p><strong className="text-white">Admin:</strong> admin@university.edu / password</p>
                <p className="text-blue-200 text-xs mt-1">College admin features and analytics</p>
              </div>
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-blue-200 text-xs text-center">
              Click any credential above to auto-fill, or use any email/password combination
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;