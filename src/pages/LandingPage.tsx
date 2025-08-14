import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { 
  ArrowRightIcon,
  BarChartIcon,
  TargetIcon,
  EnvelopeClosedIcon,
  PersonIcon,
  CheckCircledIcon
} from '@radix-ui/react-icons';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from '../components/LoadingScreen';

const LandingPage: React.FC = () => {
  const { isLoading } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Checking authentication..."
        showProgress={true}
        progressDuration={1500}
      />
    );
  }

  return (
    <div 
      className="min-h-screen"
              style={{ backgroundColor: 'var(--color-secondary-bg)' }}
    >
      {/* Header */}
      <header 
        className="backdrop-blur-md shadow-sm fixed w-full z-50 border-b"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
              </div>
              <h1 
                className="text-2xl font-heading" 
                style={{ 
                  fontFamily: 'Amatic SC, FK Grotesk, Inter, Helvetica Neue, Arial, sans-serif',
                  color: 'var(--color-text-primary)'
                }}
              >
                Syncner
              </h1>  
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 lg:px-6 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-6 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-4 lg:mb-6 font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Transform Students Into
            <span 
              className="bg-clip-text text-transparent block lg:inline"
              style={{
                background: 'linear-gradient(90deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {' '}Industry-Ready{' '}
            </span>
            Professionals
          </h1>
          <p 
            className="text-lg lg:text-xl mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            AI-powered career platform that bridges the gap between education and employment 
            through personalized training, real-world tasks, and internship simulation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              to="/login"
              className="px-6 lg:px-8 py-3 lg:py-4 rounded-lg transition-all flex items-center justify-center group"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              }}
            >
              Sign In
              <ArrowRightIcon className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="border-2 px-6 lg:px-8 py-3 lg:py-4 rounded-lg transition-all"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--color-secondary-bg)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 
              className="text-2xl lg:text-4xl mb-3 lg:mb-4 font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Everything You Need for Career Success
            </h2>
            <p 
              className="text-lg lg:text-xl"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Comprehensive platform designed for both students and college administrators
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div 
              className="backdrop-blur-sm p-6 lg:p-8 rounded-xl transition-all border"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div 
                className="p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
              >
                <BarChartIcon 
                  className="h-5 w-5 lg:h-6 lg:w-6" 
                  style={{ color: 'var(--color-text-inverse)' }}
                />
              </div>
              <h3 
                className="text-lg lg:text-xl mb-2 lg:mb-3 font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                AI-Personalized Learning
              </h3>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Adaptive learning paths that adjust to each student's pace and performance, 
                ensuring optimal skill development.
              </p>
            </div>

            <div 
              className="backdrop-blur-sm p-6 lg:p-8 rounded-xl transition-all border"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div 
                className="p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4"
                style={{ backgroundColor: 'var(--color-accent-secondary)' }}
              >
                <PersonIcon 
                  className="h-5 w-5 lg:h-6 lg:w-6" 
                  style={{ color: 'var(--color-text-inverse)' }}
                />
              </div>
              <h3 
                className="text-lg lg:text-xl mb-2 lg:mb-3 font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Real-World Tasks
              </h3>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Industry-standard projects and internship simulations that prepare students 
                for actual workplace challenges.
              </p>
            </div>

            <div 
              className="backdrop-blur-sm p-6 lg:p-8 rounded-xl transition-all border"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div 
                className="p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4"
                style={{ backgroundColor: 'var(--color-error)' }}
              >
                <TargetIcon 
                  className="h-5 w-5 lg:h-6 lg:w-6" 
                  style={{ color: 'var(--color-text-inverse)' }}
                />
              </div>
              <h3 
                className="text-lg lg:text-xl mb-2 lg:mb-3 font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Career Tracks
              </h3>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Specialized paths in AI/ML, Full Stack Development, UI/UX Design, 
                and Data Science with industry-relevant curriculum.
              </p>
            </div>

            <div 
              className="backdrop-blur-sm p-6 lg:p-8 rounded-xl transition-all border"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div 
                className="p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4"
                style={{ backgroundColor: 'var(--color-warning)' }}
              >
                <EnvelopeClosedIcon 
                  className="h-5 w-5 lg:h-6 lg:w-6" 
                  style={{ color: 'var(--color-text-inverse)' }}
                />
              </div>
              <h3 
                className="text-lg lg:text-xl mb-2 lg:mb-3 font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Interactive Content
              </h3>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Engaging video tutorials, interactive assessments, and hands-on coding 
                exercises to reinforce learning.
              </p>
            </div>

            <div 
              className="backdrop-blur-sm p-6 lg:p-8 rounded-xl transition-all border"
              style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div 
                className="p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4"
                style={{ backgroundColor: 'var(--color-info)' }}
              >
                <CheckCircledIcon 
                  className="h-5 w-5 lg:h-6 lg:w-6" 
                  style={{ color: 'var(--color-text-inverse)' }}
                />
              </div>
              <h3 
                className="text-lg lg:text-xl mb-2 lg:mb-3 font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Admin Analytics
              </h3>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Comprehensive dashboard for tracking student progress, attendance, 
                and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-2xl lg:text-4xl mb-4 lg:mb-6 font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Ready to Transform Your Career Journey?
          </h2>
          <p 
            className="text-lg lg:text-xl mb-6 lg:mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Join thousands of students who are already building their future with Syncner
          </p>
          <Link
            to="/login"
            className="px-6 lg:px-8 py-3 lg:py-4 rounded-lg transition-colors inline-flex items-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-accent-primary)'
            }}
          >
            Get Started Today
            <ArrowRightIcon className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="backdrop-blur-sm py-8 lg:py-12 px-4 sm:px-6 lg:px-8 border-t"
        style={{
          backgroundColor: 'var(--color-secondary-bg)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4 lg:mb-6">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
            </div>
          </div>
          <p 
            className="mb-3 lg:mb-4 text-sm lg:text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Empowering the next generation of professionals through AI-driven career development
          </p>
          <p 
            className="text-xs lg:text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            © 2024 Syncner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;