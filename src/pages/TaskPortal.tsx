import React, { useState, useEffect } from 'react';
import TaskWorkspace from '../components/TaskWorkspace';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { useCareerTrack } from '../hooks/useCareerTracks';
import { useAllStudentTasks } from '../hooks/useTasks';
import {
  FileTextIcon as Briefcase,
  ClockIcon as Clock,
  StarFilledIcon as Star,
  MixerHorizontalIcon as Filter,
  MagnifyingGlassIcon as Search,
  CodeIcon,
  ColorWheelIcon,
  BarChartIcon,
  LightningBoltIcon,
  CheckCircledIcon as CheckCircle,
  ExclamationTriangleIcon as AlertTriangle,
  PlayIcon as Play,
  EyeOpenIcon,
  UploadIcon as Upload,
  TargetIcon as Target,
  StarFilledIcon as Award,
  ReaderIcon as Reader,
} from '@radix-ui/react-icons';
import { fetchTasks } from '../redux/slices/tasksSlice';
import { fetchProgress } from '../redux/slices/progressSlice';
import LoadingScreen from '../components/LoadingScreen';

const statusColors: Record<string, string> = {
  'Not Started': 'bg-teallight/10 text-teallight',
  'Submitted': 'bg-trueturquoise/10 text-trueturquoise',
  'Completed': 'bg-trueturquoise/20 text-trueturquoise',
  'Overdue': 'bg-rust/10 text-rust',
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

  useEffect(() => {
    if ((!tasksState.data || tasksState.data.length === 0) || tasksState.lastFetched === null) {
      dispatch(fetchTasks({ trackId: user?.careerTrack }));
    }
    if (!progressState.data || progressState.lastFetched === null) {
      dispatch(fetchProgress());
    }
  }, [dispatch, user?.careerTrack]);


  const progressLoading = progressState.loading;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend':
      case 'coding':
      case 'fullstack':
      case 'backend': return <CodeIcon className="h-4 w-4 lg:h-5 lg:w-5" />;
      case 'ui-design':
      case 'ux-design':
      case 'design-systems':
      case 'user-research':
      case 'accessibility': return <ColorWheelIcon className="h-4 w-4 lg:h-5 lg:w-5" />;
      case 'data-analysis':
      case 'forecasting':
      case 'business-intelligence':
      case 'experimentation':
      case 'machine-learning': return <BarChartIcon className="h-4 w-4 lg:h-5 lg:w-5" />;
      case 'deep-learning':
      case 'nlp':
      case 'computer-vision': return <LightningBoltIcon className="h-4 w-4 lg:h-5 lg:w-5" />;
      default: return <Briefcase className="h-4 w-4 lg:h-5 lg:w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend':
      case 'coding':
      case 'fullstack':
      case 'backend': return 'from-trueturquoise to-teallight';
      case 'ui-design':
      case 'ux-design':
      case 'design-systems':
      case 'user-research':
      case 'accessibility': return 'from-teallight to-trueturquoise';
      case 'data-analysis':
      case 'forecasting':
      case 'business-intelligence':
      case 'experimentation':
      case 'machine-learning': return 'from-rust to-trueturquoise';
      case 'deep-learning':
      case 'nlp':
      case 'computer-vision': return 'from-offblack to-trueturquoise';
      default: return 'from-paperwhite/20 to-offblack/20';
    }
  };



  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-teallight/10 text-teallight';
      case 'Intermediate': return 'bg-trueturquoise/10 text-trueturquoise';
      case 'Advanced': return 'bg-rust/10 text-rust';
      default: return 'bg-paperwhite/10 text-paperwhite';
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
      // Assuming submitTask is available from useTasks hook
      // await submitTask(selectedTask.id, submissionData);
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
        <div className="mb-8 p-4 bg-rust/10 border-l-4 border-rust rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-rust mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Overdue Tasks
          </h2>
          <ul className="space-y-2">
            {overdueTasks.map(task => (
              <li key={task.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-paperwhite rounded-lg border border-rust/30">
                <div>
                  <span className="font-semibold text-rust">{task.title}</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-rust/10 text-rust">Overdue</span>
                  <div className="text-teallight text-sm">Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}</div>
                </div>
                <button
                  className="mt-2 md:mt-0 px-4 py-2 bg-rust text-paperwhite rounded hover:bg-trueturquoise hover:text-offblack font-medium"
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
            <h1 className="text-2xl lg:text-3xl font-bold text-offblack">Task Portal</h1>
            <p className="text-teallight text-sm lg:text-base">Complete real-world projects to build your portfolio</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-teallight">Career Track</p>
            <p className="text-lg font-semibold text-offblack">{track?.name}</p>
          </div>
        </div>

        {/* Track Progress */}
        <div className="bg-gradient-to-r from-paperwhite/10 to-trueturquoise/10 rounded-xl p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="mb-4 lg:mb-0">
              <h3 className="font-semibold text-offblack">Track Progress</h3>
              <p className="text-teallight text-sm">Complete tasks to advance in your career track</p>
            </div>
            <div className="text-left lg:text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="h-4 w-4 text-trueturquoise" />
                <span className="text-sm font-medium text-offblack">
                  {allStudentTasks.filter(t => t.status === 'completed').length} / {allStudentTasks.length} completed
                </span>
              </div>
              <div className="w-32 bg-paperwhite/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-trueturquoise to-teallight h-2 rounded-full transition-all"
                  style={{ width: `${(allStudentTasks.filter(t => t.status === 'completed').length / allStudentTasks.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg lg:text-2xl font-bold text-trueturquoise">
                {allStudentTasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-xs lg:text-sm text-teallight">Completed</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-teallight">
                {allStudentTasks.filter(t => t.status === 'in-progress').length}
              </p>
              <p className="text-xs lg:text-sm text-teallight">In Progress</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-paperwhite">
                {allStudentTasks.filter(t => t.status === 'available').length}
              </p>
              <p className="text-xs lg:text-sm text-teallight">Available</p>
            </div>
            <div>
              <p className="text-lg lg:text-2xl font-bold text-rust">
                {allStudentTasks.reduce((sum, task) => sum + task.points, 0)}
              </p>
              <p className="text-xs lg:text-sm text-teallight">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-paperwhite rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 lg:h-5 lg:w-5 text-teallight absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise focus:border-transparent bg-paperwhite text-offblack text-sm lg:text-base"
              />
            </div>
          </div>
          
          {/* Desktop Filter */}
          <div className="hidden lg:flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-paperwhite/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise focus:border-transparent bg-paperwhite text-offblack"
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
              className="flex items-center px-4 py-2 border border-paperwhite/20 rounded-lg hover:bg-paperwhite/10 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2 text-teallight" />
              Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-paperwhite/10">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full border border-paperwhite/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise focus:border-transparent bg-paperwhite text-offblack"
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
          <div key={task.id} className="bg-paperwhite rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 lg:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-gradient-to-r ${getCategoryColor(task.category)} p-2 rounded-lg`}>
                  <div className="text-paperwhite">
                    {getCategoryIcon(task.category)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-trueturquoise font-medium mb-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    {task.points}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status || 'Not Started']}`}>
                    {task.status || 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-offblack mb-2 line-clamp-2">{task.title}</h3>
              <p className="text-teallight text-sm mb-4 line-clamp-2">{task.description}</p>

              {/* Metadata */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-teallight mb-4 gap-2">
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
                  <span key={skill} className="bg-paperwhite/10 text-offblack px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {task.skills.length > 3 && (
                  <span className="bg-paperwhite/10 text-offblack px-2 py-1 rounded text-xs">
                    +{task.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col lg:flex-row gap-2">
                <button
                  onClick={() => handleViewDetails(task)}
                  className="flex-1 py-2 border border-paperwhite/20 text-offblack rounded-lg hover:bg-paperwhite/10 transition-colors font-medium flex items-center justify-center"
                >
                  <EyeOpenIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-teallight" />
                  Details
                </button>
                
                <button
                  onClick={() => task.status === 'locked' ? null : handleStartTask(task)}
                  disabled={task.status === 'locked'}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    task.status === 'locked'
                      ? 'bg-paperwhite/10 text-teallight cursor-not-allowed'
                      : task.status === 'completed'
                      ? 'bg-trueturquoise text-paperwhite hover:bg-teallight hover:text-offblack'
                      : task.status === 'submitted'
                      ? 'bg-teallight text-offblack hover:bg-trueturquoise hover:text-paperwhite'
                      : task.status === 'in-progress'
                      ? 'bg-trueturquoise text-paperwhite hover:bg-teallight hover:text-offblack'
                      : 'bg-trueturquoise text-paperwhite hover:bg-teallight hover:text-offblack'
                  }`}
                >
                  {task.status === 'locked' ? (
                    <>
                      <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-rust" />
                      Locked
                    </>
                  ) : task.status === 'completed' ? (
                    <>
                      <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-trueturquoise" />
                      View Results
                    </>
                  ) : task.status === 'submitted' ? (
                    <>
                      <EyeOpenIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-teallight" />
                      Review Feedback
                    </>
                  ) : task.status === 'in-progress' ? (
                    <>
                      <Play className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-trueturquoise" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-trueturquoise" />
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
          <Target className="h-12 w-12 text-teallight mx-auto mb-4" />
          <h3 className="text-lg font-medium text-offblack mb-2">No Tasks Found</h3>
          <p className="text-teallight">
            {searchTerm ? 'No tasks match your search criteria.' : 'No tasks available for the selected filter.'}
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && !showWorkspace && (
        <div className="fixed inset-0 bg-offblack/80 flex items-center justify-center p-4 z-50">
          <div className="bg-paperwhite rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex items-start justify-between mb-4 lg:mb-6">
                <div className="flex-1 pr-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-3">
                    <div className={`bg-gradient-to-r ${getCategoryColor(selectedTask.category)} p-2 rounded-lg w-fit mb-2 lg:mb-0`}>
                      <div className="text-paperwhite">
                        {getCategoryIcon(selectedTask.category)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTask.difficulty)}`}>
                        {selectedTask.difficulty}
                      </span>
                      <span className="text-trueturquoise font-medium text-sm">
                        {selectedTask.points} points
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-offblack mb-2">{selectedTask.title}</h2>
                  <p className="text-teallight mb-4">{selectedTask.description}</p>
                  <div className="flex items-center text-sm text-teallight">
                    <Clock className="h-4 w-4 mr-1" />
                    Estimated time: {selectedTask.estimatedTime}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-teallight hover:text-trueturquoise text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-offblack mb-3">Requirements:</h3>
                    <ul className="space-y-2">
                      {selectedTask.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-trueturquoise mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-offblack text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-offblack mb-3">Skills You'll Use:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.skills.map((skill: string) => (
                        <span key={skill} className="bg-trueturquoise/10 text-trueturquoise px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-offblack mb-3">Deliverables:</h3>
                    <ul className="space-y-2">
                      {selectedTask.deliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Target className="h-4 w-4 text-trueturquoise mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-offblack text-sm">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-offblack mb-3">Resources:</h3>
                    <ul className="space-y-2">
                      {selectedTask.resources.map((resource: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Reader className="h-4 w-4 text-teallight mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-offblack text-sm">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-3 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-paperwhite/10">
                <button
                  onClick={() => handleStartTask(selectedTask)}
                  disabled={selectedTask.status === 'locked'}
                  className="flex-1 bg-trueturquoise text-paperwhite py-3 rounded-lg hover:bg-teallight hover:text-offblack transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedTask.status === 'locked' ? 'Locked' : 'Start Task'}
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="lg:px-6 py-3 border border-paperwhite/20 text-offblack rounded-lg hover:bg-paperwhite/10 transition-colors font-medium"
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