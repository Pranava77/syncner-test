import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StudentPortfolioData } from '../services/portfolioService';
import apiService from '../services/api';
import StudentPortfolio from '../components/StudentPortfolio';

const PublicPortfolio: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [portfolioData, setPortfolioData] = useState<StudentPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      if (!studentId) {
        setError('Invalid student ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getPublicPortfolio(studentId);
        if (response.success) {
          setPortfolioData(response.data);
        } else {
          setError(response.message || 'Failed to load portfolio');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPortfolio();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Portfolio Not Found
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {error || 'The requested portfolio could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Public Portfolio Notice */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div 
          className="mb-6 p-4 rounded-lg border text-center"
          style={{ 
            backgroundColor: 'var(--color-secondary-bg)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            🌐 This is a public portfolio view. Some interactive features may be limited.
          </p>
        </div>
      </div>

      {/* Use the existing StudentPortfolio component with the fetched data */}
      <StudentPortfolio studentData={portfolioData as any} />
    </div>
  );
};

export default PublicPortfolio;
