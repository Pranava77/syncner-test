import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { useLevels } from '../hooks/useLevels';
import AttendanceHeatmap from '../components/AttendanceHeatmap';
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
  ArrowRightIcon as ArrowRight,
  StarIcon as Star
} from '@radix-ui/react-icons';

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

interface Task {
  id: number;
  title: string;
  difficulty: string;
  points: number;
  dueDate: Date;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Complete Level 1 Test",
      difficulty: "Easy",
      points: 50,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    },
    {
      id: 2,
      title: "Finish Exercise Assignment",
      difficulty: "Medium", 
      points: 75,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    }
  ]);
  const [showAIModal, setShowAIModal] = useState(false);

  // Use the optimized hook
  const { levels, loading, error, refetch } = useLevels(user?.careerTrack);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-paperwhite/20 text-teallight';
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

    // Find current level (first unlocked level that's not fully completed)
    const nextLevel = levels.find((level: Level) => {
      if (!level.isUnlocked) return false;
      
      // Check if all three sections are completed
      const { learn, test, exercise } = level.completedSections || {};
      const isFullyCompleted = learn === true && test === true && exercise === true;
      
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

            {/* Upcoming Tasks */}
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Upcoming Tasks</h2>
                <Link 
                  to="/student/training"
                  className="text-trueturquoise dark:text-trueturquoise/50 hover:text-teallight dark:hover:text-trueturquoise transition-colors font-medium flex items-center text-sm lg:text-base"
                >
                  View All
                  <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task: Task, index: number) => (
                    <div key={task.id} className="border border-paperwhite/20 dark:border-offblack rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-2 lg:mb-0">
                          <h3 className="font-semibold text-paperwhite">{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </span>
                            {task.dueDate && (
                              <span className="text-teallight text-sm">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-left lg:text-right">
                          <div className="flex items-center text-trueturquoise font-medium">
                            <Star className="h-4 w-4 mr-1" />
                            {task.points}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-teallight">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="text-sm">No upcoming tasks</p>
                    <p className="text-xs">Focus on your current learning!</p>
                  </div>
                )}
              </div>
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
  }

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-black">
        <div className={`bg-trueturquoise/10 rounded-xl p-6 lg:p-8 text-paperwhite`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl mb-2 text-paperwhite font-heading">
                Loading your dashboard...
              </h1>
              <p className="text-teallight mb-4 lg:mb-6 text-sm lg:text-base font-label">
                Please wait while we fetch your training data.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl text-paperwhite font-heading">Loading...</div>
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
                  Loading...
                </span>
              </div>
              
              <div className="bg-paperwhite/10 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-paperwhite mb-1">
                      Loading Level
                    </h3>
                    <p className="text-teallight text-sm lg:text-base">Please wait while we load the current level.</p>
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

            {/* Upcoming Tasks */}
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Upcoming Tasks</h2>
                <Link 
                  to="/student/tasks"
                  className="text-trueturquoise dark:text-trueturquoise/50 hover:text-teallight dark:hover:text-trueturquoise transition-colors font-medium flex items-center text-sm lg:text-base"
                >
                  View All
                  <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task: any, index: number) => (
                    <div key={task.id} className="border border-paperwhite/20 dark:border-offblack rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-2 lg:mb-0">
                          <h3 className="font-semibold text-paperwhite">{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </span>
                            {task.dueDate && (
                              <span className="text-teallight text-sm">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-left lg:text-right">
                          <div className="flex items-center text-trueturquoise font-medium">
                            <Star className="h-4 w-4 mr-1" />
                            {task.points}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-teallight">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="text-sm">No upcoming tasks</p>
                    <p className="text-xs">Focus on your current learning!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Helper */}
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="text-center">
                <div className="bg-trueturquoise/10 p-3 rounded-full w-fit mx-auto mb-4">
                  {/* Placeholder for Brain icon */}
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
                  <span className="font-semibold text-paperwhite">0%</span>
                </div>
                <div className="w-full bg-paperwhite/20 rounded-full h-2">
                  <div 
                    className="bg-trueturquoise h-2 rounded-full transition-all"
                    style={{ width: '0%' }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-trueturquoise">{levels?.length || 0}</div>
                    <div className="text-xs text-teallight">Total Levels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-trueturquoise">0</div>
                    <div className="text-xs text-teallight">Completed</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-paperwhite/10">
                  <div className="text-center">
                    <div className="text-sm text-teallight mb-2">Levels Status</div>
                    <div className="text-xs text-teallight space-y-1">
                      <div className="flex justify-between">
                        <span>Completed Levels:</span>
                        <span className="text-green-400">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Levels:</span>
                        <span className="text-orange-400">{levels?.length || 0}</span>
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
  }

  const userTrack = user?.careerTrack || 'Unknown';

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
          {currentLevel && (
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Continue Learning</h2>
                <span className="bg-trueturquoise/20 text-trueturquoise px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                  {currentLevelProgress === 100 ? 'Level Complete' : 'In Progress'}
                </span>
              </div>
              
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
            </div>
          )}

          {/* Your Learning */}
          <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Your Learning</h2>
              <Link 
                to="/student/training"
                className="text-trueturquoise hover:text-teallight transition-colors font-medium text-sm"
              >
                View All
              </Link>
            </div>
            
            {/* Learning Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-teallight mb-2">
                <span>Overall Learning Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full bg-paperwhite/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-trueturquoise to-teallight h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-teallight">
                <span>{completedLevels} of {levels?.length || 0} levels completed</span>
                <span>{levels?.length ? Math.round((completedLevels / levels.length) * 100) : 0}%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Learning Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-paperwhite/5 rounded-lg">
                  <div className="text-2xl font-bold text-trueturquoise">{completedLevels}</div>
                  <div className="text-xs text-teallight">Levels Completed</div>
                </div>
                <div className="text-center p-3 bg-paperwhite/5 rounded-lg">
                  <div className="text-2xl font-bold text-trueturquoise">
                    {levels?.filter(level => level.completedSections?.learn).length || 0}
                  </div>
                  <div className="text-xs text-teallight">Learn Sections</div>
                </div>
                <div className="text-center p-3 bg-paperwhite/5 rounded-lg">
                  <div className="text-2xl font-bold text-trueturquoise">
                    {levels?.filter(level => level.completedSections?.test).length || 0}
                  </div>
                  <div className="text-xs text-teallight">Tests Passed</div>
                </div>
                <div className="text-center p-3 bg-paperwhite/5 rounded-lg">
                  <div className="text-2xl font-bold text-trueturquoise">
                    {levels?.filter(level => level.completedSections?.exercise).length || 0}
                  </div>
                  <div className="text-xs text-teallight">Exercises Done</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="text-md font-semibold text-paperwhite">Recent Activity</h3>
                {levels?.filter(level => {
                  const { learn, test, exercise } = level.completedSections || {};
                  return learn === true && test === true && exercise === true;
                }).slice(0, 3).map((level, index) => (
                  <div key={level.id} className="flex items-center p-3 bg-paperwhite/5 rounded-lg">
                    <div className="bg-trueturquoise/20 p-2 rounded-lg mr-3">
                      <CheckCircle className="h-4 w-4 text-trueturquoise" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-paperwhite">Completed {level.title}</div>
                      <div className="text-xs text-teallight">Level {level.order}</div>
                    </div>
                  </div>
                ))}
                
                {(!levels || levels.filter(level => {
                  const { learn, test, exercise } = level.completedSections || {};
                  return learn === true && test === true && exercise === true;
                }).length === 0) && (
                  <div className="text-center py-6 text-teallight">
                    <div className="text-2xl mb-2">📚</div>
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Start your learning journey!</p>
                  </div>
                )}
              </div>

              {/* Learning Streak */}
              <div className="mt-6 p-4 bg-gradient-to-r from-trueturquoise/10 to-teallight/10 rounded-lg border border-trueturquoise/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-paperwhite">Learning Streak</h3>
                    <p className="text-xs text-teallight">Keep the momentum going!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-trueturquoise">
                      {completedLevels > 0 ? Math.min(completedLevels, 7) : 0}
                    </div>
                    <div className="text-xs text-teallight">days</div>
                  </div>
                </div>
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

          {/* Upcoming Tasks */}
          <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-paperwhite">Upcoming Tasks</h2>
              <Link 
                to="/student/tasks"
                className="text-trueturquoise dark:text-trueturquoise/50 hover:text-teallight dark:hover:text-trueturquoise transition-colors font-medium flex items-center text-sm lg:text-base"
              >
                View All
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any, index: number) => (
                  <div key={task.id} className="border border-paperwhite/20 dark:border-offblack rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-2 lg:mb-0">
                        <h3 className="font-semibold text-paperwhite">{task.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                          {task.dueDate && (
                            <span className="text-teallight text-sm">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-left lg:text-right">
                        <div className="flex items-center text-trueturquoise font-medium">
                          <Star className="h-4 w-4 mr-1" />
                          {task.points}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-teallight">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">No upcoming tasks</p>
                  <p className="text-xs">Focus on your current learning!</p>
                </div>
              )}
            </div>
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