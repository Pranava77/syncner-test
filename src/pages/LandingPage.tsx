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
    <div className="min-h-screen bg-offblack">
      {/* Header */}
      <header className="bg-paperwhite/5 backdrop-blur-md shadow-sm fixed w-full z-50 border-b border-paperwhite/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
              </div>
              <h1 className="text-2xl text-paperwhite font-heading" style={{ fontFamily: 'Amatic SC, FK Grotesk, Inter, Helvetica Neue, Arial, sans-serif' }}>Syncner</h1>  
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-trueturquoise text-offblack px-4 lg:px-6 py-2 rounded-lg hover:bg-teallight transition-all"
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
                className="block w-full text-center bg-trueturquoise text-offblack px-6 py-3 rounded-lg hover:bg-teallight transition-all"
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-paperwhite mb-4 lg:mb-6 font-heading">
            Transform Students Into
            <span className="bg-gradient-to-r from-trueturquoise to-teallight bg-clip-text text-transparent block lg:inline">
              {' '}Industry-Ready{' '}
            </span>
            Professionals
          </h1>
          <p className="text-lg lg:text-xl text-teallight mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered career platform that bridges the gap between education and employment 
            through personalized training, real-world tasks, and internship simulation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              to="/login"
              className="bg-trueturquoise text-offblack px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:bg-teallight transition-all flex items-center justify-center group"
            >
              Sign In
              <ArrowRightIcon className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="border-2 border-paperwhite/30 text-paperwhite px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:border-paperwhite/50 hover:bg-paperwhite/10 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-paperwhite/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl text-paperwhite mb-3 lg:mb-4 font-heading">
              Everything You Need for Career Success
            </h2>
            <p className="text-lg lg:text-xl text-teallight">
              Comprehensive platform designed for both students and college administrators
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-paperwhite/10 backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-paperwhite/15 transition-all border border-paperwhite/10">
              <div className="bg-trueturquoise p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <BarChartIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl text-paperwhite mb-2 lg:mb-3 font-heading">AI-Personalized Learning</h3>
              <p className="text-teallight text-sm lg:text-base">
                Adaptive learning paths that adjust to each student's pace and performance, 
                ensuring optimal skill development.
              </p>
            </div>

            <div className="bg-paperwhite/10 backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-paperwhite/15 transition-all border border-paperwhite/10">
              <div className="bg-teallight p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <PersonIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl text-paperwhite mb-2 lg:mb-3 font-heading">Real-World Tasks</h3>
              <p className="text-teallight text-sm lg:text-base">
                Industry-standard projects and internship simulations that prepare students 
                for actual workplace challenges.
              </p>
            </div>

            <div className="bg-paperwhite/10 backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-paperwhite/15 transition-all border border-paperwhite/10">
              <div className="bg-rust p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <TargetIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl text-paperwhite mb-2 lg:mb-3 font-heading">Career Tracks</h3>
              <p className="text-teallight text-sm lg:text-base">
                Specialized paths in AI/ML, Full Stack Development, UI/UX Design, 
                and Data Science with industry-relevant curriculum.
              </p>
            </div>

            <div className="bg-paperwhite/10 backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-paperwhite/15 transition-all border border-paperwhite/10">
              <div className="bg-rust p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <EnvelopeClosedIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl text-paperwhite mb-2 lg:mb-3 font-heading">Interactive Content</h3>
              <p className="text-teallight text-sm lg:text-base">
                Engaging video tutorials, interactive assessments, and hands-on coding 
                exercises to reinforce learning.
              </p>
            </div>

            <div className="bg-paperwhite/10 backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-paperwhite/15 transition-all border border-paperwhite/10">
              <div className="bg-trueturquoise p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <CheckCircledIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl text-paperwhite mb-2 lg:mb-3 font-heading">Admin Analytics</h3>
              <p className="text-teallight text-sm lg:text-base">
                Comprehensive dashboard for tracking student progress, attendance, 
                and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-trueturquoise/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-4xl text-paperwhite mb-4 lg:mb-6 font-heading">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-lg lg:text-xl text-teallight mb-6 lg:mb-8">
            Join thousands of students who are already building their future with Syncner
          </p>
          <Link
            to="/login"
            className="bg-paperwhite text-trueturquoise px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:bg-teallight transition-colors inline-flex items-center"
          >
            Get Started Today
            <ArrowRightIcon className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-offblack/80 backdrop-blur-sm text-paperwhite py-8 lg:py-12 px-4 sm:px-6 lg:px-8 border-t border-paperwhite/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4 lg:mb-6">
            <div className="bg-trueturquoise p-2 rounded-lg">
              <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
            </div>
          </div>
          <p className="text-teallight mb-3 lg:mb-4 text-sm lg:text-base">
            Empowering the next generation of professionals through AI-driven career development
          </p>
          <p className="text-teallight/80 text-xs lg:text-sm">
            © 2024 Syncner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;