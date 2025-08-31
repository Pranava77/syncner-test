import React from 'react';
import { useParams } from 'react-router-dom';
import StudentPortfolio from '../../components/StudentPortfolio';

const StudentPortfolioPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  if (!studentId) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-error)' }}>
            Invalid Student ID
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No student ID provided
          </p>
        </div>
      </div>
    );
  }

  return (
    <StudentPortfolio 
      studentId={studentId}
      studentData={undefined} // Will fetch from backend
    />
  );
};

export default StudentPortfolioPage;
