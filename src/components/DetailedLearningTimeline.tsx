import React from 'react';

interface TimelineSection {
  status: 'not-started' | 'in-progress' | 'completed';
  details: any;
  title: string;
}

interface TimelineLevel {
  levelOrder: number;
  levelTitle: string;
  levelDescription: string;
  overallStatus: 'not-started' | 'in-progress' | 'completed' | 'accessible';
  sections: {
    learn: TimelineSection;
    test: TimelineSection;
    exercise: TimelineSection;
  };
}

interface DetailedLearningTimelineProps {
  timeline: TimelineLevel[];
}

const DetailedLearningTimeline: React.FC<DetailedLearningTimelineProps> = ({ timeline }) => {
  // Debug logging
  console.log('🔍 DetailedLearningTimeline received timeline:', timeline);
  console.log('📊 Timeline length:', timeline?.length);
  console.log('📋 Timeline structure:', JSON.stringify(timeline, null, 2));
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'in-progress':
        return (
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-warning)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-white)' }}></div>
          </div>
        );
      case 'accessible':
        return (
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-white)' }}></div>
          </div>
        );
      default:
        return (
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-white)' }}></div>
          </div>
        );
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'in-progress':
        return (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-warning)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-white)' }}></div>
          </div>
        );
      case 'accessible':
        return (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-white)' }}></div>
          </div>
        );
      default:
        return (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-white)' }}></div>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not started';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getSectionDetails = (section: TimelineSection) => {
    if (section.status === 'not-started') {
      return 'Start date and time -- End Date and Time';
    }

    if (section.status === 'completed') {
      if (section.details?.endDate) {
        return `${formatDate(section.details.startDate)} -- ${formatDate(section.details.endDate)}`;
      }
      return 'Start date and time -- End Date and Time';
    }

    if (section.status === 'in-progress') {
      if (section.details?.startDate) {
        return `${formatDate(section.details.startDate)} -- In-Progress`;
      }
      return 'Start date and time -- In-Progress';
    }

    return 'Start date and time -- End Date and Time';
  };

  const getTestDetails = (section: TimelineSection) => {
    if (section.status === 'not-started') {
      return 'Test';
    }

    if (section.details?.attempts?.length > 0) {
      const bestScore = section.details.bestScore || 0;
      const attempts = section.details.attempts.length;
      return `Test (${bestScore}% - ${attempts} attempt${attempts > 1 ? 's' : ''})`;
    }

    return 'Test';
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div 
        className="rounded-xl shadow-sm p-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h3 
          className="text-xl font-heading mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Learning Timeline
        </h3>
        <p 
          className="text-center py-8"
          style={{ color: 'var(--color-text-muted)' }}
        >
          No learning timeline data available
        </p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl shadow-sm p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <h3 
        className="text-xl font-heading mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Learning Timeline
      </h3>
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div 
          className="absolute left-6 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: 'var(--color-border)' }}
        ></div>
        
        <div className="space-y-8">
          {timeline.map((level, index) => (
            <div key={level.levelOrder} className="relative">
              {/* Level main indicator */}
              <div className="absolute left-4 top-0 transform -translate-x-1/2">
                {getOverallStatusIcon(level.overallStatus)}
              </div>
              
              {/* Level content */}
              <div className="ml-12">
                <div className="mb-4">
                  <h4 
                    className="text-lg font-heading"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Level {level.levelOrder}: {level.levelTitle}
                  </h4>
                  {level.levelDescription && (
                    <p 
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {level.levelDescription}
                    </p>
                  )}
                </div>
                
                {/* Sections */}
                <div className="space-y-4">
                  {/* Learn Section */}
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getStatusIcon(level.sections.learn.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {level.sections.learn.title}
                        </span>
                      </div>
                      <p 
                        className="text-sm mt-1 underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {getSectionDetails(level.sections.learn)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Test Section */}
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getStatusIcon(level.sections.test.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {getTestDetails(level.sections.test)}
                        </span>
                      </div>
                      <p 
                        className="text-sm mt-1 underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {getSectionDetails(level.sections.test)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Exercise Section */}
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getStatusIcon(level.sections.exercise.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {level.sections.exercise.title}
                        </span>
                      </div>
                      <p 
                        className="text-sm mt-1 underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {getSectionDetails(level.sections.exercise)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedLearningTimeline;
