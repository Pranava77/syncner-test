import { useState, useEffect } from 'react';
import { loginUser, clearError, logoutUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import LoadingScreen from '../components/LoadingScreen';
import ThemeSwitcher from '../components/ThemeSwitcher';
import logo from '../assets/syncner-logo.png';
import {
  ExclamationTriangleIcon,
  EnvelopeClosedIcon,
  LockClosedIcon
} from '@radix-ui/react-icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  // Handle errors from Redux state
  useEffect(() => {
    if (error) {
      const errorMessage = error.toLowerCase();
      
      // Handle specific error cases
      if (errorMessage.includes('email') || errorMessage.includes('user not found') || errorMessage.includes('user does not exist')) {
        setEmailError('Email address not found. Please check your email or register.');
      } else if (errorMessage.includes('password') || errorMessage.includes('invalid password') || errorMessage.includes('incorrect password')) {
        setPasswordError('Incorrect password. Please try again.');
      } else if (errorMessage.includes('invalid credentials') || errorMessage.includes('wrong credentials')) {
        setPasswordError('Invalid email or password. Please check your credentials.');
      } else if (errorMessage.includes('account locked') || errorMessage.includes('account suspended')) {
        setEmailError('Account is locked. Please contact support.');
      } else if (errorMessage.includes('too many attempts') || errorMessage.includes('rate limit')) {
        setPasswordError('Too many login attempts. Please try again later.');
      }
    }
  }, [error]);

  const validateForm = () => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    
    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    setEmailError('');
    setPasswordError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser({
        email: email.trim(),
        password: password
      }));
      
      // Check if login failed and handle specific errors
      if (loginUser.rejected.match(result)) {
        const errorMessage = result.payload as string;
        
        // Handle specific error cases
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('user not found')) {
          setEmailError('Email address not found. Please check your email or register.');
        } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('invalid password')) {
          setPasswordError('Incorrect password. Please try again.');
        } else if (errorMessage.toLowerCase().includes('invalid credentials')) {
          setPasswordError('Invalid email or password. Please check your credentials.');
        }
        // Generic error will still show in the main error area
      }
    } catch (error) {
      console.error('Login error:', error);
    }

    // No redirect here; App.tsx will handle it
  };

  if (isLoading) {
    return <LoadingScreen message="Signing In..." />;
  }

  if (isAuthenticated && user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(to bottom right, var(--color-primary-bg), var(--color-secondary-bg), var(--color-tertiary-bg))'
        }}
      >
        <div 
          className="p-8 rounded-xl shadow-xl text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            You are already signed in as {user.name} ({user.role})
          </h2>
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
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher variant="button" size="sm" />
      </div>
      
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 
            className="text-2xl lg:text-3xl mb-2 font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome Back
          </h1>
          <p 
            className="text-sm lg:text-base font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Sign in to continue your career journey
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="backdrop-blur-sm rounded-xl p-6 lg:p-8 border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {error && !emailError && !passwordError && (
            <div className="mb-4 p-3 rounded-lg flex items-center space-x-2" style={{
              backgroundColor: 'var(--color-error-bg)',
              borderColor: 'var(--color-error)',
              border: '1px solid'
            }}>
              <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
              <span className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm mb-2 font-label"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Email
              </label>
              <div className="relative">
                <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border rounded-lg transition-colors text-sm lg:text-base ${
                    emailError ? '' : ''
                  }`}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = emailError ? 'var(--color-error)' : 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: emailError ? undefined : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{emailError}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm mb-2 font-label"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className={`w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border rounded-lg transition-colors text-sm lg:text-base ${
                    passwordError ? '' : ''
                  }`}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = passwordError ? 'var(--color-error)' : 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: passwordError ? undefined : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>
              {passwordError && (
                <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 lg:py-3 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base shadow-md"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }
              }}
            >
              Sign In
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default LoginPage;
