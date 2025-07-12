import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loginUser, clearError, logoutUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import LoadingScreen from '../components/LoadingScreen';
import logo from '../assets/syncner-logo.png';
import {
  ExclamationTriangleIcon,
  EnvelopeClosedIcon,
  LockClosedIcon
} from '@radix-ui/react-icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(clearError());

     dispatch(loginUser({
      email: email.trim(),
      password: password
    }));

    // No redirect here; App.tsx will handle it
  };

  if (isLoading) {
    return <LoadingScreen message="Signing In..." />;
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="bg-white/10 p-8 rounded-xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">You are already signed in as {user.name} ({user.role})</h2>
          <button
            onClick={() => dispatch(logoutUser())}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offblack flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-paperwhite mb-2">Welcome Back</h1>
          <p className="text-teallight text-sm lg:text-base">Sign in to continue your career journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-paperwhite/10 backdrop-blur-sm rounded-xl p-6 lg:p-8 border border-paperwhite/10 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-rust/10 border border-rust/20 rounded-lg flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-rust flex-shrink-0" />
              <span className="text-rust text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-paperwhite mb-2">
                Email
              </label>
              <div className="relative">
                <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-teallight" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-offblack/60 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight text-sm lg:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-paperwhite mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-teallight" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-offblack/60 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight text-sm lg:text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-trueturquoise text-offblack py-2.5 lg:py-3 rounded-lg hover:bg-teallight transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base shadow-md"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-teallight text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-trueturquoise hover:text-teallight font-medium transition-colors">
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
