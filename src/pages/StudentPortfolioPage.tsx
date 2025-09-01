import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../redux/store';
import StudentPortfolio from '../components/StudentPortfolio';
import ErrorBoundary from '../components/ErrorBoundary';

const StudentPortfolioPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-6"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              My Portfolio
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Showcase your learning journey and achievements
            </p>
          </div>

          {/* Portfolio Component */}
          <StudentPortfolio studentId={user._id || user.id || 'me'} />
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default StudentPortfolioPage;
