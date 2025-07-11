import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchProgress } from '../redux/slices/progressSlice';
import { fetchModules } from '../redux/slices/modulesSlice';
import { fetchTasks } from '../redux/slices/tasksSlice';
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

const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const progressState = useAppSelector((state) => state.progress);
  const modulesState = useAppSelector((state) => state.modules);
  const tasksState = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (!progressState.data || progressState.lastFetched === null) {
      dispatch(fetchProgress());
    }
    if (modulesState.lastFetched === null) {
      dispatch(fetchModules(user?.careerTrack));
    }
    if (tasksState.lastFetched === null) {
      dispatch(fetchTasks({ trackId: user?.careerTrack }));
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
  const progress = progressState.data;
  const modules = modulesState.data || [];
  const tasks = tasksState.data || [];
  const progressLoading = progressState.loading;
  const modulesLoading = modulesState.loading;
  const tasksLoading = tasksState.loading;

  // Get current module (first incomplete module)
  const currentModule = modules.find((m: any) => m.status === 'in-progress') || modules[0];
  // Get upcoming tasks (first 3 available tasks)
  const upcomingTasks = tasks.filter((t: any) => t.status === 'available' || t.status === 'in-progress').slice(0, 3);

  const achievements = [
    { title: 'First Module Complete', icon: '🎯', earned: (progress?.completedModulesCount ?? 0) > 0 },
    { title: 'Week Streak', icon: '🔥', earned: (progress?.streakDays ?? 0) >= 7 },
    { title: 'Code Master', icon: '💻', earned: (progress?.completedTasksCount ?? 0) >= 5 },
    { title: 'Design Pro', icon: '🎨', earned: false }
  ];

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (progressLoading || modulesLoading || tasksLoading) {
    return (
      <LoadingScreen 
        message="Loading your dashboard..."
        showProgress={true}
        progressDuration={1800}
      />
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className={`bg-gradient-to-r ${getTrackColor()} rounded-xl p-6 lg:p-8 text-white`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-6 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 mb-4 lg:mb-6 text-sm lg:text-base">
              You're on the {userTrack} track. Let's continue building your career!
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold">{progress?.completedModulesCount || 0}</div>
                <div className="text-blue-100 text-xs lg:text-sm">Modules Complete</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold">{progress?.completedTasksCount || 0}</div>
                <div className="text-blue-100 text-xs lg:text-sm">Tasks Done</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold">{progress?.streakDays || 0}</div>
                <div className="text-blue-100 text-xs lg:text-sm">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold">{progress?.totalPoints || 0}</div>
                <div className="text-blue-100 text-xs lg:text-sm">Total Points</div>
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-3 lg:p-4 rounded-lg w-fit mx-auto lg:mx-0">
            {getTrackIcon()}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Learning */}
          {currentModule && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Continue Learning</h2>
                <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                  {currentModule.status === 'in-progress' ? 'In Progress' : 'Available'}
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {currentModule.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">{currentModule.description}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded-lg w-fit">
                    <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{currentModule.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-white dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${currentModule.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentModule.duration}
                  </div>
                  <Link
                    to={`/student/training/${currentModule.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Career Track Overview */}
          {user && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Your Career Track</h2>
                <Link 
                  to="/student/training/current"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center text-sm lg:text-base"
                >
                  View All Modules
                  <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{userTrack}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">This is a static description. The actual description should be fetched from the database.</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {/* Assuming a default duration */}
                    12 weeks
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Salary</p>
                    <p className="font-semibold text-gray-900 dark:text-white">This should be fetched from the database</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Career Paths</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {/* Assuming a default career paths array */}
                      {['Path 1', 'Path 2'].slice(0, 3).map((path: string, index: number) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs">
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
              <Link 
                to="/student/tasks"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center text-sm lg:text-base"
              >
                View All
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingTasks.map((task: any, index: number) => (
                <div key={task.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-2">
                    <div className="mb-2 lg:mb-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        {task.dueDate && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                        <Star className="h-4 w-4 mr-1" />
                        {task.points}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Helper */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Ask our AI assistant for personalized guidance
              </p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with AI
              </button>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">Overall Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">{progress?.overallProgress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress?.overallProgress || 0}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{modules.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{progress?.completedModulesCount || 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <span className="text-xl lg:text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm lg:text-base ${
                      achievement.earned ? 'text-green-900 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </p>
                  </div>
                  {achievement.earned && (
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/student/training/current"
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white text-sm lg:text-base">Continue Learning</span>
              </Link>
              <Link
                to="/student/tasks"
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Code className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-gray-900 dark:text-white text-sm lg:text-base">View Tasks</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;