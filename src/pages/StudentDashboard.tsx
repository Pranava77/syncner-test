import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { useLevels } from '../hooks/useLevels';
import { clearCache } from '../redux/slices/curriculumSlice';
import AttendanceHeatmap from '../components/AttendanceHeatmap';
import { motion } from 'framer-motion';
import {
  ReaderIcon, 
  ArrowTopRightIcon as TrendingUp, 
  TargetIcon as Target, 
  ClockIcon as Clock, 
  CheckCircledIcon as CheckCircle, 
  PlayIcon as PlayCircle,
  CodeIcon as Code,
  ColorWheelIcon as Palette,
  BarChartIcon as BarChart3,
  LayersIcon as Brain,
  ArrowRightIcon as ArrowRight
} from '@radix-ui/react-icons';
import syncnerLogo from '../assets/syncner-logo.png';

interface Level {
  id: string;
  title: string;
  order: number;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedSections?: {
    learn?: boolean | string;
    test?: boolean | string;
    exercise?: boolean | string;
  };
  duration?: string;
}



const StudentDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);

  // Use the optimized hook
  const { levels, loading, error, refetch } = useLevels(user?.careerTrack);
  
  // Define userTrack early to avoid linter errors
  const userTrack = user?.careerTrack || 'Unknown';

  // Helper functions
  const getTrackIcon = () => {
    const track = user?.careerTrack?.toLowerCase();
    switch (track) {
      case 'full-stack': return <Code className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'ui-ux': return <Palette className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'data-science': return <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'ai-ml': return <Brain className="h-5 w-5 lg:h-6 lg:w-6" />;
      default: return <Code className="h-5 w-5 lg:h-6 lg:w-6" />;
    }
  };



  const getCurrentLevelProgress = () => {
    if (!currentLevel) return 0;
    
    const { learn, test, exercise } = currentLevel.completedSections || {};
    const isLearnCompleted = learn === true || learn === "true";
    const isTestCompleted = test === true || test === "true";
    const isExerciseCompleted = exercise === true || exercise === "true";
    const completedSections = [isLearnCompleted, isTestCompleted, isExerciseCompleted].filter(Boolean).length;
    return Math.round((completedSections / 3) * 100);
  };

  // Memoized calculations for better performance
  const dashboardData = useMemo(() => {
    if (!levels || levels.length === 0) {
      return {
        currentLevel: null,
        overallProgress: 0,
        completedLevels: 0,
        totalLevels: 0
      };
    }

    // Find current level (first level that's not fully completed)
    const nextLevel = levels.find((level: Level) => {
      // Check if all three sections are completed - handle both boolean and string values
      const { learn, test, exercise } = level.completedSections || {};
      const isLearnCompleted = learn === true || learn === "true";
      const isTestCompleted = test === true || test === "true";
      const isExerciseCompleted = exercise === true || exercise === "true";
      const isFullyCompleted = isLearnCompleted && isTestCompleted && isExerciseCompleted;
      
      // Return the first level that's not fully completed (regardless of unlock status)
      // If completedSections is undefined/null, consider it not completed
      return !isFullyCompleted;
    });

    // If no nextLevel is found, it means all levels are completed
    const currentLevel = nextLevel || null;

    // Calculate overall progress based on fully completed levels
    const totalLevels = levels.length;
    const completed = levels.filter((level: Level) => {
      const { learn, test, exercise } = level.completedSections || {};
      const isLearnCompleted = learn === true || learn === "true";
      const isTestCompleted = test === true || test === "true";
      const isExerciseCompleted = exercise === true || exercise === "true";
      return isLearnCompleted && isTestCompleted && isExerciseCompleted;
    }).length;
    const progress = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;



    return {
      currentLevel: currentLevel,
      overallProgress: progress,
      completedLevels: completed,
      totalLevels
    };
  }, [levels]);

  // Update state when dashboard data changes
  useEffect(() => {
    setCurrentLevel(dashboardData.currentLevel);
    setOverallProgress(dashboardData.overallProgress);
    setCompletedLevels(dashboardData.completedLevels);
  }, [dashboardData]);

  // Force fresh data fetch when component mounts or user navigates to dashboard
  useEffect(() => {
    if (user?.careerTrack) {
      // Clear cache and fetch fresh data
      dispatch(clearCache());
      setTimeout(() => {
        refetch();
      }, 100);
    }
  }, [user?.careerTrack, location.pathname, dispatch, refetch]);

  // Handle progress updates
  const handleProgressUpdate = () => {
    // Clear cache and force fresh fetch in background
    dispatch(clearCache());
    setTimeout(() => {
      refetch();
    }, 100);
  };



  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'level-progress-updated') {
      handleProgressUpdate();
    }
  };



  useEffect(() => {
    window.addEventListener('progress-updated', handleProgressUpdate);
    window.addEventListener('exercise-completed', handleProgressUpdate);
    window.addEventListener('level-completed', handleProgressUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
      window.removeEventListener('exercise-completed', handleProgressUpdate);
      window.removeEventListener('level-completed', handleProgressUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleProgressUpdate, handleStorageChange, refetch]);

  if (!user || !user.careerTrack) {
    return (
              <div 
          className="space-y-6 lg:space-y-8 p-4 lg:p-8"
          style={{ backgroundColor: 'var(--color-secondary-bg)' }}
        >
          <div 
        className="rounded-xl p-6 lg:p-8"
        style={{
          backgroundColor: 'var(--color-accent-tertiary)',
          color: 'var(--color-text-primary)'
        }}
      >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 
              className="text-2xl lg:text-3xl mb-2 font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
                Welcome back, {user?.name}! 👋
              </h1>
              <p 
              className="mb-4 lg:mb-6 text-sm lg:text-base font-label"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
                You're on the {user?.careerTrack} track. Let's continue building your career!
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                    <div className="text-center">
                      <div 
                        className="text-xl lg:text-2xl font-heading"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        No Level
                      </div>
                      <div className="text-xs lg:text-sm font-label" style={{ color: 'var(--color-text-tertiary)' }}>Current Module</div>
                    </div>
                    <div className="text-center">
                      <div 
                        className="text-xl lg:text-2xl font-heading"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        0
                      </div>
                      <div 
                        className="text-xs lg:text-sm font-label"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div 
                        className="text-xl lg:text-2xl font-heading"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {levels?.length || 0}
                      </div>
                      <div 
                        className="text-xs lg:text-sm font-label"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Total Levels
                      </div>
                    </div>
                    <div className="text-center">
                      <div 
                        className="text-xl lg:text-2xl font-heading"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        0%
                      </div>
                      <div 
                        className="text-xs lg:text-sm font-label"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Progress
                      </div>
                    </div>
                  </div>
                </div>
                <div 
                  className="p-3 lg:p-4 rounded-lg w-fit mx-auto lg:mx-0"
                  style={{ backgroundColor: 'var(--color-secondary-bg)' }}
                >
              {/* Placeholder for track icon */}
            </div>
          </div>
        </div>
        <div className="flex justify-center my-4">
          {/* AttendanceHeatmap */}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Current Learning */}
            <div 
              className="rounded-xl shadow-lg p-4 lg:p-6"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-lg lg:text-xl font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Continue Learning
                </h2>
                <span className="px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium" style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}>
                  No Level Available
                </span>
              </div>
              
              <div 
                className="rounded-lg p-4 lg:p-6"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 
                      className="text-lg font-semibold mb-1"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      No Level Available
                    </h3>
                    <p 
                      className="text-sm lg:text-base"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      No training levels are currently available for your track.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                    <ReaderIcon className="h-5 w-5 lg:h-6 lg:w-6" style={{ color: 'var(--color-accent-primary)' }} />
                  </div>
                </div>
                
                {/* Section Progress */}
                <div className="mb-4">
                  <div 
                    className="flex justify-between text-sm mb-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <span>Level Progress</span>
                    <span>0%</span>
                  </div>
                  <div 
                    className="w-full rounded-full h-2"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: '0%',
                        backgroundColor: 'var(--color-accent-primary)'
                      }}
                    ></div>
                  </div>
                  
                  {/* Section Status */}
                  <div 
                    className="flex justify-between mt-3 text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: 'var(--color-border)' }}
                      ></span>
                      Learn
                    </div>
                    <div className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: 'var(--color-border)' }}
                      ></span>
                      Test
                    </div>
                    <div className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: 'var(--color-border)' }}
                      ></span>
                      Exercise
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div 
                    className="flex items-center text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <Clock className="h-4 w-4 mr-1" style={{ color: 'var(--color-accent-primary)' }} />
                    No Duration
                  </div>
                  <Link
                    to="/student/training"
                    className="px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    }}
                  >
                                          <PlayCircle 
                        className="h-4 w-4 mr-2"
                        style={{ color: 'var(--color-text-inverse)' }}
                      />
                    Check Training
                  </Link>
                </div>
              </div>
            </div>

            {/* No current level message - only show when ALL levels are completed */}
            {!currentLevel && levels?.length > 0 && completedLevels === levels.length && (
              <div 
                className="rounded-xl shadow-lg p-4 lg:p-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h2 
                    className="text-lg lg:text-xl font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Congratulations!
                  </h2>
                  <p 
                    className="mb-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    You've completed all {levels.length} levels in your track!
                  </p>
                  <Link
                    to="/student/training"
                    className="px-4 py-2 rounded-lg transition-colors font-medium inline-flex items-center"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    }}
                  >
                    <ReaderIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: 'var(--color-text-inverse)' }}
                    />
                    View All Levels
                  </Link>
                </div>
              </div>
            )}

            {/* No levels available message */}
            {!currentLevel && levels?.length === 0 && (
              <div 
                className="rounded-xl shadow-lg p-4 lg:p-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <h2 
                    className="text-lg lg:text-xl font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    No Levels Available
                  </h2>
                  <p 
                    className="mb-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    No training levels are currently available for your track.
                  </p>
                  <Link
                    to="/student/training"
                    className="px-4 py-2 rounded-lg transition-colors font-medium inline-flex items-center"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    }}
                  >
                    <ReaderIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: 'var(--color-text-inverse)' }}
                    />
                    Check Training
                  </Link>
                </div>
              </div>
            )}


          </div>

          {/* Sidebar - Empty for no-user case */}
          <div className="space-y-6">
            {/* Placeholder for future content */}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--color-secondary-bg)' }}
      >
        <div className="text-center">
          <motion.img
            src={syncnerLogo}
            alt="Syncner Logo"
            className="w-24 h-24 mx-auto mb-6"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
                            className="text-2xl lg:text-3xl mb-2 font-heading"
                style={{ color: 'var(--color-text-primary)' }}
          >
            Loading your dashboard...
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Please wait while we fetch your training data.
          </motion.p>
        </div>
      </div>
    );
  }

  const currentLevelProgress = getCurrentLevelProgress();

  return (
    <div 
      className="space-y-6 lg:space-y-8 p-4 lg:p-8"
      style={{ backgroundColor: 'var(--color-secondary-bg)' }}
    >
      {/* Welcome Section */}
      <div 
        className="rounded-xl p-6 lg:p-8"
        style={{
          backgroundColor: 'var(--color-accent-tertiary)',
          color: 'var(--color-text-primary)'
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-6 lg:mb-0">
            <h1 
              className="text-2xl lg:text-3xl mb-2 font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Welcome back, {user?.name}! 👋
            </h1>
            <p 
              className="mb-4 lg:mb-6 text-sm lg:text-base font-label"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              You're on the {userTrack} track. Let's continue building your career!
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div 
                  className="text-xl lg:text-2xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {currentLevel ? `Level ${currentLevel.order}` : 'No Level'}
                </div>
                <div className="text-xs lg:text-sm font-label" style={{ color: 'var(--color-text-tertiary)' }}>Current Module</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-xl lg:text-2xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {completedLevels}
                </div>
                <div className="text-xs lg:text-sm font-label" style={{ color: 'var(--color-text-tertiary)' }}>Completed</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-xl lg:text-2xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {levels?.length || 0}
                </div>
                <div className="text-xs lg:text-sm font-label" style={{ color: 'var(--color-text-tertiary)' }}>Total Levels</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-xl lg:text-2xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {overallProgress}%
                </div>
                <div className="text-xs lg:text-sm font-label" style={{ color: 'var(--color-text-tertiary)' }}>Progress</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">

            <div 
              className="p-3 lg:p-4 rounded-lg w-fit"
              style={{ backgroundColor: 'var(--color-secondary-bg)' }}
            >
            {getTrackIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="flex justify-center my-4">
        <AttendanceHeatmap />
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Learning */}
          <div 
            className="rounded-2xl shadow-2xl p-6 lg:p-8 border backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--color-secondary-bg)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'var(--color-accent-tertiary)'
                }}>
                  <ReaderIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                </div>
                <div>
                  <h2 
              className="text-xl lg:text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Continue Learning
            </h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Pick up where you left off</p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold border" style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)',
                borderColor: 'var(--color-accent-primary)'
              }}>
                {currentLevel ? (currentLevelProgress === 100 && currentLevel.order === levels?.length ? 'Bootcamp Complete' : currentLevelProgress === 100 ? 'Level Complete' : 'In Progress') : 'All Levels Complete'}
              </span>
            </div>

            {currentLevel && completedLevels < levels?.length && !(currentLevel.order === levels?.length && currentLevelProgress === 100) ? (
              <div 
                className="rounded-xl p-6 border shadow-lg"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-border)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="mb-4 lg:mb-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                        backgroundColor: 'var(--color-accent-tertiary)'
                      }}>
                        <span className="font-bold text-sm" style={{ color: 'var(--color-accent-primary)' }}>{currentLevel.order}</span>
                      </div>
                      <h3 
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
                        {currentLevel.title}
                      </h3>
                    </div>
                    <p className="text-sm lg:text-base leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>{currentLevel.description}</p>
                  </div>
                  <div className="p-3 rounded-xl border" style={{
                    backgroundColor: 'var(--color-accent-tertiary)',
                    borderColor: 'var(--color-accent-primary)'
                  }}>
                    <ReaderIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                  </div>
                </div>
                
                {/* Section Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span className="font-semibold">Level Progress</span>
                    <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{currentLevelProgress}%</span>
                  </div>
                  <div className="w-full rounded-full h-3 shadow-inner" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: `${currentLevelProgress}%`,
                        backgroundColor: 'var(--color-accent-primary)'
                      }}
                    ></div>
                  </div>
                  
                  {/* Section Status */}
                  <div className="flex justify-between mt-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{
                      backgroundColor: (currentLevel.completedSections?.learn === true || currentLevel.completedSections?.learn === "true") 
                        ? 'var(--color-success-bg)' 
                        : 'var(--color-secondary-bg)',
                      color: (currentLevel.completedSections?.learn === true || currentLevel.completedSections?.learn === "true") 
                        ? 'var(--color-success)' 
                        : 'var(--color-text-tertiary)',
                      borderColor: (currentLevel.completedSections?.learn === true || currentLevel.completedSections?.learn === "true") 
                        ? 'var(--color-success)' 
                        : 'var(--color-border-subtle)'
                    }}>
                      <span className="w-2 h-2 rounded-full" style={{
                        backgroundColor: (currentLevel.completedSections?.learn === true || currentLevel.completedSections?.learn === "true") 
                          ? 'var(--color-success)' 
                          : 'var(--color-border)'
                      }}></span>
                      Learn
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{
                      backgroundColor: (currentLevel.completedSections?.test === true || currentLevel.completedSections?.test === "true") 
                        ? 'var(--color-success-bg)' 
                        : 'var(--color-secondary-bg)',
                      color: (currentLevel.completedSections?.test === true || currentLevel.completedSections?.test === "true") 
                        ? 'var(--color-success)' 
                        : 'var(--color-text-tertiary)',
                      borderColor: (currentLevel.completedSections?.test === true || currentLevel.completedSections?.test === "true") 
                        ? 'var(--color-success)' 
                        : 'var(--color-border-subtle)'
                    }}>
                      <span className="w-2 h-2 rounded-full" style={{
                        backgroundColor: (currentLevel.completedSections?.test === true || currentLevel.completedSections?.test === "true") 
                          ? 'var(--color-success)' 
                          : 'var(--color-border)'
                      }}></span>
                      Test
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{
                      backgroundColor: (currentLevel.completedSections?.exercise === true || currentLevel.completedSections?.exercise === "true") 
                        ? 'var(--color-success-bg)' 
                        : 'var(--color-secondary-bg)',
                      color: (currentLevel.completedSections?.exercise === true || currentLevel.completedSections?.exercise === "true") 
                        ? 'var(--color-success)' 
                        : 'var(--color-text-tertiary)',
                      borderColor: (currentLevel.completedSections?.exercise === true || currentLevel.completedSections?.exercise === "true") 
                        ? 'var(--color-success)' 
                        : 'var(--color-border-subtle)'
                    }}>
                      <span className="w-2 h-2 rounded-full" style={{
                        backgroundColor: (currentLevel.completedSections?.exercise === true || currentLevel.completedSections?.exercise === "true") 
                          ? 'var(--color-success)' 
                          : 'var(--color-border)'
                      }}></span>
                      Exercise
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border" style={{
                    color: 'var(--color-text-tertiary)',
                    backgroundColor: 'var(--color-tertiary-bg)',
                    borderColor: 'var(--color-border-subtle)'
                  }}>
                    <Clock className="h-4 w-4" style={{ color: 'var(--color-accent-primary)' }} />
                    {currentLevel.duration || 'Estimated time'}
                  </div>
                  <Link
                    to={`/student/training/${currentLevel.id}/learn`}
                      className="px-6 py-3 rounded-xl transition-all font-semibold flex items-center justify-center w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }}
                  >
                                          <PlayCircle 
                        className="h-4 w-4 mr-2"
                        style={{ color: 'var(--color-text-inverse)' }}
                      />
                    {currentLevelProgress === 0 ? 'Start Learning' : 'Continue Learning'}
                  </Link>
                </div>
              </div>
            ) : ((completedLevels === levels?.length && levels?.length > 0) || (currentLevel?.order === levels?.length && currentLevelProgress === 100)) ? (
              <div className="rounded-xl p-6 text-center border shadow-lg" style={{
                backgroundColor: 'var(--color-success-bg)',
                borderColor: 'var(--color-success)'
              }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
                  backgroundColor: 'var(--color-success-bg)'
                }}>
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Congratulations!
            </h3>
                <p className="text-base mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                  You've completed all {levels?.length || 0} levels in your {userTrack} track!
                </p>
                
                {/* Completion Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl p-4 border" style={{
                    backgroundColor: 'var(--color-success-bg)',
                    borderColor: 'var(--color-success)'
                  }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{levels?.length || 0}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Levels Completed</div>
                  </div>
                  <div className="rounded-xl p-4 border" style={{
                    backgroundColor: 'var(--color-success-bg)',
                    borderColor: 'var(--color-success)'
                  }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>100%</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Track Progress</div>
                  </div>
                  <div className="rounded-xl p-4 border" style={{
                    backgroundColor: 'var(--color-success-bg)',
                    borderColor: 'var(--color-success)'
                  }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>🏆</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Track Mastered</div>
                  </div>
                </div>

                {/* Next Steps Configuration */}
                <div className="space-y-4">
                  <h4 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              What's Next?
            </h4>
                  
                  <div className="flex justify-center">
                    <Link 
                      to="/student/training"
                      className="px-6 py-3 rounded-xl transition-all font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }}
                    >
                      <ReaderIcon 
                        className="h-4 w-4 mr-2"
                        style={{ color: 'var(--color-text-inverse)' }}
                      />
                      Review All Levels
                    </Link>
                  </div>
                  
                  <div 
                    className="mt-6 p-4 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-tertiary-bg)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      🎯 <strong>Track Mastered:</strong> You've successfully completed the {userTrack} track. 
                      Consider exploring other tracks or advanced topics to continue your learning journey.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-6 text-center border shadow-lg" style={{
                backgroundColor: 'var(--color-tertiary-bg)',
                borderColor: 'var(--color-border-subtle)'
              }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
                  backgroundColor: 'var(--color-accent-tertiary)'
                }}>
                  <span className="text-3xl">📚</span>
                </div>
                <h3 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Levels Available
            </h3>
                <p className="text-base mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                  No training levels are currently available for your track.
                </p>
                <Link
                  to="/student/training"
                  className="px-6 py-3 rounded-xl transition-all font-semibold inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'var(--color-text-inverse)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  }}
                >
                                          <ReaderIcon 
                          className="h-4 w-4 mr-2" 
                          style={{ color: 'var(--color-text-inverse)' }}
                        />
                  Check Training
                </Link>
              </div>
            )}
          </div>




        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Helper */}
          <div 
            className="rounded-2xl shadow-2xl p-6 lg:p-8 border backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--color-secondary-bg)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    backgroundColor: 'var(--color-accent-tertiary)'
                  }}>
                    <Brain className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                  </div>
                <div>
                  <h3 
                    className="text-xl lg:text-2xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Need Help?
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    AI-powered guidance at your fingertips
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)',
                borderColor: 'var(--color-accent-primary)'
              }}>
                AI Assistant
              </span>
            </div>
            
            <div 
              className="rounded-xl p-4 border shadow-lg mb-6"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <p 
                className="text-sm leading-relaxed mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Get personalized help with your learning journey. Our AI assistant can answer questions, 
                provide explanations, and guide you through challenging concepts.
              </p>
              <button
                className="w-full py-3 rounded-xl transition-all font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                style={{ 
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }}
                onClick={() => setShowAIModal(true)}
              >
                <Brain 
                  className="h-4 w-4 mr-2"
                  style={{ color: 'var(--color-text-inverse)' }}
                />
                Chat with AI
              </button>
            </div>
          </div>

          {/* AI Chat Coming Soon Modal */}
          {showAIModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div 
                className="rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative border backdrop-blur-sm"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-accent-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <button
                  className="absolute top-3 right-3 text-xl font-bold focus:outline-none"
                  style={{ color: 'var(--color-accent-primary)' }}
                  onClick={() => setShowAIModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="flex flex-col items-center">
                                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{
                      backgroundColor: 'var(--color-accent-tertiary)'
                    }}>
                      <Brain className="h-8 w-8" style={{ color: 'var(--color-accent-primary)' }} />
                    </div>
                  <h2 
                    className="text-xl font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Coming Soon!
                  </h2>
                  <p 
                    className="mb-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    The AI chat assistant will be available soon. Stay tuned for updates!
                  </p>
                  <button
                    className="px-6 py-2 rounded-xl transition-all font-semibold mt-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    }}
                    onClick={() => setShowAIModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Stats */}
          <div 
            className="rounded-2xl shadow-2xl p-6 lg:p-8 border backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--color-secondary-bg)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    backgroundColor: 'var(--color-accent-tertiary)'
                  }}>
                    <TrendingUp className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                  </div>
                <div>
                  <h3 
                    className="text-xl lg:text-2xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Your Progress
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Track your learning journey
                  </p>
                </div>
              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)',
                  borderColor: 'var(--color-accent-primary)'
                }}>
                  {overallProgress}% Complete
                </span>
            </div>
            
            <div 
              className="rounded-xl p-4 border shadow-lg mb-6"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Level Completion
                </span>
                <span className="font-bold text-lg" style={{ color: 'var(--color-accent-primary)' }}>{overallProgress}%</span>
              </div>
              <div 
                className="w-full rounded-full h-3 shadow-inner mb-4"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div 
                  className="h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ 
                    width: `${overallProgress}%`,
                    backgroundColor: 'var(--color-accent-primary)'
                  }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div 
                  className="text-center rounded-lg p-3 border"
                  style={{ 
                    backgroundColor: 'var(--color-accent-tertiary)',
                    borderColor: 'var(--color-accent-primary)'
                  }}
                >
                  <div className="text-xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>{levels?.length || 0}</div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Total Levels
                  </div>
                </div>
                <div 
                  className="text-center rounded-lg p-3 border"
                  style={{ 
                    backgroundColor: 'var(--color-accent-tertiary)',
                    borderColor: 'var(--color-accent-primary)'
                  }}
                >
                  <div className="text-xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>{completedLevels}</div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Completed
                  </div>
                </div>
              </div>
              
              <div 
                className="pt-4 border-t"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <div className="text-center">
                  <div 
                    className="text-sm mb-3 font-semibold"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Levels Status
                  </div>
                  <div 
                    className="text-xs space-y-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <div 
                      className="flex justify-between items-center px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--color-secondary-bg)' }}
                    >
                      <span>Completed Levels:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{completedLevels}</span>
                    </div>
                    <div 
                      className="flex justify-between items-center px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--color-secondary-bg)' }}
                    >
                      <span>Remaining Levels:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-warning)' }}>{levels?.length - completedLevels || 0}</span>
                    </div>
                    {currentLevel && (
                      <div 
                        className="flex justify-between items-center px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--color-secondary-bg)' }}
                      >
                        <span>Current Level:</span>
                        <span className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>Level {currentLevel.order}</span>
                      </div>
                    )}
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

export default StudentDashboard;