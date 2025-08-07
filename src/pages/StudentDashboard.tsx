import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchCurriculum } from '../redux/slices/curriculumSlice';
import {
  CodeIcon as Code,
  ColorWheelIcon as Palette,
  BarChartIcon as BarChart3,
  LightningBoltIcon as Brain,
  ReaderIcon as BookOpen,
  PlayIcon as Play,
  ClockIcon as Clock,
  ChatBubbleIcon as MessageCircle
} from '@radix-ui/react-icons';
import LoadingScreen from '../components/LoadingScreen';
import AttendanceHeatmap from '../components/AttendanceHeatmap';
import apiService from '../services/api';

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  order: number;
  isActive: boolean;
  isUnlocked?: boolean;
  isCompleted?: boolean;
  completedSections?: {
    learn: boolean;
    test: boolean;
    exercise: boolean;
  };
}

const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const curriculumState = useAppSelector((state) => state.curriculum);

  // Modal state for AI Chat 'Coming Soon'
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Level progress state
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);

  // Attendance ping effect
  React.useEffect(() => {
    if (!user || user.role !== 'student') return;

    let lastActivity = Date.now();
    let interval: ReturnType<typeof setInterval>;

    const activityHandler = () => {
      lastActivity = Date.now();
    };

    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('click', activityHandler);
    window.addEventListener('scroll', activityHandler);

    interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      // If user has been active in the last 5 minutes, ping the server
      if (timeSinceLastActivity < 5 * 60 * 1000) {
        apiService.getMe().catch((error) => {
          console.error('Attendance ping failed:', error);
        });
      }
    }, 1 * 60 * 1000); // every 1 minute

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('click', activityHandler);
      window.removeEventListener('scroll', activityHandler);
    };
  }, [user]);

  // Fetch levels and progress
  const fetchLevelsAndProgress = async () => {
    if (!user?.careerTrack) return;
    
    try {
      setLevelsLoading(true);
      
      // Fetch levels
      const levelsResponse = await apiService.getLevels(user.careerTrack);
      let levelsData: Level[] = [];
      
      if (levelsResponse && levelsResponse.data) {
        levelsData = Array.isArray(levelsResponse.data) ? levelsResponse.data : [levelsResponse.data];
      } else if (Array.isArray(levelsResponse)) {
        levelsData = levelsResponse;
      }
      
      // Sort by order and filter active levels
      levelsData = levelsData
        .filter((level: Level) => level.isActive)
        .sort((a: Level, b: Level) => a.order - b.order);
      
      // Fetch level status
      const statusResponse = await apiService.getLevelsStatus();
      if (statusResponse && statusResponse.data && statusResponse.data.levels) {
        const statusData = statusResponse.data.levels;
        
        // Create completion map
        const levelCompletionMap = new Map();
        levelsData.forEach((level: Level) => {
          const levelStatus = statusData.find((status: any) => status.id === level.id);
          levelCompletionMap.set(level.order, {
            id: level.id,
            completedSections: levelStatus?.completedSections || {},
            isCompleted: levelStatus?.isCompleted || false,
            isUnlocked: levelStatus?.isUnlocked || false
          });
        });
        
        // Process levels with unlock status
        levelsData = levelsData.map((level: Level) => {
          let isUnlocked = false;
          if (level.order === 1) {
            isUnlocked = true;
          } else {
            const previousLevelCompletion = levelCompletionMap.get(level.order - 1);
            if (previousLevelCompletion) {
              const { completedSections } = previousLevelCompletion;
              const isPreviousFullyCompleted = completedSections.learn === true && 
                                             completedSections.test === true && 
                                             completedSections.exercise === true;
              isUnlocked = isPreviousFullyCompleted;
            }
          }
          
          const levelStatus = statusData.find((status: any) => status.id === level.id);
          
          return {
            ...level,
            isUnlocked: isUnlocked,
            isCompleted: levelStatus?.isCompleted ?? false,
            completedSections: levelStatus?.completedSections ?? {
              learn: false,
              test: false,
              exercise: false
            }
          };
        });
      }
      
      setLevels(levelsData);
      
      // Find current level (first unlocked level that's not fully completed)
      const nextLevel = levelsData.find(level => {
        if (!level.isUnlocked) return false;
        
        // Check if all three sections are completed
        const { learn, test, exercise } = level.completedSections || {};
        const isFullyCompleted = learn === true && test === true && exercise === true;
        
        return !isFullyCompleted;
      });
      setCurrentLevel(nextLevel || null);
      
      // Calculate overall progress based on fully completed levels
      const totalLevels = levelsData.length;
      const completed = levelsData.filter(level => {
        const { learn, test, exercise } = level.completedSections || {};
        return learn === true && test === true && exercise === true;
      }).length;
      const progress = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;
      
      setCompletedLevels(completed);
      setOverallProgress(progress);
      
    } catch (error) {
      console.error('Error fetching levels and progress:', error);
    } finally {
      setLevelsLoading(false);
    }
  };

  useEffect(() => {
    console.log('StudentDashboard: user.careerTrack on useEffect:', user?.careerTrack);
    if (user?.careerTrack && curriculumState.lastFetched === null) {
      dispatch(fetchCurriculum({ type: 'learn', trackId: user.careerTrack }));
    }
    
    // Fetch levels and progress
    fetchLevelsAndProgress();
  }, [dispatch, user?.careerTrack, curriculumState.lastFetched]);

  // Listen for completion events from localStorage or custom events
  useEffect(() => {
    const handleProgressUpdate = () => {
      fetchLevelsAndProgress();
    };

    // Listen for custom progress update events
    window.addEventListener('progress-updated', handleProgressUpdate);
    
    // Listen for storage changes (if other components update localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'level-progress-updated') {
        fetchLevelsAndProgress();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!user || !user.careerTrack) {
    return (
      <LoadingScreen 
        message="Loading your dashboard..."
        showProgress={true}
        progressDuration={1800}
      />
    );
  }

  if (levelsLoading) {
    return (
      <LoadingScreen 
        message="Loading your dashboard..."
        showProgress={true}
        progressDuration={1800}
      />
    );
  }

  const userTrack = user.careerTrack;

  const getTrackIcon = () => {
    switch (userTrack) {
      case 'full-stack': return <Code className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'ui-ux': return <Palette className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'data-science': return <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'ai-ml': return <Brain className="h-5 w-5 lg:h-6 lg:w-6" />;
      default: return <Code className="h-5 w-5 lg:h-6 lg:w-6" />;
    }
  };

  // Calculate current level progress
  const getCurrentLevelProgress = () => {
    if (!currentLevel || !currentLevel.completedSections) return 0;
    
    const { learn, test, exercise } = currentLevel.completedSections;
    const completedSections = [learn, test, exercise].filter(Boolean).length;
    return Math.round((completedSections / 3) * 100);
  };

  const currentLevelProgress = getCurrentLevelProgress();

  // const getDifficultyColor = (difficulty: string) => {
  //   switch (difficulty) {
  //     case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  //     case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
  //     case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  //     default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
  //   }
  // };

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
                <div className="text-xl lg:text-2xl text-paperwhite font-heading">{levels.length}</div>
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
                    <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-trueturquoise" />
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
                    <Play className="h-4 w-4 mr-2 text-offblack" />
                    {currentLevelProgress === 0 ? 'Start Learning' : 'Continue'}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* No current level message - only show when ALL levels are completed */}
          {!currentLevel && levels.length > 0 && completedLevels === levels.length && (
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite mb-2">Congratulations!</h2>
                <p className="text-teallight mb-4">You've completed all {levels.length} levels in your track!</p>
                <Link
                  to="/student/training"
                  className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-offblack" />
                  View All Levels
                </Link>
              </div>
            </div>
          )}

          {/* No levels available message */}
          {!currentLevel && levels.length === 0 && (
            <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h2 className="text-lg lg:text-xl font-semibold text-paperwhite mb-2">No Levels Available</h2>
                <p className="text-teallight mb-4">No training levels are currently available for your track.</p>
                <Link
                  to="/student/training"
                  className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium inline-flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-offblack" />
                  Check Training
                </Link>
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {/* The following block was removed as per the edit hint:
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
              {upcomingTasks.map((task: any, index: number) => (
                <div key={task.id} className="border border-paperwhite/20 dark:border-offblack rounded-lg p-4 hover:shadow-md transition-shadow">
                  
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
              ))}
            </div>
          </div>
          */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Helper */}
          <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-4 lg:p-6">
            <div className="text-center">
              <div className="bg-trueturquoise/10 p-3 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-paperwhite" />
              </div>
              <h3 className="font-semibold text-paperwhite mb-2">Need Help?</h3>
              <p className="text-teallight text-sm mb-4">
                Ask our AI assistant for personalized guidance
              </p>
              <button
                className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-teallight transition-all font-medium flex items-center justify-center"
                onClick={() => setShowAIModal(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
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
                  <div className="text-lg font-bold text-trueturquoise">{levels.length}</div>
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
                      <span className="text-orange-400">{levels.length - completedLevels}</span>
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