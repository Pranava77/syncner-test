import React, { useState, useEffect } from 'react';
import TaskWorkspace from '../components/TaskWorkspace';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { useCareerTrack } from '../hooks/useCareerTracks';
import { useTasks, useAllStudentTasks } from '../hooks/useTasks';
import { useProgress } from '../hooks/useProgress';
import { 
  Briefcase, 
  Clock, 
  Star, 
  Filter, 
  Search,
  Code,
  Palette,
  BarChart3,
  Brain,
  CheckCircle,
  AlertTriangle,
  Play,
  Eye,
  Upload,
  Target,
  Award,
  BookOpen,

  Loader2
} from 'lucide-react';
import { fetchTasks } from '../redux/slices/tasksSlice';
import { fetchProgress } from '../redux/slices/progressSlice';
import LoadingScreen from '../components/LoadingScreen';

const statusColors: Record<string, string> = {
  'Not Started': 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)]',
  'Submitted': 'bg-[var(--brand-info-bg)] text-[var(--brand-info)]',
  'Completed': 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]',
  'Overdue': 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)]',
};

const TaskPortal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const tasksState = useAppSelector((state) => state.tasks);
  const progressState = useAppSelector((state) => state.progress);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const userTrack = user?.careerTrack || '';
  
  const { track, loading: trackLoading } = useCareerTrack(userTrack);
  const { tasks: allStudentTasks, loading: allStudentTasksLoading, error: allStudentTasksError } = useAllStudentTasks();
  const { submitTask } = useTasks(user?.careerTrack);

  useEffect(() => {
    if ((!tasksState.data || tasksState.data.length === 0) || tasksState.lastFetched === null) {
      dispatch(fetchTasks({ trackId: user?.careerTrack }));
    }
    if (!progressState.data || progressState.lastFetched === null) {
      dispatch(fetchProgress());
    }
  }, [dispatch, user?.careerTrack]);

  const tasks = tasksState.data || [];
  const progress = progressState.data;
  const tasksLoading = tasksState.loading;
  const progressLoading = progressState.loading;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend':
      case 'coding':
      case 'fullstack':
      case 'backend': return <Code className="h-4 w-4 lg:h-5 lg:w-5" />;
      case 'ui-design':
      case 'ux-design':
      case 'design-systems':
      case 'user-research':
      case 'accessibility': return <Palette className="h-4 w-4 lg:h-5 lg:w-5" />;
      case 'data-analysis':
      case 'forecasting':
      case 'business-intelligence':
      case 'experimentation':
      case 'machine-learning': return <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" />;
      case 'deep-learning':
      case 'nlp':
      case 'computer-vision': return <Brain className="h-4 w-4 lg:h-5 lg:w-5" />;
      default: return <Briefcase className="h-4 w-4 lg:h-5 lg:w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend':
      case 'coding':
      case 'fullstack':
      case 'backend': return 'from-blue-500 to-blue-600';
      case 'ui-design':
      case 'ux-design':
      case 'design-systems':
      case 'user-research':
      case 'accessibility': return 'from-green-500 to-green-600';
      case 'data-analysis':
      case 'forecasting':
      case 'business-intelligence':
      case 'experimentation':
      case 'machine-learning': return 'from-orange-500 to-orange-600';
      case 'deep-learning':
      case 'nlp':
      case 'computer-vision': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]';
      case 'in-progress': return 'bg-[var(--brand-info-bg)] text-[var(--brand-info)]';
      case 'submitted': return 'bg-[var(--brand-accent-bg)] text-[var(--brand-accent)]';
      case 'completed': return 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]';
      case 'locked': return 'bg-[var(--brand-bg-alt)] text-[var(--brand-text)]';
      default: return 'bg-[var(--brand-bg-alt)] text-[var(--brand-text)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Play className="h-3 w-3 lg:h-4 lg:w-4" />;
      case 'in-progress': return <Clock className="h-3 w-3 lg:h-4 lg:w-4" />;
      case 'submitted': return <Upload className="h-3 w-3 lg:h-4 lg:w-4" />;
      case 'completed': return <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />;
      case 'locked': return <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4" />;
      default: return <Clock className="h-3 w-3 lg:h-4 lg:w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]';
      case 'Intermediate': return 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)]';
      case 'Advanced': return 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)]';
      default: return 'bg-[var(--brand-bg-alt)] text-[var(--brand-text)]';
    }
  };

  const filteredTasks = allStudentTasks.filter(task => {
    const matchesFilter = selectedFilter === 'all' || 
                         task.category === selectedFilter || 
                         task.status === selectedFilter ||
                         task.difficulty.toLowerCase() === selectedFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleStartTask = (task: any) => {
    setSelectedTask(task);
    setShowWorkspace(true);
  };

  const handleTaskSubmission = async (submissionData: any) => {
    try {
      if (!selectedTask?.id) {
        throw new Error('Task ID is required');
      }
      // Ensure files are File objects if present
      if (submissionData.files && Array.isArray(submissionData.files)) {
        submissionData.files = submissionData.files.filter((f: any) => f instanceof File);
      }
      await submitTask(selectedTask.id, submissionData);
      setShowWorkspace(false);
      setSelectedTask(null);
      alert('Task submitted successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to submit task');
    }
  };

  const handleViewDetails = (task: any) => {
    setSelectedTask(task);
  };

  // Get unique categories for the current track
  const trackCategories = [...new Set(allStudentTasks.map(task => task.category))];

  // Overdue tasks
  const overdueTasks = allStudentTasks.filter(t => t.status === 'Overdue');

  if (trackLoading || allStudentTasksLoading || progressLoading) {
    return (
      <LoadingScreen 
        message="Loading tasks..."
        showProgress={true}
        progressDuration={1600}
      />
    );
  }

  if (allStudentTasksError) {
    return <div className="text-red-500">{allStudentTasksError}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <div className="mb-8 p-4 bg-[var(--brand-danger-bg)] dark:bg-[var(--brand-danger-bg)] border-l-4 border-[var(--brand-danger)] rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-[var(--brand-danger)] dark:text-[var(--brand-danger)] mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Overdue Tasks
          </h2>
          <ul className="space-y-2">
            {overdueTasks.map(task => (
              <li key={task.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] rounded-lg border border-[var(--brand-danger)] dark:border-[var(--brand-danger)]">
                <div>
                  <span className="font-semibold text-[var(--brand-danger)] dark:text-[var(--brand-danger)]">{task.title}</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--brand-warning-bg)] text-[var(--brand-warning)]">Overdue</span>
                  <div className="text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] text-sm">Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}</div>
                </div>
                <button
                  className="mt-2 md:mt-0 px-4 py-2 bg-[var(--brand-danger)] text-white rounded hover:bg-[var(--brand-danger)] font-medium"
                  onClick={() => handleStartTask(task)}
                >
                  Submit Now
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)]">Task Portal</h1>
            <p className="text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)] text-sm lg:text-base">Complete real-world projects to build your portfolio</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">Career Track</p>
            <p className="text-lg font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)]">{track?.name}</p>
          </div>
        </div>

        {/* Track Progress */}
        <div className="bg-gradient-to-r from-[var(--brand-info-bg)] to-[var(--brand-accent-bg)] dark:from-[var(--brand-info-bg)] dark:to-[var(--brand-accent-bg)] rounded-xl p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="mb-4 lg:mb-0">
              <h3 className="font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)]">Track Progress</h3>
              <p className="text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)] text-sm">Complete tasks to advance in your career track</p>
            </div>
            <div className="text-left lg:text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="h-4 w-4 text-[var(--brand-warning)] dark:text-[var(--brand-warning)]" />
                <span className="text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-text)]">
                  {allStudentTasks.filter(t => t.status === 'completed').length} / {allStudentTasks.length} completed
                </span>
              </div>
              <div className="w-32 bg-[var(--brand-bg-alt)] dark:bg-[var(--brand-bg-alt)] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[var(--brand-info)] to-[var(--brand-accent)] h-2 rounded-full transition-all"
                  style={{ width: `${(allStudentTasks.filter(t => t.status === 'completed').length / allStudentTasks.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg lg:text-2xl font-bold text-[var(--brand-success)] dark:text-[var(--brand-success)]">
                {allStudentTasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-xs lg:text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">Completed</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-[var(--brand-info)] dark:text-[var(--brand-info)]">
                {allStudentTasks.filter(t => t.status === 'in-progress').length}
              </p>
              <p className="text-xs lg:text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">In Progress</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-[var(--brand-warning)] dark:text-[var(--brand-warning)]">
                {allStudentTasks.filter(t => t.status === 'available').length}
              </p>
              <p className="text-xs lg:text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">Available</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-[var(--brand-accent)] dark:text-[var(--brand-accent)]">
                {allStudentTasks.reduce((sum, task) => sum + task.points, 0)}
              </p>
              <p className="text-xs lg:text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 lg:h-5 lg:w-5 text-[var(--brand-text-alt)] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 border border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)] rounded-lg focus:ring-2 focus:ring-[var(--brand-info)] focus:border-transparent bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text)] text-sm lg:text-base"
              />
            </div>
          </div>
          
          {/* Desktop Filter */}
          <div className="hidden lg:flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--brand-info)] focus:border-transparent bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text)]"
            >
              <option value="all">All Tasks</option>
              <optgroup label="By Status">
                <option value="available">Available</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="locked">Locked</option>
              </optgroup>
              <optgroup label="By Difficulty">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </optgroup>
              <optgroup label="By Category">
                {trackCategories.map(category => (
                  <option key={category} value={category}>
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center px-4 py-2 border border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)] rounded-lg hover:bg-[var(--brand-bg-alt)] dark:hover:bg-[var(--brand-bg-alt)] transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)]">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full border border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--brand-info)] focus:border-transparent bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text)]"
            >
              <option value="all">All Tasks</option>
              <optgroup label="By Status">
                <option value="available">Available</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="locked">Locked</option>
              </optgroup>
              <optgroup label="By Difficulty">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </optgroup>
              <optgroup label="By Category">
                {trackCategories.map(category => (
                  <option key={category} value={category}>
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}
      </div>

      {/* Task Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 lg:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-gradient-to-r from-[var(--brand-info)] to-[var(--brand-accent)] p-2 rounded-lg`}>
                  <div className="text-white">
                    {getCategoryIcon(task.category)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-[var(--brand-accent)] dark:text-[var(--brand-accent)] font-medium mb-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    {task.points}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status || 'Not Started']}`}>
                    {task.status || 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-2 line-clamp-2">{task.title}</h3>
              <p className="text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)] text-sm mb-4 line-clamp-2">{task.description}</p>

              {/* Metadata */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)] mb-4 gap-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  {task.estimatedTime}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {task.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="bg-[var(--brand-bg-alt)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {task.skills.length > 3 && (
                  <span className="bg-[var(--brand-bg-alt)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] px-2 py-1 rounded text-xs">
                    +{task.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col lg:flex-row gap-2">
                <button
                  onClick={() => handleViewDetails(task)}
                  className="flex-1 py-2 border border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] rounded-lg hover:bg-[var(--brand-bg-alt)] dark:hover:bg-[var(--brand-bg-alt)] transition-colors font-medium flex items-center justify-center"
                >
                  <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  Details
                </button>
                
                <button
                  onClick={() => task.status === 'locked' ? null : handleStartTask(task)}
                  disabled={task.status === 'locked'}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    task.status === 'locked'
                      ? 'bg-[var(--brand-bg-alt)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text-alt)] cursor-not-allowed'
                      : task.status === 'completed'
                      ? 'bg-[var(--brand-success)] text-white hover:bg-[var(--brand-success)]'
                      : task.status === 'submitted'
                      ? 'bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent)]'
                      : task.status === 'in-progress'
                      ? 'bg-[var(--brand-info)] text-white hover:bg-[var(--brand-info)]'
                      : 'bg-[var(--brand-success)] text-white hover:bg-[var(--brand-success)]'
                  }`}
                >
                  {task.status === 'locked' ? (
                    <>
                      <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Locked
                    </>
                  ) : task.status === 'completed' ? (
                    <>
                      <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      View Results
                    </>
                  ) : task.status === 'submitted' ? (
                    <>
                      <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Review Feedback
                    </>
                  ) : task.status === 'in-progress' ? (
                    <>
                      <Play className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Start Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-[var(--brand-text-alt)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-2">No Tasks Found</h3>
          <p className="text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">
            {searchTerm ? 'No tasks match your search criteria.' : 'No tasks available for the selected filter.'}
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && !showWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--brand-bg)] dark:bg-[var(--brand-bg-alt)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex items-start justify-between mb-4 lg:mb-6">
                <div className="flex-1 pr-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-3">
                    <div className={`bg-gradient-to-r from-[var(--brand-info)] to-[var(--brand-accent)] p-2 rounded-lg w-fit mb-2 lg:mb-0`}>
                      <div className="text-white">
                        {getCategoryIcon(selectedTask.category)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTask.difficulty)}`}>
                        {selectedTask.difficulty}
                      </span>
                      <span className="text-[var(--brand-accent)] dark:text-[var(--brand-accent)] font-medium text-sm">
                        {selectedTask.points} points
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-2">{selectedTask.title}</h2>
                  <p className="text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)] mb-4">{selectedTask.description}</p>
                  <div className="flex items-center text-sm text-[var(--brand-text-alt)] dark:text-[var(--brand-text-alt)]">
                    <Clock className="h-4 w-4 mr-1" />
                    Estimated time: {selectedTask.estimatedTime}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-[var(--brand-text-alt)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text-alt)] text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-3">Requirements:</h3>
                    <ul className="space-y-2">
                      {selectedTask.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-[var(--brand-success)] mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-3">Skills You'll Use:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.skills.map((skill: string) => (
                        <span key={skill} className="bg-[var(--brand-bg-alt)] dark:bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-3">Deliverables:</h3>
                    <ul className="space-y-2">
                      {selectedTask.deliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Target className="h-4 w-4 text-[var(--brand-info)] mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] text-sm">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)] mb-3">Resources:</h3>
                    <ul className="space-y-2">
                      {selectedTask.resources.map((resource: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <BookOpen className="h-4 w-4 text-[var(--brand-accent)] mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] text-sm">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-3 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)]">
                <button
                  onClick={() => handleStartTask(selectedTask)}
                  disabled={selectedTask.status === 'locked'}
                  className="flex-1 bg-[var(--brand-info)] text-white py-3 rounded-lg hover:bg-[var(--brand-info)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedTask.status === 'locked' ? 'Locked' : 'Start Task'}
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="lg:px-6 py-3 border border-[var(--brand-bg-alt)] dark:border-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:text-[var(--brand-text-alt)] rounded-lg hover:bg-[var(--brand-bg-alt)] dark:hover:bg-[var(--brand-bg-alt)] transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Workspace */}
      {showWorkspace && selectedTask && (
        <TaskWorkspace
          task={selectedTask}
          onClose={() => {
            setShowWorkspace(false);
            setSelectedTask(null);
          }}
          onSubmit={handleTaskSubmission}
        />
      )}
    </div>
  );
};

export default TaskPortal;