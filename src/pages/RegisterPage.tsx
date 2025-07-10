import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { getDefaultRoute } from '../utils/routing';
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  AlertCircle, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react';
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
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

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
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center p-4 transition-colors">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none" style={{ background: "url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-2">Create Account</h1>
          <p className="text-[var(--brand-primary)]">Join Syncner and start your learning journey</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--brand-bg-alt)]/80 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-[var(--brand-bg-alt)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--brand-primary)]" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-[var(--brand-bg)] border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] ${
                    errors.name ? 'border-red-500' : 'border-[var(--brand-bg-alt)]'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--brand-primary)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-[var(--brand-bg)] border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] ${
                    errors.email ? 'border-red-500' : 'border-[var(--brand-bg-alt)]'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--brand-primary)]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-[var(--brand-bg)] border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] ${
                    errors.password ? 'border-red-500' : 'border-[var(--brand-bg-alt)]'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--brand-primary)] hover:text-[var(--brand-text)]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-[var(--brand-bg-alt)] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'orange' ? 'bg-orange-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          passwordStrength.color === 'lightgreen' ? 'bg-green-400' :
                          passwordStrength.color === 'green' ? 'bg-green-500' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${
                      passwordStrength.color === 'red' ? 'text-red-400' :
                      passwordStrength.color === 'orange' ? 'text-orange-400' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                      passwordStrength.color === 'lightgreen' ? 'text-green-400' :
                      passwordStrength.color === 'green' ? 'text-green-400' :
                      'text-green-300'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--brand-primary)]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-[var(--brand-bg)] border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[var(--brand-bg-alt)]'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--brand-primary)] hover:text-[var(--brand-text)]"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* College Field */}
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                College/University
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--brand-primary)]" />
                <input
                  id="college"
                  name="college"
                  type="text"
                  value={formData.college}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-[var(--brand-bg)] border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] placeholder-[var(--brand-primary)] ${
                    errors.college ? 'border-red-500' : 'border-[var(--brand-bg-alt)]'
                  }`}
                  placeholder="Enter your college/university"
                />
                {errors.college && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>
              {errors.college && <p className="text-red-400 text-xs mt-1">{errors.college}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                I am a
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--brand-bg)] border border-[var(--brand-bg-alt)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors text-[var(--brand-text)] appearance-none"
                >
                  <option value="student" className="bg-[var(--brand-bg-alt)] text-[var(--brand-text)]">Student</option>
                  <option value="admin" className="bg-[var(--brand-bg-alt)] text-[var(--brand-text)]">Administrator</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-[var(--brand-text)] py-3 rounded-lg hover:from-[var(--brand-secondary)] hover:to-[var(--brand-primary)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--brand-text)]"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-[var(--brand-primary)] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--brand-secondary)] hover:text-[var(--brand-primary)] font-medium transition-colors">
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