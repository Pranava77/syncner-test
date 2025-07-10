import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchProgress } from '../redux/slices/progressSlice';
import { fetchModules } from '../redux/slices/modulesSlice';
import { fetchTasks } from '../redux/slices/tasksSlice';
import { 
  BookOpen, 
  Briefcase, 
  Trophy, 
  Brain, 
  MessageCircle,
  ArrowRight,
  Play,
  CheckCircle,
  Clock,
  Star,
  Code,
  Palette,
  BarChart3,
  Loader2
} from 'lucide-react';
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
    if ((!modulesState.data || modulesState.data.length === 0) || modulesState.lastFetched === null) {
      dispatch(fetchModules(user?.careerTrack));
    }
    if ((!tasksState.data || tasksState.data.length === 0) || tasksState.lastFetched === null) {
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
      default: return <Briefcase className="h-5 w-5 lg:h-6 lg:w-6" />;
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
      <div className={`bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-xl p-6 lg:p-8 text-[var(--brand-text)]`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-6 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-[var(--brand-primary)] mb-4 lg:mb-6 text-sm lg:text-base">
              You're on the {userTrack} track. Let's continue building your career!
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-[var(--brand-text)]">{progress?.completedModulesCount || 0}</div>
                <div className="text-[var(--brand-primary)] text-xs lg:text-sm">Modules Complete</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-[var(--brand-text)]">{progress?.completedTasksCount || 0}</div>
                <div className="text-[var(--brand-primary)] text-xs lg:text-sm">Tasks Done</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-[var(--brand-text)]">{progress?.streakDays || 0}</div>
                <div className="text-[var(--brand-primary)] text-xs lg:text-sm">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-[var(--brand-text)]">{progress?.totalPoints || 0}</div>
                <div className="text-[var(--brand-primary)] text-xs lg:text-sm">Total Points</div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--brand-bg-alt)] p-3 lg:p-4 rounded-lg w-fit mx-auto lg:mx-0">
            {getTrackIcon()}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Learning */}
          {currentModule && (
            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)]">Continue Learning</h2>
                <span className="bg-[var(--brand-success-bg)] text-[var(--brand-success)] px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                  {currentModule.status === 'in-progress' ? 'In Progress' : 'Available'}
                </span>
              </div>
              <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/10 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-1">
                      {currentModule.title}
                    </h3>
                    <p className="text-[var(--brand-primary)] text-sm lg:text-base">{currentModule.description}</p>
                  </div>
                  <div className="bg-[var(--brand-bg)] p-2 rounded-lg w-fit">
                    <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-[var(--brand-primary)]" />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-[var(--brand-primary)] mb-1">
                    <span>Progress</span>
                    <span>{currentModule.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[var(--brand-bg)] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2 rounded-full transition-all"
                      style={{ width: `${currentModule.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center text-[var(--brand-primary)] text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentModule.duration}
                  </div>
                  <Link
                    to={`/student/training/${currentModule.id}`}
                    className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
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
            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)]">Your Career Track</h2>
                <Link 
                  to="/student/training/current"
                  className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)] font-medium flex items-center text-sm lg:text-base"
                >
                  View All Modules
                  <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                </Link>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-[var(--brand-bg)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--brand-text)] mb-2">{userTrack}</h3>
                  <p className="text-[var(--brand-primary)] text-sm mb-3">This is a static description. The actual description should be fetched from the database.</p>
                  <div className="flex items-center text-sm text-[var(--brand-primary)]">
                    <Clock className="h-4 w-4 mr-1" />
                    12 weeks
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[var(--brand-primary)]">Average Salary</p>
                    <p className="font-semibold text-[var(--brand-text)]">This should be fetched from the database</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--brand-primary)]">Career Paths</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['Path 1', 'Path 2'].slice(0, 3).map((path: string, index: number) => (
                        <span key={index} className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] px-2 py-1 rounded text-xs">
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
          <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-[var(--brand-text)]">Upcoming Tasks</h2>
              <Link 
                to="/student/tasks"
                className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)] font-medium flex items-center text-sm lg:text-base"
              >
                View All
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingTasks.map((task: any, index: number) => (
                <div key={task.id} className="border border-[var(--brand-bg)] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-2">
                    <div className="mb-2 lg:mb-0">
                      <h3 className="font-semibold text-[var(--brand-text)]">{task.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        {task.dueDate && (
                          <span className="text-[var(--brand-primary)] text-sm">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="flex items-center text-[var(--brand-accent)] font-medium">
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
          <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-primary)] p-3 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--brand-text)] mb-2">Need Help?</h3>
              <p className="text-[var(--brand-primary)] text-sm mb-4">
                Ask our AI assistant for personalized guidance
              </p>
              <button className="w-full bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-primary)] text-white py-2 rounded-lg hover:from-[var(--brand-primary)] hover:to-[var(--brand-accent)] transition-all font-medium flex items-center justify-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with AI
              </button>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="font-semibold text-[var(--brand-text)] mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--brand-primary)] text-sm lg:text-base">Overall Progress</span>
                <span className="font-semibold text-[var(--brand-text)]">{progress?.overallProgress || 0}%</span>
              </div>
              <div className="w-full bg-[var(--brand-bg)] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2 rounded-full transition-all"
                  style={{ width: `${progress?.overallProgress || 0}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--brand-primary)]">{modules.length}</div>
                  <div className="text-xs text-[var(--brand-primary)]">Total Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--brand-success)]">{progress?.completedModulesCount || 0}</div>
                  <div className="text-xs text-[var(--brand-primary)]">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="font-semibold text-[var(--brand-text)] mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned ? 'bg-[var(--brand-success-bg)]' : 'bg-[var(--brand-bg)]'
                }`}>
                  <span className="text-xl lg:text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm lg:text-base ${
                      achievement.earned ? 'text-[var(--brand-success)]' : 'text-[var(--brand-primary)]'
                    }`}>
                      {achievement.title}
                    </p>
                  </div>
                  {achievement.earned && (
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-success)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="font-semibold text-[var(--brand-text)] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/student/training/current"
                className="flex items-center space-x-3 p-3 border border-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors"
              >
                <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-primary)]" />
                <span className="font-medium text-[var(--brand-text)] text-sm lg:text-base">Continue Learning</span>
              </Link>
              <Link
                to="/student/tasks"
                className="flex items-center space-x-3 p-3 border border-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors"
              >
                <Briefcase className="h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-accent)]" />
                <span className="font-medium text-[var(--brand-text)] text-sm lg:text-base">View Tasks</span>
              </Link>
              <Link
                to="/student/resume"
                className="flex items-center space-x-3 p-3 border border-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors"
              >
                <Trophy className="h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-secondary)]" />
                <span className="font-medium text-[var(--brand-text)] text-sm lg:text-base">Generate Resume</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;