import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StudentPortfolioData } from '../services/portfolioService';
import apiService from '../services/api';

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

  // Use the existing StudentPortfolio component with the fetched data
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Public Portfolio Notice */}
          <div className="mb-6 p-4 rounded-lg border" style={{ 
            backgroundColor: 'var(--color-secondary-bg)', 
            borderColor: 'var(--color-border)' 
          }}>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              This is a public portfolio view. Some features may be limited.
            </p>
          </div>

          {/* Portfolio Content - Reuse the existing component structure */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="p-6 sm:p-8 text-center border-b" style={{ borderColor: 'var(--color-border)' }}>
              {/* Profile Image */}
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold"
                style={{ 
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
              >
                {portfolioData.student.name.charAt(0)}
              </div>
              
              {/* Student Name and Status */}
              <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {portfolioData.student.name}
                </h1>
                <p className="text-base sm:text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {portfolioData.student.college || 'Not specified'}, India
                </p>
                
                {/* Track and Duration Info */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4">
                  <div 
                    className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    Track: {portfolioData.student.careerTrack === 'full-stack' ? 'Full Stack Development' : 
                            portfolioData.student.careerTrack === 'ai-ml' ? 'AI & Machine Learning' :
                            portfolioData.student.careerTrack === 'ui-ux' ? 'UI/UX Design' :
                            portfolioData.student.careerTrack === 'data-science' ? 'Data Science' :
                            portfolioData.student.careerTrack}
                  </div>
                  <div 
                    className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    Duration: {portfolioData.student.duration}
                  </div>
                </div>

                {/* Ready to Hire Badge */}
                {portfolioData.student.readyToHire && (
                  <div 
                    className="inline-block px-6 py-2 rounded-full text-lg font-bold"
                    style={{ 
                      backgroundColor: 'var(--color-success)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    Ready to Hire
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="p-6 sm:p-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--color-text-primary)' }}>
                Skills
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {(portfolioData.student.skills || []).map((skill) => (
                  <div
                    key={skill}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Roles Section */}
            <div className="p-6 sm:p-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Recommended Roles
              </h2>
              <div className="flex flex-wrap gap-2">
                {(portfolioData.student.recommendedRoles || []).map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      color: 'var(--color-text-tertiary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--color-text-primary)' }}>
                Progress Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                    {portfolioData.progress?.percentage || 0}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Overall Progress
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                    {portfolioData.progress?.completedLevels || 0}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Levels Completed
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                    {portfolioData.attendance?.percentage || 0}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Attendance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolio;
