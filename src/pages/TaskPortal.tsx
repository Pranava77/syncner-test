import React, { useState } from 'react';
import TaskWorkspace from '../components/TaskWorkspace';
import { useAppSelector } from '../redux/store';
import { useCareerTrack } from '../hooks/useCareerTracks';
import { useTasks } from '../hooks/useTasks';
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

const TaskPortal: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const userTrack = user?.careerTrack || '';
  
  const { track, loading: trackLoading } = useCareerTrack(userTrack);
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading tasks...</p>
        </div>
      </div>
    );
  }
  const { tasks = [], loading: tasksLoading, submitTask } = useTasks(user.careerTrack);
  const { loading: progressLoading } = useProgress();

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
      case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'submitted': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'locked': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
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
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const filteredTasks = tasks.filter(task => {
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
  const trackCategories = [...new Set(tasks.map(task => task.category))];

  if (trackLoading || tasksLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Task Portal</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">Complete real-world projects to build your portfolio</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Career Track</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{track?.name}</p>
          </div>
        </div>

        {/* Track Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="mb-4 lg:mb-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Complete tasks to advance in your career track</p>
            </div>
            <div className="text-left lg:text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tasks.filter(t => t.status === 'completed').length} / {tasks.length} completed
                </span>
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {tasks.filter(t => t.status === 'available').length}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Available</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {tasks.reduce((sum, task) => sum + task.points, 0)}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
              />
            </div>
          </div>
          
          {/* Desktop Filter */}
          <div className="hidden lg:flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 lg:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-gradient-to-r ${getCategoryColor(task.category)} p-2 rounded-lg`}>
                  <div className="text-white">
                    {getCategoryIcon(task.category)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium mb-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    {task.points}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status || 'available')}`}>
                    {getStatusIcon(task.status || 'available')}
                    <span className="ml-1 capitalize">{(task.status || 'available')?.replace('-', ' ')}</span>
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{task.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{task.description}</p>

              {/* Metadata */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 gap-2">
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
                  <span key={skill} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {task.skills.length > 3 && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                    +{task.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col lg:flex-row gap-2">
                <button
                  onClick={() => handleViewDetails(task)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  Details
                </button>
                
                <button
                  onClick={() => task.status === 'locked' ? null : handleStartTask(task)}
                  disabled={task.status === 'locked'}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    task.status === 'locked'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : task.status === 'completed'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : task.status === 'submitted'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : task.status === 'in-progress'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
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
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tasks Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'No tasks match your search criteria.' : 'No tasks available for the selected filter.'}
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && !showWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex items-start justify-between mb-4 lg:mb-6">
                <div className="flex-1 pr-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-3">
                    <div className={`bg-gradient-to-r ${getCategoryColor(selectedTask.category)} p-2 rounded-lg w-fit mb-2 lg:mb-0`}>
                      <div className="text-white">
                        {getCategoryIcon(selectedTask.category)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTask.difficulty)}`}>
                        {selectedTask.difficulty}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                        {selectedTask.points} points
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedTask.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedTask.description}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    Estimated time: {selectedTask.estimatedTime}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Requirements:</h3>
                    <ul className="space-y-2">
                      {selectedTask.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills You'll Use:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.skills.map((skill: string) => (
                        <span key={skill} className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Deliverables:</h3>
                    <ul className="space-y-2">
                      {selectedTask.deliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Target className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resources:</h3>
                    <ul className="space-y-2">
                      {selectedTask.resources.map((resource: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <BookOpen className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-3 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleStartTask(selectedTask)}
                  disabled={selectedTask.status === 'locked'}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedTask.status === 'locked' ? 'Locked' : 'Start Task'}
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="lg:px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
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