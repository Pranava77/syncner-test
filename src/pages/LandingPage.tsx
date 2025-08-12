import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { 
  ArrowRightIcon,
  BarChartIcon,
  TargetIcon,
  EnvelopeClosedIcon,
  PersonIcon,
  CheckCircledIcon,
  RocketIcon
} from '@radix-ui/react-icons';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from '../components/LoadingScreen';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
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
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 transition-colors duration-300"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img src={logo} alt="Syncner Logo" className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-6xl mb-6 text-text-primary font-heading leading-tight transition-colors duration-300"
          >
            Transform Your Career with{' '}
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl text-text-secondary mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed transition-colors duration-300"
          >
            Master in-demand skills through personalized learning paths, interactive projects, 
            and real-world applications. Your journey to career success starts here.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/register"
              className="bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-primary px-8 lg:px-12 py-4 lg:py-5 rounded-xl hover:from-accent-primary/90 hover:to-accent-secondary/90 transition-all font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-bg-secondary text-text-primary px-8 lg:px-12 py-4 lg:py-5 rounded-xl hover:bg-bg-tertiary transition-all font-bold text-lg lg:text-xl border border-border-primary hover:border-accent-primary/50 duration-200"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-bg-secondary/50 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl text-text-primary mb-3 lg:mb-4 font-heading transition-colors duration-300">
              Everything You Need for Career Success
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary transition-colors duration-300">
              Comprehensive platform designed for both students and college administrators
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-bg-primary backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-bg-secondary transition-all border border-border-primary hover:border-accent-primary/30 duration-300">
              <div className="bg-accent-primary p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <BarChartIcon className="h-5 w-5 lg:h-6 lg:w-6 text-bg-primary transition-colors duration-300" />
              </div>
              <h3 className="text-lg lg:text-xl text-text-primary mb-2 lg:mb-3 font-heading transition-colors duration-300">AI-Personalized Learning</h3>
              <p className="text-text-secondary text-sm lg:text-base transition-colors duration-300">
                Adaptive learning paths that adjust to each student's pace and performance, 
                ensuring optimal skill development.
              </p>
            </div>

            <div className="bg-bg-primary backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-bg-secondary transition-all border border-border-primary hover:border-accent-primary/30 duration-300">
              <div className="bg-accent-secondary p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <RocketIcon className="h-5 w-5 lg:h-6 lg:w-6 text-bg-primary transition-colors duration-300" />
              </div>
              <h3 className="text-lg lg:text-xl text-text-primary mb-2 lg:mb-3 font-heading transition-colors duration-300">Project-Based Learning</h3>
              <p className="text-text-secondary text-sm lg:text-base transition-colors duration-300">
                Build real-world projects that showcase your skills and create a portfolio 
                that impresses employers.
              </p>
            </div>

            <div className="bg-bg-primary backdrop-blur-sm p-6 lg:p-8 rounded-xl hover:bg-bg-secondary transition-all border border-border-primary hover:border-accent-primary/30 duration-300">
              <div className="bg-accent-primary p-2 lg:p-3 rounded-lg w-fit mb-3 lg:mb-4">
                <CheckCircledIcon className="h-5 w-5 lg:h-6 lg:w-6 text-bg-primary transition-colors duration-300" />
              </div>
              <h3 className="text-lg lg:text-xl text-text-primary mb-2 lg:mb-3 font-heading transition-colors duration-300">Admin Analytics</h3>
              <p className="text-text-secondary text-sm lg:text-base transition-colors duration-300">
                Comprehensive dashboard for tracking student progress, attendance, 
                and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-accent-primary/10 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-4xl text-text-primary mb-4 lg:mb-6 font-heading transition-colors duration-300">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-lg lg:text-xl text-text-secondary mb-6 lg:mb-8 transition-colors duration-300">
            Join thousands of students who are already building their future with Syncner
          </p>
          <Link
            to="/login"
            className="bg-bg-primary text-accent-primary px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:bg-bg-secondary transition-colors inline-flex items-center border border-accent-primary hover:border-accent-secondary duration-300"
          >
            Get Started Today
            <ArrowRightIcon className="ml-2 h-4 w-4 lg:h-5 lg:w-5 transition-colors duration-300" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-secondary/80 backdrop-blur-sm text-text-primary py-8 lg:py-12 px-4 sm:px-6 lg:px-8 border-t border-border-primary transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4 lg:mb-6">
            <div className="bg-accent-primary p-2 rounded-lg">
              <img src={logo} alt="Syncner Logo" className="h-8 w-8 lg:h-10 lg:w-10 object-contain transition-colors duration-300" />
            </div>
          </div>
          <p className="text-text-secondary mb-3 lg:mb-4 text-sm lg:text-base transition-colors duration-300">
            Empowering the next generation of professionals through AI-driven career development
          </p>
          <p className="text-text-secondary/80 text-xs lg:text-sm transition-colors duration-300">
            © 2024 Syncner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;