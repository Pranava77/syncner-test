import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { getDefaultRoute } from '../utils/routing';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { 
  EnvelopeClosedIcon,
  LockClosedIcon, 
  PersonIcon, 
  CrossCircledIcon,
  CheckCircledIcon
} from '@radix-ui/react-icons';
import logo from '../assets/syncner-logo.png';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    careerTrack: '',
    role: 'student'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useAppDispatch();
  const { isLoading, error} = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // College validation
    if (!formData.college.trim()) {
      newErrors.college = 'College is required';
    } else if (formData.college.trim().length < 2) {
      newErrors.college = 'College name must be at least 2 characters';
    }

    // Career Track validation
    if (!formData.careerTrack) {
      newErrors.careerTrack = 'Career track is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    dispatch(clearError());

    const result = await dispatch(registerUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      college: formData.college.trim(),
      careerTrack: formData.careerTrack,
      role: formData.role
    }));

    setIsSubmitting(false);

    if (registerUser.fulfilled.match(result)) {
      const { user: registeredUser } = result.payload;
      const redirectPath = getDefaultRoute(registeredUser);
      window.location.href = redirectPath;
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: 'gray', text: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green', 'darkgreen'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    
    return {
      strength: Math.min(strength, 5),
      color: colors[Math.min(strength, 5)],
      text: texts[Math.min(strength, 5)]
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher variant="button" size="sm" />
      </div>
      
      {/* Optional: Minimal pattern or leave solid for minimalism */}
      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 
            className="text-3xl mb-2 font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Create Account
          </h1>
          <p 
            className="font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Join Syncner and start your learning journey
          </p>
        </div>

        {/* Form */}
        <div 
          className="backdrop-blur-md rounded-xl p-6 border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg p-4 flex items-center space-x-3" style={{
                backgroundColor: 'var(--color-error-bg)',
                borderColor: 'var(--color-error)',
                border: '1px solid'
              }}>
                <CrossCircledIcon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
                <span className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                Full Name
              </label>
              <div className="relative">
                <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.name ? 'var(--color-error)' : 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                  </div>
                )}
              </div>
              {errors.name && <p className="text-xs mt-1 font-label" style={{ color: 'var(--color-error)' }}>{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                Email Address
              </label>
              <div className="relative">
                <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.email ? 'var(--color-error)' : 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-xs mt-1 font-label" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: errors.password ? 'var(--color-error)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.password ? 'var(--color-error)' : 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {errors.password && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                  </div>
                )}
              </div>
              {errors.password && <p className="text-xs mt-1 font-label" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.color === 'red' ? 'var(--color-error)' :
                          passwordStrength.color === 'orange' ? 'var(--color-warning)' :
                          passwordStrength.color === 'yellow' ? 'var(--color-warning)' :
                          passwordStrength.color === 'lightgreen' ? 'var(--color-success)' :
                          passwordStrength.color === 'green' ? 'var(--color-success)' :
                          'var(--color-accent-primary)'
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{
                      color: passwordStrength.color === 'red' ? 'var(--color-error)' :
                      passwordStrength.color === 'orange' ? 'var(--color-warning)' :
                      passwordStrength.color === 'yellow' ? 'var(--color-warning)' :
                      passwordStrength.color === 'lightgreen' ? 'var(--color-success)' :
                      passwordStrength.color === 'green' ? 'var(--color-success)' :
                      'var(--color-accent-primary)'
                    }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <CheckCircledIcon className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1 font-label" style={{ color: 'var(--color-error)' }}>{errors.confirmPassword}</p>}
            </div>

            {/* College Field */}
            <div>
              <label htmlFor="college" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                College/University
              </label>
              <div className="relative">
                <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  id="college"
                  name="college"
                  type="text"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: errors.college ? 'var(--color-error)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.college ? 'var(--color-error)' : 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your college/university"
                />
                {errors.college && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                  </div>
                )}
              </div>
              {errors.college && <p className="text-xs mt-1 font-label" style={{ color: 'var(--color-error)' }}>{errors.college}</p>}
            </div>

            {/* Career Track Selection */}
            <div>
              <label htmlFor="careerTrack" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                Career Track
              </label>
              <div className="relative">
                <select
                  id="careerTrack"
                  name="careerTrack"
                  value={formData.careerTrack}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors appearance-none"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: errors.careerTrack ? 'var(--color-error)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.careerTrack ? 'var(--color-error)' : 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>Select a career track</option>
                  <option value="full-stack" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>Full Stack Development</option>
                  <option value="ai-ml" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>AI/ML Engineering</option>
                  <option value="ui-ux" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>UI/UX Design</option>
                  <option value="data-science" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>Data Science</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.careerTrack && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                  </div>
                )}
              </div>
              {errors.careerTrack && <p className="text-xs mt-1 font-label" style={{ color: 'var(--color-error)' }}>{errors.careerTrack}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm mb-2 font-label" style={{ color: 'var(--color-text-primary)' }}>
                I am a
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors appearance-none"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="student" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>Student</option>
                  <option value="admin" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-primary)' }}>Administrator</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }
              }}
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.img
                    src={logo}
                    alt="Syncner Logo"
                    className="w-4 h-4"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="transition-colors font-medium" style={{ color: 'var(--color-accent-primary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-accent-primary)'; }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 