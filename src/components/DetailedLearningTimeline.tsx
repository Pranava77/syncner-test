import React from 'react';
import { motion } from 'framer-motion';

interface TimelineDetails {
  startDate: string | null;
  endDate: string | null;
  timeSpent?: number;
  score?: number;
  attempts?: number;
  isCompleted: boolean;
}

interface TimelineSection {
  status: 'not-started' | 'in-progress' | 'completed';
  details: TimelineDetails;
  title: string;
}

interface TimelineLevel {
  levelOrder: number;
  levelTitle: string;
  levelDescription: string;
  overallStatus: 'not-started' | 'accessible' | 'in-progress' | 'completed';
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
  console.log('DetailedLearningTimeline - Received timeline:', timeline);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--color-success)';
      case 'in-progress':
        return 'var(--color-warning)';
      case 'accessible':
        return 'var(--color-info)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'accessible':
        return '🔓';
      default:
        return '🔒';
    }
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'learn':
        return '📚';
      case 'test':
        return '📝';
      case 'exercise':
        return '💻';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not started';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (seconds: number | undefined) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          No Timeline Data Available
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Timeline data will appear here once available.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Timeline Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Learning Journey
        </h2>
        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          Track your progress through {timeline.length} levels
        </p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-info)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Accessible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-text-muted)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Locked</span>
          </div>
        </div>
      </div>

      {/* Timeline Levels */}
      <div className="space-y-6">
        {timeline.map((level, index) => (
          <motion.div
            key={level.levelOrder}
            className="relative"
            variants={itemVariants}
          >
            {/* Level Card */}
            <div 
              className="rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: getStatusColor(level.overallStatus),
                boxShadow: `0 10px 25px rgba(0, 0, 0, 0.1)`
              }}
            >
              {/* Level Header */}
              <div 
                className="p-6 border-b-2"
                style={{ 
                  borderColor: getStatusColor(level.overallStatus),
                  backgroundColor: `${getStatusColor(level.overallStatus)}10`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ 
                        backgroundColor: getStatusColor(level.overallStatus),
                        color: 'white'
                      }}
                    >
                      {level.levelOrder}
                    </div>
                    <div>
                      <h3 
                        className="text-xl font-bold mb-1"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {level.levelTitle}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {level.levelDescription}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(level.overallStatus)}</span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: `${getStatusColor(level.overallStatus)}20`,
                        color: getStatusColor(level.overallStatus)
                      }}
                    >
                      {level.overallStatus.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: getStatusColor(level.overallStatus),
                      width: level.overallStatus === 'completed' ? '100%' : 
                             level.overallStatus === 'in-progress' ? '50%' : '0%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Sections Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Learn Section */}
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        level.sections.learn.status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : level.sections.learn.status === 'in-progress'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getSectionIcon('learn')}</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Learn
                          </h4>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              level.sections.learn.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : level.sections.learn.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {level.sections.learn.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <div className="flex justify-between">
                          <span>Started:</span>
                          <span>{formatDate(level.sections.learn.details.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span>{formatDate(level.sections.learn.details.endDate)}</span>
                        </div>
                        {level.sections.learn.details.timeSpent && (
                          <div className="flex justify-between">
                            <span>Time Spent:</span>
                            <span>{formatTime(level.sections.learn.details.timeSpent)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Test Section */}
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        level.sections.test.status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : level.sections.test.status === 'in-progress'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getSectionIcon('test')}</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Test
                          </h4>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              level.sections.test.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : level.sections.test.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {level.sections.test.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <div className="flex justify-between">
                          <span>Started:</span>
                          <span>{formatDate(level.sections.test.details.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span>{formatDate(level.sections.test.details.endDate)}</span>
                        </div>
                        {level.sections.test.details.score !== undefined && (
                          <div className="flex justify-between">
                            <span>Best Score:</span>
                            <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
                              {level.sections.test.details.score}%
                            </span>
                          </div>
                        )}
                        {level.sections.test.details.attempts !== undefined && (
                          <div className="flex justify-between">
                            <span>Attempts:</span>
                            <span>{level.sections.test.details.attempts}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Exercise Section */}
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        level.sections.exercise.status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : level.sections.exercise.status === 'in-progress'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getSectionIcon('exercise')}</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Exercise
                          </h4>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              level.sections.exercise.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : level.sections.exercise.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {level.sections.exercise.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <div className="flex justify-between">
                          <span>Started:</span>
                          <span>{formatDate(level.sections.exercise.details.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span>{formatDate(level.sections.exercise.details.endDate)}</span>
                        </div>
                        {level.sections.exercise.details.timeSpent && (
                          <div className="flex justify-between">
                            <span>Time Spent:</span>
                            <span>{formatTime(level.sections.exercise.details.timeSpent)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Connection Line (except for last item) */}
            {index < timeline.length - 1 && (
              <div className="absolute left-6 top-full w-0.5 h-6" style={{ backgroundColor: 'var(--color-border)' }}></div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Timeline Summary */}
      <motion.div 
        className="mt-8 p-6 rounded-2xl text-center"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          border: '2px solid var(--color-border)'
        }}
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Journey Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
              {timeline.filter(l => l.overallStatus === 'completed').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
              {timeline.filter(l => l.overallStatus === 'in-progress').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>
              {timeline.filter(l => l.overallStatus === 'accessible').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Accessible</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {timeline.filter(l => l.overallStatus === 'not-started').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Locked</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetailedLearningTimeline;
