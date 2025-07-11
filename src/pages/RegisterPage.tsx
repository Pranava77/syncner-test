import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { getDefaultRoute } from '../utils/routing';
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
    <div className="min-h-screen bg-offblack flex items-center justify-center p-4 relative">
      {/* Optional: Minimal pattern or leave solid for minimalism */}
      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-paperwhite mb-2">Create Account</h1>
          <p className="text-teallight">Join Syncner and start your learning journey</p>
        </div>

        {/* Form */}
        <div className="bg-paperwhite/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-paperwhite/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rust/10 border border-rust/30 rounded-lg p-4 flex items-center space-x-3">
                <CrossCircledIcon className="h-5 w-5 text-rust flex-shrink-0" />
                <span className="text-rust text-sm">{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-paperwhite mb-2">
                Full Name
              </label>
              <div className="relative">
                <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teallight" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-offblack/60 border rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight ${
                    errors.name ? 'border-rust' : 'border-paperwhite/20'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5 text-rust" />
                  </div>
                )}
              </div>
              {errors.name && <p className="text-rust text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-paperwhite mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teallight" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-offblack/60 border rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight ${
                    errors.email ? 'border-rust' : 'border-paperwhite/20'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5 text-rust" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-rust text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-paperwhite mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teallight" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-offblack/60 border rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight ${
                    errors.password ? 'border-rust' : 'border-paperwhite/20'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teallight hover:text-paperwhite"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {errors.password && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5 text-rust" />
                  </div>
                )}
              </div>
              {errors.password && <p className="text-rust text-xs mt-1">{errors.password}</p>}

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-teallight rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.color === 'red' ? 'bg-rust' :
                          passwordStrength.color === 'orange' ? 'bg-rust/70' :
                          passwordStrength.color === 'yellow' ? 'bg-teallight' :
                          passwordStrength.color === 'lightgreen' ? 'bg-trueturquoise' :
                          passwordStrength.color === 'green' ? 'bg-trueturquoise' :
                          'bg-trueturquoise/80'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${
                      passwordStrength.color === 'red' ? 'text-rust' :
                      passwordStrength.color === 'orange' ? 'text-rust/70' :
                      passwordStrength.color === 'yellow' ? 'text-teallight' :
                      passwordStrength.color === 'lightgreen' ? 'text-trueturquoise' :
                      passwordStrength.color === 'green' ? 'text-trueturquoise' :
                      'text-trueturquoise/80'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-paperwhite mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teallight" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-offblack/60 border rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight ${
                    errors.confirmPassword ? 'border-rust' : 'border-paperwhite/20'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teallight hover:text-paperwhite"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <CheckCircledIcon className="h-5 w-5 text-trueturquoise" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-rust text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* College Field */}
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-paperwhite mb-2">
                College/University
              </label>
              <div className="relative">
                <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teallight" />
                <input
                  id="college"
                  name="college"
                  type="text"
                  value={formData.college}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-offblack/60 border rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite placeholder-teallight ${
                    errors.college ? 'border-rust' : 'border-paperwhite/20'
                  }`}
                  placeholder="Enter your college/university"
                />
                {errors.college && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CrossCircledIcon className="h-5 w-5 text-rust" />
                  </div>
                )}
              </div>
              {errors.college && <p className="text-rust text-xs mt-1">{errors.college}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-paperwhite mb-2">
                I am a
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-offblack/60 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors text-paperwhite appearance-none"
                >
                  <option value="student" className="bg-offblack text-paperwhite">Student</option>
                  <option value="admin" className="bg-offblack text-paperwhite">Administrator</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-teallight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-trueturquoise text-offblack py-3 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-offblack"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-teallight text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-trueturquoise hover:text-trueturquoise/90 transition-colors font-medium">
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