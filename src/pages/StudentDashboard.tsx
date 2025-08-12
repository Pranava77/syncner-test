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
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <div 
        className="rounded-xl p-6 lg:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
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
                  <div className="text-xl lg:text-2xl text-paperwhite font-heading">No Level</div>
                  <div className="text-teallight text-xs lg:text-sm font-label">Current Module</div>
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
              style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
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
                backgroundColor: 'var(--color-surface)',
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
                <span className="bg-trueturquoise/20 text-trueturquoise px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                  No Level Available
                </span>
              </div>
              
              <div 
                className="rounded-lg p-4 lg:p-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
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
                  <div className="bg-trueturquoise/10 p-2 rounded-lg w-fit">
                    <ReaderIcon className="h-5 w-5 lg:h-6 lg:w-6 text-trueturquoise" />
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
                      className="bg-trueturquoise h-2 rounded-full transition-all"
                      style={{ width: '0%' }}
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
                    <Clock className="h-4 w-4 mr-1 text-trueturquoise" />
                    No Duration
                  </div>
                  <Link
                    to="/student/training"
                    className="bg-trueturquoise px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
                    style={{ color: 'var(--color-text-inverse)' }}
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
                    className="bg-trueturquoise px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
                    style={{ color: 'var(--color-text-inverse)' }}
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
                    className="bg-trueturquoise px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
                    style={{ color: 'var(--color-text-inverse)' }}
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
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
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
            className="text-2xl lg:text-3xl mb-2 text-paperwhite font-heading"
          >
            Loading your dashboard...
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-teallight text-lg"
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
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Welcome Section */}
      <div 
        className="rounded-xl p-6 lg:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
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
                <div className="text-xl lg:text-2xl text-paperwhite font-heading">{currentLevel ? `Level ${currentLevel.order}` : 'No Level'}</div>
                <div className="text-teallight text-xs lg:text-sm font-label">Current Module</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl text-paperwhite font-heading">{completedLevels}</div>
                <div className="text-teallight text-xs lg:text-sm font-label">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl text-paperwhite font-heading">{levels?.length || 0}</div>
                <div className="text-teallight text-xs lg:text-sm font-label">Total Levels</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl text-paperwhite font-heading">{overallProgress}%</div>
                <div className="text-teallight text-xs lg:text-sm font-label">Progress</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">

            <div 
              className="p-3 lg:p-4 rounded-lg w-fit"
              style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
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
              background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-tertiary-bg) 100%)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <ReaderIcon className="h-6 w-6 text-trueturquoise" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-paperwhite">Continue Learning</h2>
                  <p className="text-teallight text-sm">Pick up where you left off</p>
                </div>
              </div>
              <span className="bg-gradient-to-r from-trueturquoise/20 to-blue-500/20 text-trueturquoise px-4 py-2 rounded-full text-sm font-semibold border border-trueturquoise/30">
                {currentLevel ? (currentLevelProgress === 100 && currentLevel.order === levels?.length ? 'Bootcamp Complete' : currentLevelProgress === 100 ? 'Level Complete' : 'In Progress') : 'All Levels Complete'}
              </span>
            </div>

            {currentLevel && completedLevels < levels?.length && !(currentLevel.order === levels?.length && currentLevelProgress === 100) ? (
              <div 
                className="rounded-xl p-6 border shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, var(--color-tertiary-bg) 0%, var(--color-surface) 100%)',
                  borderColor: 'var(--color-border)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="mb-4 lg:mb-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-trueturquoise font-bold text-sm">{currentLevel.order}</span>
                      </div>
                      <h3 className="text-lg font-bold text-paperwhite">
                        {currentLevel.title}
                      </h3>
                    </div>
                    <p className="text-teallight text-sm lg:text-base leading-relaxed">{currentLevel.description}</p>
                  </div>
                  <div className="bg-gradient-to-br from-trueturquoise/10 to-blue-500/10 p-3 rounded-xl border border-trueturquoise/20">
                    <ReaderIcon className="h-6 w-6 text-trueturquoise" />
                  </div>
                </div>
                
                {/* Section Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-teallight mb-3">
                    <span className="font-semibold">Level Progress</span>
                    <span className="font-bold text-trueturquoise">{currentLevelProgress}%</span>
                  </div>
                  <div className="w-full bg-paperwhite/20 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-trueturquoise to-teallight h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${currentLevelProgress}%` }}
                    ></div>
                  </div>
                  
                  {/* Section Status */}
                  <div className="flex justify-between mt-4 text-xs">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      (currentLevel.completedSections?.learn === true || currentLevel.completedSections?.learn === "true") 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-paperwhite/10 text-teallight border border-paperwhite/20'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        (currentLevel.completedSections?.learn === true || currentLevel.completedSections?.learn === "true") 
                          ? 'bg-green-400' 
                          : 'bg-paperwhite/30'
                      }`}></span>
                      Learn
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      (currentLevel.completedSections?.test === true || currentLevel.completedSections?.test === "true") 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-paperwhite/10 text-teallight border border-paperwhite/20'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        (currentLevel.completedSections?.test === true || currentLevel.completedSections?.test === "true") 
                          ? 'bg-green-400' 
                          : 'bg-paperwhite/30'
                      }`}></span>
                      Test
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      (currentLevel.completedSections?.exercise === true || currentLevel.completedSections?.exercise === "true") 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-paperwhite/10 text-teallight border border-paperwhite/20'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        (currentLevel.completedSections?.exercise === true || currentLevel.completedSections?.exercise === "true") 
                          ? 'bg-green-400' 
                          : 'bg-paperwhite/30'
                      }`}></span>
                      Exercise
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 text-teallight text-sm bg-paperwhite/10 px-4 py-2 rounded-lg border border-paperwhite/20">
                    <Clock className="h-4 w-4 text-trueturquoise" />
                    {currentLevel.duration || 'Estimated time'}
                  </div>
                  <Link
                    to={`/student/training/${currentLevel.id}/learn`}
                                          className="bg-gradient-to-r from-trueturquoise to-teallight px-6 py-3 rounded-xl hover:from-trueturquoise/90 hover:to-teallight/90 transition-all font-semibold flex items-center justify-center w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                      style={{ color: 'var(--color-text-inverse)' }}
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
              <div className="bg-gradient-to-r from-green-500/10 to-teallight/10 rounded-xl p-6 text-center border border-green-500/30 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-teallight/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-paperwhite mb-2">Congratulations!</h3>
                <p className="text-teallight text-base mb-6">
                  You've completed all {levels?.length || 0} levels in your {userTrack} track!
                </p>
                
                {/* Completion Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">{levels?.length || 0}</div>
                    <div className="text-xs text-teallight">Levels Completed</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">100%</div>
                    <div className="text-xs text-teallight">Track Progress</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">🏆</div>
                    <div className="text-xs text-teallight">Track Mastered</div>
                  </div>
                </div>

                {/* Next Steps Configuration */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-paperwhite mb-4">What's Next?</h4>
                  
                  <div className="flex justify-center">
                    <Link 
                      to="/student/training"
                      className="bg-gradient-to-r from-trueturquoise to-teallight text-offblack px-6 py-3 rounded-xl hover:from-trueturquoise/90 hover:to-teallight/90 transition-all font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
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
                      background: 'linear-gradient(90deg, var(--color-tertiary-bg) 0%, var(--color-surface) 100%)',
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
              <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-xl p-6 text-center border border-paperwhite/20 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-bold text-paperwhite mb-2">No Levels Available</h3>
                <p className="text-teallight text-base mb-6">
                  No training levels are currently available for your track.
                </p>
                <Link
                  to="/student/training"
                  className="bg-gradient-to-r from-trueturquoise to-teallight text-offblack px-6 py-3 rounded-xl hover:from-trueturquoise/90 hover:to-teallight/90 transition-all font-semibold inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  <ReaderIcon className="h-4 w-4 mr-2 text-offblack" />
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
              background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-tertiary-bg) 100%)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-trueturquoise" />
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
              <span className="bg-gradient-to-r from-trueturquoise/20 to-blue-500/20 text-trueturquoise px-3 py-1 rounded-full text-xs font-semibold border border-trueturquoise/30">
                AI Assistant
              </span>
            </div>
            
            <div 
              className="rounded-xl p-4 border shadow-lg mb-6"
              style={{
                background: 'linear-gradient(90deg, var(--color-tertiary-bg) 0%, var(--color-surface) 100%)',
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
                className="w-full bg-gradient-to-r from-trueturquoise to-teallight py-3 rounded-xl hover:from-trueturquoise/90 hover:to-teallight/90 transition-all font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                style={{ color: 'var(--color-text-inverse)' }}
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
                  background: 'linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%)',
                  borderColor: 'var(--color-accent-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <button
                  className="absolute top-3 right-3 text-trueturquoise hover:text-teallight text-xl font-bold focus:outline-none"
                  onClick={() => setShowAIModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-trueturquoise" />
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
                    className="bg-gradient-to-r from-trueturquoise to-teallight px-6 py-2 rounded-xl hover:from-trueturquoise/90 hover:to-teallight/90 transition-all font-semibold mt-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                    style={{ color: 'var(--color-text-inverse)' }}
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
              background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-tertiary-bg) 100%)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-trueturquoise" />
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
              <span className="bg-gradient-to-r from-trueturquoise/20 to-blue-500/20 text-trueturquoise px-3 py-1 rounded-full text-xs font-semibold border border-trueturquoise/30">
                {overallProgress}% Complete
              </span>
            </div>
            
            <div 
              className="rounded-xl p-4 border shadow-lg mb-6"
              style={{
                background: 'linear-gradient(90deg, var(--color-tertiary-bg) 0%, var(--color-surface) 100%)',
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
                <span className="font-bold text-trueturquoise text-lg">{overallProgress}%</span>
              </div>
              <div 
                className="w-full rounded-full h-3 shadow-inner mb-4"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div 
                  className="bg-gradient-to-r from-trueturquoise to-teallight h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div 
                  className="text-center rounded-lg p-3 border border-trueturquoise/20"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}
                >
                  <div className="text-xl font-bold text-trueturquoise">{levels?.length || 0}</div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Total Levels
                  </div>
                </div>
                <div 
                  className="text-center rounded-lg p-3 border border-trueturquoise/20"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}
                >
                  <div className="text-xl font-bold text-trueturquoise">{completedLevels}</div>
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
                      style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                    >
                      <span>Completed Levels:</span>
                      <span className="text-green-400 font-semibold">{completedLevels}</span>
                    </div>
                    <div 
                      className="flex justify-between items-center px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                    >
                      <span>Remaining Levels:</span>
                      <span className="text-orange-400 font-semibold">{levels?.length - completedLevels || 0}</span>
                    </div>
                    {currentLevel && (
                      <div 
                        className="flex justify-between items-center px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
                      >
                        <span>Current Level:</span>
                        <span className="text-trueturquoise font-semibold">Level {currentLevel.order}</span>
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