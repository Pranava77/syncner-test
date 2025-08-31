import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StudentPortfolio from '../../components/StudentPortfolio';
import { PortfolioService } from '../../services/portfolioService';

const StudentPortfolioPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('StudentPortfolioPage rendered with studentId:', studentId);

  // Fetch portfolio data when component mounts
  useEffect(() => {
    if (studentId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('StudentPortfolioPage: Fetching portfolio data for student:', studentId);
          const data = await PortfolioService.getStudentPortfolio(studentId);
          console.log('StudentPortfolioPage: Portfolio data received:', data);
          setPortfolioData(data);
        } catch (err) {
          console.error('StudentPortfolioPage: Error fetching portfolio:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [studentId]);

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

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ color: 'var(--color-accent-primary)' }}></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Loading Portfolio...
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Fetching student portfolio data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-error)' }}>
            Error Loading Portfolio
          </h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              color: 'white'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <StudentPortfolio 
      studentId={studentId}
      studentData={portfolioData} // Pass the fetched data
    />
  );
};

export default StudentPortfolioPage;
