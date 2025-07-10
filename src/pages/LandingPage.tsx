import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getDefaultRoute } from '../utils/routing';
import { 
  Target, 
  Brain, 
  Users, 
  ArrowRight,
  BookOpen,
  Award,
  Briefcase,

  Menu,
  X
} from 'lucide-react';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from '../components/LoadingScreen';

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useAppSelector((state) => state.theme);
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Redirect authenticated users to their appropriate dashboard
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPath = getDefaultRoute(user);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

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

  // Don't render landing page if user is authenticated (they will be redirected)
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] transition-colors">
      {/* Header */}
      <header className="bg-[var(--brand-bg-alt)]/80 dark:bg-[var(--brand-bg-alt)]/80 backdrop-blur-md shadow-sm fixed w-full z-50 border-b border-[var(--brand-bg-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 rounded-lg">
                <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--brand-text)] font-satoshi">Syncner</h1>  
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white px-4 lg:px-6 py-2 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[var(--brand-text)] hover:text-[var(--brand-primary)] p-2 rounded-lg hover:bg-[var(--brand-bg-alt)] transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[var(--brand-bg-alt)]">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white px-6 py-3 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium"
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--brand-text)] mb-4 lg:mb-6">
            Transform Students Into
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent block lg:inline">
              {' '}Industry-Ready{' '}
            </span>
            Professionals
          </h1>
          <p className="text-lg lg:text-xl text-[var(--brand-primary)] mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered career platform that bridges the gap between education and employment 
            through personalized training, real-world tasks, and internship simulation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              to="/login"
              className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium flex items-center justify-center group"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="border-2 border-[var(--brand-primary)] text-[var(--brand-text)] px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:border-[var(--brand-accent)] hover:bg-[var(--brand-bg-alt)] transition-all font-medium"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--brand-bg-alt)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-[var(--brand-text)] mb-3 lg:mb-4">
              Everything You Need for Career Success
            </h2>
            <p className="text-lg lg:text-xl text-[var(--brand-primary)]">
              Comprehensive platform designed for both students and college administrators
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-[var(--brand-bg)] p-6 lg:p-8 rounded-xl hover:bg-[var(--brand-bg-alt)] transition-all border border-[var(--brand-bg-alt)]">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)] mb-2 lg:mb-3">AI-Personalized Learning</h3>
              <p className="text-[var(--brand-primary)] text-sm lg:text-base">
                Adaptive learning paths that adjust to each student's pace and performance, 
                ensuring optimal skill development.
              </p>
            </div>

            <div className="bg-[var(--brand-bg)] p-6 lg:p-8 rounded-xl hover:bg-[var(--brand-bg-alt)] transition-all border border-[var(--brand-bg-alt)]">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <Briefcase className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)] mb-2 lg:mb-3">Real-World Tasks</h3>
              <p className="text-[var(--brand-primary)] text-sm lg:text-base">
                Industry-standard projects and internship simulations that prepare students 
                for actual workplace challenges.
              </p>
            </div>

            <div className="bg-[var(--brand-bg)] p-6 lg:p-8 rounded-xl hover:bg-[var(--brand-bg-alt)] transition-all border border-[var(--brand-bg-alt)]">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <Target className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)] mb-2 lg:mb-3">Career Tracks</h3>
              <p className="text-[var(--brand-primary)] text-sm lg:text-base">
                Specialized paths in AI/ML, Full Stack Development, UI/UX Design, 
                and Data Science with industry-relevant curriculum.
              </p>
            </div>

            <div className="bg-[var(--brand-bg)] p-6 lg:p-8 rounded-xl hover:bg-[var(--brand-bg-alt)] transition-all border border-[var(--brand-bg-alt)]">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)] mb-2 lg:mb-3">Interactive Content</h3>
              <p className="text-[var(--brand-primary)] text-sm lg:text-base">
                Engaging video tutorials, interactive assessments, and hands-on coding 
                exercises to reinforce learning.
              </p>
            </div>

            <div className="bg-[var(--brand-bg)] p-6 lg:p-8 rounded-xl hover:bg-[var(--brand-bg-alt)] transition-all border border-[var(--brand-bg-alt)]">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <Award className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)] mb-2 lg:mb-3">AI Resume Builder</h3>
              <p className="text-[var(--brand-primary)] text-sm lg:text-base">
                Automatically generate professional resumes showcasing completed projects, 
                skills, and achievements.
              </p>
            </div>

            <div className="bg-[var(--brand-bg)] p-6 lg:p-8 rounded-xl hover:bg-[var(--brand-bg-alt)] transition-all border border-[var(--brand-bg-alt)]">
              <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)] mb-2 lg:mb-3">Admin Analytics</h3>
              <p className="text-[var(--brand-primary)] text-sm lg:text-base">
                Comprehensive dashboard for tracking student progress, attendance, 
                and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--brand-primary)]/20 to-purple-600/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-4xl font-bold text-[var(--brand-text)] mb-4 lg:mb-6">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-lg lg:text-xl text-[var(--brand-primary)] mb-6 lg:mb-8">
            Join thousands of students who are already building their future with Syncner
          </p>
          <Link
            to="/login"
            className="bg-[var(--brand-text)] text-[var(--brand-primary)] px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:bg-[var(--brand-bg-alt)] transition-colors font-medium inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--brand-bg-alt)]/20 backdrop-blur-sm text-[var(--brand-text)] py-8 lg:py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--brand-bg-alt)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4 lg:mb-6">
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-2 rounded-lg">
              <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
            </div>
          </div>
          <p className="text-[var(--brand-primary)] mb-3 lg:mb-4 text-sm lg:text-base">
            Empowering the next generation of professionals through AI-driven career development
          </p>
          <p className="text-[var(--brand-secondary)] text-xs lg:text-sm">
            © 2024 Syncner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;