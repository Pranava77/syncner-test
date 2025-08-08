import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { useLevels } from '../hooks/useLevels';
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
    learn?: boolean;
    test?: boolean;
    exercise?: boolean;
  };
  duration?: string;
}



const StudentDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
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
    const completedSections = [learn, test, exercise].filter(Boolean).length;
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
      // Check if all three sections are completed
      const { learn, test, exercise } = level.completedSections || {};
      const isFullyCompleted = learn === true && test === true && exercise === true;
      
      // Return the first level that's not fully completed (regardless of unlock status)
      // If completedSections is undefined/null, consider it not completed
      return !isFullyCompleted;
    });

    // Calculate overall progress based on fully completed levels
    const totalLevels = levels.length;
    const completed = levels.filter((level: Level) => {
      const { learn, test, exercise } = level.completedSections || {};
      return learn === true && test === true && exercise === true;
    }).length;
    const progress = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;

    return {
      currentLevel: nextLevel,
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

  // Handle progress updates
  const handleProgressUpdate = () => {
    refetch();
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'level-progress-updated') {
      handleProgressUpdate();
    }
  };

  useEffect(() => {
    window.addEventListener('progress-updated', handleProgressUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleProgressUpdate, handleStorageChange]);

  if (!user || !user.careerTrack) {
    return (
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-black">
        <div className={`bg-trueturquoise/10 rounded-xl p-6 lg:p-8 text-paperwhite`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl mb-2 text-paperwhite font-heading">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-teallight mb-4 lg:mb-6 text-sm lg:text-base font-label">
                You're on the {user?.careerTrack} track. Let's continue building your career!
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl text-paperwhite font-heading">No Level</div>
                  <div className="text-teallight text-xs lg:text-sm font-label">Current Module</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl text-paperwhite font-heading">0</div>
                  <div className="text-teallight text-xs lg:text-sm font-label">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl text-paperwhite font-heading">{levels?.length || 0}</div>
                  <div className="text-teallight text-xs lg:text-sm font-label">Total Levels</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl text-paperwhite font-heading">0%</div>
                  <div className="text-teallight text-xs lg:text-sm font-label">Progress</div>
                </div>
              </div>
            </div>
            <div className="bg-paperwhite/10 p-3 lg:p-4 rounded-lg w-fit mx-auto lg:mx-0">
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
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Continue Learning</h2>
                <span className="bg-trueturquoise/20 text-trueturquoise px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                  No Level Available
                </span>
              </div>
              
              <div className="bg-paperwhite/10 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-paperwhite mb-1">
                      No Level Available
                    </h3>
                    <p className="text-teallight text-sm lg:text-base">No training levels are currently available for your track.</p>
                  </div>
                  <div className="bg-trueturquoise/10 p-2 rounded-lg w-fit">
                    <ReaderIcon className="h-5 w-5 lg:h-6 lg:w-6 text-trueturquoise" />
                  </div>
                </div>
                
                {/* Section Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-teallight mb-2">
                    <span>Level Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-paperwhite/20 rounded-full h-2">
                    <div 
                      className="bg-trueturquoise h-2 rounded-full transition-all"
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  
                  {/* Section Status */}
                  <div className="flex justify-between mt-3 text-xs text-teallight">
                    <div className={`flex items-center text-teallight`}>
                      <span className={`w-2 h-2 rounded-full mr-1 bg-paperwhite/30`}></span>
                      Learn
                    </div>
                    <div className={`flex items-center text-teallight`}>
                      <span className={`w-2 h-2 rounded-full mr-1 bg-paperwhite/30`}></span>
                      Test
                    </div>
                    <div className={`flex items-center text-teallight`}>
                      <span className={`w-2 h-2 rounded-full mr-1 bg-paperwhite/30`}></span>
                      Exercise
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center text-teallight text-sm">
                    <Clock className="h-4 w-4 mr-1 text-trueturquoise" />
                    No Duration
                  </div>
                  <Link
                    to="/student/training"
                    className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
                  >
                    <PlayCircle className="h-4 w-4 mr-2 text-offblack" />
                    Check Training
                  </Link>
                </div>
              </div>
            </div>

            {/* No current level message - only show when ALL levels are completed */}
            {!currentLevel && levels?.length > 0 && completedLevels === levels.length && (
              <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h2 className="text-lg lg:text-xl font-semibold text-paperwhite mb-2">Congratulations!</h2>
                  <p className="text-teallight mb-4">You've completed all {levels.length} levels in your track!</p>
                  <Link
                    to="/student/training"
                    className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
                  >
                    <ReaderIcon className="h-4 w-4 mr-2 text-offblack" />
                    View All Levels
                  </Link>
                </div>
              </div>
            )}

            {/* No levels available message */}
            {!currentLevel && levels?.length === 0 && (
              <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <h2 className="text-lg lg:text-xl font-semibold text-paperwhite mb-2">No Levels Available</h2>
                  <p className="text-teallight mb-4">No training levels are currently available for your track.</p>
                  <Link
                    to="/student/training"
                    className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
                  >
                    <ReaderIcon className="h-4 w-4 mr-2 text-offblack" />
                    Check Training
                  </Link>
                </div>
              </div>
            )}


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Helper */}
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="text-center">
                <div className="bg-trueturquoise/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <Brain className="h-6 w-6 text-trueturquoise" />
                </div>
                <h3 className="font-semibold text-paperwhite mb-2">Need Help?</h3>
                <p className="text-teallight text-sm mb-4">
                  Ask our AI assistant for personalized guidance
                </p>
                <button
                  className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-teallight transition-all font-medium flex items-center justify-center"
                  onClick={() => setShowAIModal(true)}
                >
                  Chat with AI
                </button>
              </div>
            </div>

            {/* AI Chat Coming Soon Modal */}
            {showAIModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative border border-trueturquoise/30">
                  <button
                    className="absolute top-3 right-3 text-trueturquoise hover:text-teallight text-xl font-bold focus:outline-none"
                    onClick={() => setShowAIModal(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center">
                    <div className="bg-trueturquoise/10 p-4 rounded-full mb-4">
                      <Brain className="h-8 w-8 text-trueturquoise" />
                    </div>
                    <h2 className="text-xl font-semibold text-paperwhite mb-2">Coming Soon!</h2>
                    <p className="text-teallight mb-4">The AI chat assistant will be available soon. Stay tuned for updates!</p>
                    <button
                      className="bg-trueturquoise text-offblack px-6 py-2 rounded-lg hover:bg-teallight transition-colors font-medium mt-2"
                      onClick={() => setShowAIModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

                      {/* Progress Stats */}
          <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
            <h3 className="text-paperwhite mb-4 font-heading">
              {completedLevels === levels?.length && levels?.length > 0 ? 'Track Completion' : 'Your Progress'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-teallight text-sm lg:text-base">
                  {completedLevels === levels?.length && levels?.length > 0 ? 'Track Progress' : 'Level Completion'}
                </span>
                <span className="font-semibold text-paperwhite">{overallProgress}%</span>
              </div>
              <div className="w-full bg-paperwhite/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    completedLevels === levels?.length && levels?.length > 0 
                      ? 'bg-gradient-to-r from-green-400 to-teallight' 
                      : 'bg-trueturquoise'
                  }`}
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-trueturquoise">{levels?.length || 0}</div>
                  <div className="text-xs text-teallight">Total Levels</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    completedLevels === levels?.length && levels?.length > 0 
                      ? 'text-green-400' 
                      : 'text-trueturquoise'
                  }`}>
                    {completedLevels}
                  </div>
                  <div className="text-xs text-teallight">Completed</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-paperwhite/10">
                <div className="text-center">
                  <div className="text-sm text-teallight mb-2">
                    {completedLevels === levels?.length && levels?.length > 0 ? 'Track Status' : 'Levels Status'}
                  </div>
                  <div className="text-xs text-teallight space-y-1">
                    <div className="flex justify-between">
                      <span>Completed Levels:</span>
                      <span className="text-green-400">{completedLevels}</span>
                    </div>
                    {completedLevels < (levels?.length || 0) && (
                      <div className="flex justify-between">
                        <span>Remaining Levels:</span>
                        <span className="text-orange-400">{levels?.length - completedLevels || 0}</span>
                      </div>
                    )}
                    {currentLevel && completedLevels < (levels?.length || 0) && (
                      <div className="flex justify-between">
                        <span>Current Level:</span>
                        <span className="text-trueturquoise">Level {currentLevel.order}</span>
                      </div>
                    )}
                    {completedLevels === levels?.length && levels?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Track Status:</span>
                        <span className="text-green-400">🏆 Mastered</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Special completion message */}
              {completedLevels === levels?.length && levels?.length > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="text-xs text-green-400 font-medium">
                      Congratulations! You've mastered the {userTrack} track!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offblack p-4">
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
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-black">
      {/* Welcome Section */}
      <div className={`bg-trueturquoise/10 rounded-xl p-6 lg:p-8 text-paperwhite`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-6 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl mb-2 text-paperwhite font-heading">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-teallight mb-4 lg:mb-6 text-sm lg:text-base font-label">
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
          <div className="bg-paperwhite/10 p-3 lg:p-4 rounded-lg w-fit mx-auto lg:mx-0">
            {getTrackIcon()}
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
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Continue Learning</h2>
                <span className="bg-trueturquoise/20 text-trueturquoise px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                {currentLevel ? (currentLevelProgress === 100 ? 'Level Complete' : 'In Progress') : 'All Levels Complete'}
                </span>
              </div>
              
            
            {currentLevel && completedLevels < (levels?.length || 0) ? (
              <div className="bg-paperwhite/10 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-paperwhite mb-1">
                      Level {currentLevel.order}: {currentLevel.title}
                    </h3>
                    <p className="text-teallight text-sm lg:text-base">{currentLevel.description}</p>
                  </div>
                  <div className="bg-trueturquoise/10 p-2 rounded-lg w-fit">
                    <ReaderIcon className="h-5 w-5 lg:h-6 lg:w-6 text-trueturquoise" />
                  </div>
                </div>
                
                {/* Section Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-teallight mb-2">
                    <span>Level Progress</span>
                    <span>{currentLevelProgress}%</span>
                  </div>
                  <div className="w-full bg-paperwhite/20 rounded-full h-2">
                    <div 
                      className="bg-trueturquoise h-2 rounded-full transition-all"
                      style={{ width: `${currentLevelProgress}%` }}
                    ></div>
                  </div>
                  
                  {/* Section Status */}
                  <div className="flex justify-between mt-3 text-xs text-teallight">
                    <div className={`flex items-center ${currentLevel.completedSections?.learn ? 'text-green-400' : 'text-teallight'}`}>
                      <span className={`w-2 h-2 rounded-full mr-1 ${currentLevel.completedSections?.learn ? 'bg-green-400' : 'bg-paperwhite/30'}`}></span>
                      Learn
                    </div>
                    <div className={`flex items-center ${currentLevel.completedSections?.test ? 'text-green-400' : 'text-teallight'}`}>
                      <span className={`w-2 h-2 rounded-full mr-1 ${currentLevel.completedSections?.test ? 'bg-green-400' : 'bg-paperwhite/30'}`}></span>
                      Test
                    </div>
                    <div className={`flex items-center ${currentLevel.completedSections?.exercise ? 'text-green-400' : 'text-teallight'}`}>
                      <span className={`w-2 h-2 rounded-full mr-1 ${currentLevel.completedSections?.exercise ? 'bg-green-400' : 'bg-paperwhite/30'}`}></span>
                      Exercise
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center text-teallight text-sm">
                    <Clock className="h-4 w-4 mr-1 text-trueturquoise" />
                    {currentLevel.duration || 'Estimated time'}
                  </div>
                  <Link
                    to={`/student/training/${currentLevel.id}/learn`}
                    className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
                  >
                    <PlayCircle className="h-4 w-4 mr-2 text-offblack" />
                    {currentLevelProgress === 0 ? 'Start Learning' : 'Continue'}
                  </Link>
                </div>
              </div>
            ) : (completedLevels === (levels?.length || 0) && levels?.length > 0) ? (
              <div className="bg-gradient-to-r from-green-500/10 to-teallight/10 rounded-lg p-4 lg:p-6 text-center border border-green-500/30">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-paperwhite mb-2">Congratulations!</h3>
                <p className="text-teallight text-sm lg:text-base mb-4">
                  You've completed all {levels?.length || 0} levels in your {userTrack} track!
                </p>
                
                {/* Completion Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{levels?.length || 0}</div>
                    <div className="text-xs text-teallight">Levels Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">100%</div>
                    <div className="text-xs text-teallight">Track Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">🏆</div>
                    <div className="text-xs text-teallight">Track Mastered</div>
                  </div>
                </div>

                {/* Next Steps Configuration */}
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-paperwhite mb-3">What's Next?</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      to="/student/training"
                      className="bg-trueturquoise text-offblack px-4 py-3 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center justify-center"
                    >
                      <ReaderIcon className="h-4 w-4 mr-2 text-offblack" />
                      Review All Levels
                    </Link>
                    
                    <Link
                      to="/student/profile"
                      className="bg-paperwhite/10 text-paperwhite px-4 py-3 rounded-lg hover:bg-paperwhite/20 transition-colors font-medium inline-flex items-center justify-center border border-paperwhite/20"
                    >
                      <Target className="h-4 w-4 mr-2 text-teallight" />
                      View Certificate
                    </Link>
                  </div>
                  
                  <div className="mt-4 p-3 bg-paperwhite/5 rounded-lg border border-paperwhite/10">
                    <p className="text-xs text-teallight">
                      🎯 <strong>Track Mastered:</strong> You've successfully completed the {userTrack} track. 
                      Consider exploring other tracks or advanced topics to continue your learning journey.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-paperwhite/10 rounded-lg p-4 lg:p-6 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-paperwhite mb-2">No Levels Available</h3>
                <p className="text-teallight text-sm lg:text-base mb-4">
                  No training levels are currently available for your track.
                </p>
                <Link
                  to="/student/training"
                  className="bg-trueturquoise text-offblack px-6 py-3 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
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
          <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
            <div className="text-center">
              <div className="bg-trueturquoise/10 p-3 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-6 w-6 text-trueturquoise" />
              </div>
              <h3 className="font-semibold text-paperwhite mb-2">Need Help?</h3>
              <p className="text-teallight text-sm mb-4">
                Ask our AI assistant for personalized guidance
              </p>
              <button
                className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-teallight transition-all font-medium flex items-center justify-center"
                onClick={() => setShowAIModal(true)}
              >
                Chat with AI
              </button>
            </div>
          </div>

          {/* AI Chat Coming Soon Modal */}
          {showAIModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative border border-trueturquoise/30">
                <button
                  className="absolute top-3 right-3 text-trueturquoise hover:text-teallight text-xl font-bold focus:outline-none"
                  onClick={() => setShowAIModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="flex flex-col items-center">
                  <div className="bg-trueturquoise/10 p-4 rounded-full mb-4">
                    <Brain className="h-8 w-8 text-trueturquoise" />
                  </div>
                  <h2 className="text-xl font-semibold text-paperwhite mb-2">Coming Soon!</h2>
                  <p className="text-teallight mb-4">The AI chat assistant will be available soon. Stay tuned for updates!</p>
                  <button
                    className="bg-trueturquoise text-offblack px-6 py-2 rounded-lg hover:bg-teallight transition-colors font-medium mt-2"
                    onClick={() => setShowAIModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Stats */}
          <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
            <h3 className=" text-paperwhite mb-4 font-heading">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-teallight text-sm lg:text-base">Level Completion</span>
                <span className="font-semibold text-paperwhite">{overallProgress}%</span>
              </div>
              <div className="w-full bg-paperwhite/20 rounded-full h-2">
                <div 
                  className="bg-trueturquoise h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-trueturquoise">{levels?.length || 0}</div>
                  <div className="text-xs text-teallight">Total Levels</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-trueturquoise">{completedLevels}</div>
                  <div className="text-xs text-teallight">Completed</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-paperwhite/10">
                <div className="text-center">
                  <div className="text-sm text-teallight mb-2">Levels Status</div>
                  <div className="text-xs text-teallight space-y-1">
                    <div className="flex justify-between">
                      <span>Completed Levels:</span>
                      <span className="text-green-400">{completedLevels}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Levels:</span>
                      <span className="text-orange-400">{levels?.length - completedLevels || 0}</span>
                    </div>
                    {currentLevel && (
                      <div className="flex justify-between">
                        <span>Current Level:</span>
                        <span className="text-trueturquoise">Level {currentLevel.order}</span>
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