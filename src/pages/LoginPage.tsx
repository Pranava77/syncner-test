import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { loginUser, clearError, fetchCurrentUser } from '../redux/slices/authSlice';
import { getDefaultRoute } from '../utils/routing';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import logo from '../assets/syncner-logo.png';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
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

    console.log('Login result:', result);

    if (loginUser.fulfilled.match(result) && result.payload && result.payload.user) {
      // Fetch the current user to update Redux state
      await dispatch(fetchCurrentUser());
      const { user: loggedInUser } = result.payload;
      const redirectPath = getDefaultRoute(loggedInUser);
      navigate(redirectPath, { replace: true });
    } else if (loginUser.rejected.match(result)) {
      // Optionally show an error message (already handled by Redux)
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--brand-text)] mb-2">Welcome Back</h1>
          <p className="text-[var(--brand-primary)] text-sm lg:text-base">Sign in to continue your career journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--brand-bg-alt)]/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 border border-[var(--brand-bg-alt)]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-primary)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-[var(--brand-bg)] border border-[var(--brand-bg-alt)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] text-sm lg:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-primary)]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-[var(--brand-bg)] border border-[var(--brand-bg-alt)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] text-sm lg:text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white py-2.5 lg:py-3 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-[var(--brand-primary)] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--brand-secondary)] hover:text-[var(--brand-accent)] font-medium">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;