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
  ArrowRightIcon as ArrowRight,
  PlayIcon as Play,
  CheckCircledIcon as CheckCircle,
  ClockIcon as Clock,
  StarFilledIcon as Star,
  ChatBubbleIcon as MessageCircle
} from '@radix-ui/react-icons';
import LoadingScreen from '../components/LoadingScreen';
import AttendanceHeatmap from '../components/AttendanceHeatmap';
import apiService from '../services/api';

const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const curriculumState = useAppSelector((state) => state.curriculum);

  // Modal state for AI Chat 'Coming Soon'
  const [showAIModal, setShowAIModal] = useState(false);

  // Attendance ping effect
  React.useEffect(() => {
    if (!user || user.role !== 'student') return;
    let interval: ReturnType<typeof setInterval>;
    let lastActivity = Date.now();

    const activityHandler = () => {
      lastActivity = Date.now();
    };

    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);

    interval = setInterval(() => {
      if (Date.now() - lastActivity < 10 * 60 * 1000) {
        apiService.getMe().catch(() => {});
      }
    }, 2 * 60 * 1000); // every 2 minutes

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
    };
  }, [user]);

  useEffect(() => {
    if (curriculumState.lastFetched === null) {
      dispatch(fetchCurriculum(user?.careerTrack));
    }
  }, [dispatch, user?.careerTrack]);

  if (!user || !user.careerTrack) {
    return (
      <LoadingScreen 
        message="Loading your dashboard..."
        showProgress={true}
        progressDuration={1800}
      />
    );
  }
  const userTrack = user.careerTrack;
  const levels = curriculumState.data || [];
  const levelsLoading = curriculumState.loading;

  // Get current level (first in the list)
  const currentLevel = levels[0];

  const getTrackIcon = () => {
    switch (userTrack) {
      case 'fullstack': return <Code className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'ui-ux': return <Palette className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'data-science': return <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />;
      case 'ai-ml': return <Brain className="h-5 w-5 lg:h-6 lg:w-6" />;
      default: return <Code className="h-5 w-5 lg:h-6 lg:w-6" />;
    }
  };

  const getTrackColor = () => {
    switch (userTrack) {
      case 'fullstack': return 'from-blue-600 to-cyan-600';
      case 'ui-ux': return 'from-green-600 to-emerald-600';
      case 'data-science': return 'from-orange-600 to-red-600';
      case 'ai-ml': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-purple-600';
    }
  };

  // const getDifficultyColor = (difficulty: string) => {
  //   switch (difficulty) {
  //     case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  //     case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
  //     case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  //     default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
  //   }
  // };

  if (levelsLoading) {
    return (
      <LoadingScreen 
        message="Loading your dashboard..."
        showProgress={true}
        progressDuration={1800}
      />
    );
  }

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
                <div className="text-xl lg:text-2xl text-paperwhite font-heading">{currentLevel ? 'Available' : 0}</div>
                <div className="text-teallight text-xs lg:text-sm font-label">Current Module</div>
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
                  {currentLevel ? 'Available' : ''}
                </span>
              </div>
              
              <div className="bg-paperwhite/10 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-paperwhite mb-1">
                      {currentLevel.title}
                    </h3>
                    <p className="text-teallight text-sm lg:text-base">{currentLevel.description}</p>
                  </div>
                  <div className="bg-trueturquoise/10 p-2 rounded-lg w-fit">
                    <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-trueturquoise" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-teallight mb-1">
                    <span>Progress</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-paperwhite/20 rounded-full h-2">
                    <div 
                      className="bg-trueturquoise h-2 rounded-full transition-all"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center text-teallight text-sm">
                    <Clock className="h-4 w-4 mr-1 text-trueturquoise" />
                    {currentLevel.duration}
                  </div>
                  <Link
                    to={`/student/training/${currentLevel.id}`}
                    className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-teallight transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
                  >
                    <Play className="h-4 w-4 mr-2 text-offblack" />
                    Continue
                  </Link>
                </div>
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
                <span className="text-teallight text-sm lg:text-base">Overall Progress</span>
                <span className="font-semibold text-paperwhite">100%</span>
              </div>
              <div className="w-full bg-paperwhite/20 rounded-full h-2">
                <div 
                  className="bg-trueturquoise h-2 rounded-full transition-all"
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-trueturquoise">{levels.length}</div>
                  <div className="text-xs text-teallight">Total Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-trueturquoise">0</div>
                  <div className="text-xs text-teallight">Completed</div>
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