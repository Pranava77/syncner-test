import React, { useState, useEffect } from 'react';
import {
  GearIcon as Settings,
  GroupIcon as Users,
  ReaderIcon as BookOpen,
  BriefcaseIcon as Briefcase,
  DatabaseIcon as Database,
  SaveIcon,
  PlusIcon as Plus,
  Pencil1Icon as Edit3,
  TrashIcon,
  CheckCircledIcon
} from '@radix-ui/react-icons';
import apiService from '../services/api';
import { useStudents } from '../hooks/useAdmin';
import { useDispatch } from 'react-redux';
import { fetchSettings } from '../redux/slices/settingsSlice';
import { useAppDispatch } from '../redux/store';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  order: number;
  isActive: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  careerTrack: string;
  requirements: string[];
  deliverables: string[];
  skills: string[];
  estimatedTime: string;
  isActive: boolean;
  assignedTo?: string[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: string;
  content?: string;
  videoUrl?: string;
  order: number;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const dispatch = useAppDispatch();
  const settingsState = useSelector((state: any) => state.settings);
  const settings = settingsState.data;
  const settingsLoading = settingsState.loading;
  const settingsError = settingsState.error;

  useEffect(() => {
    if (!settings || settingsState.lastFetched === null) {
      dispatch(fetchSettings());
    }
  }, [settings, settingsState.lastFetched, dispatch]);

  // Module management
  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    duration: '',
    careerTrack: 'fullstack',
    skills: [''],
    order: 1,
    isActive: true,
    lessons: [] as Lesson[]
  });

  // Task management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'frontend',
    difficulty: 'Beginner',
    points: 100,
    careerTrack: 'fullstack',
    requirements: [''],
    deliverables: [''],
    skills: [''],
    estimatedTime: '',
    isActive: true,
    assignedTo: [] as string[]
  });

  // User management
  const [userFilters, setUserFilters] = useState({ name: '', email: '', role: '', careerTrack: '' });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    department: '',
    careerTrack: '',
    isActive: true
  });
  const [userFormError, setUserFormError] = useState('');
  const { students: users, refetch, addStudent, updateStudent, deleteStudent, loading: usersLoading } = useStudents(userFilters);

  // Gemini API Key management
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [settingsDraft, setSettingsDraft] = useState<any | null>(null);

  useEffect(() => {
    if (settings) {
      setSettingsDraft(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (settings?.integrations?.geminiApiKey !== undefined) {
      setGeminiKeyInput(settings.integrations.geminiApiKey);
    }
  }, [settings]);

  const handleGeminiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiKeyInput(e.target.value);
    setSettingsDraft((prev: any) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        geminiApiKey: e.target.value
      }
    }));
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettingsDraft((prev: any) => {
      if (category === 'integrations') {
        return {
          ...prev,
          integrations: {
            ...prev.integrations,
            [key]: value
          }
        };
      }
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await apiService.updatePlatformSettings(settingsDraft);
      if (response.success) {
        setSaveMessage('Settings saved successfully!');
        dispatch(fetchSettings());
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  useEffect(() => {
    fetchModules();
    fetchTasks();
    if (activeTab === 'tasks') {
      refetch();
    }
  }, [activeTab]);

  const fetchModules = async () => {
    try {
      const response = await apiService.getModules();
      if (response.success) {
        setModules(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await apiService.getTasks();
      if (response.success) {
        setTasks(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  // Module management functions
  const handleAddModule = async () => {
    try {
      const response = await apiService.createModule(moduleForm);
      if (response.success) {
        setModules(prev => [...prev, response.data]);
        setShowModuleForm(false);
        setModuleForm({
          title: '',
          description: '',
          difficulty: 'Beginner',
          duration: '',
          careerTrack: 'fullstack',
          skills: [''],
          order: 1,
          isActive: true,
          lessons: []
        });
      }
    } catch (error) {
      console.error('Failed to create module:', error);
    }
  };

  const handleEditModule = async () => {
    if (!editingModule) return;
    try {
      const response = await apiService.updateModule(editingModule.id, moduleForm);
      if (response.success) {
        setModules(prev => prev.map(m => m.id === editingModule.id ? response.data : m));
        setEditingModule(null);
        setShowModuleForm(false);
      }
    } catch (error) {
      console.error('Failed to update module:', error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      const response = await apiService.deleteModule(moduleId);
      if (response.success) {
        setModules(prev => prev.filter(m => m.id !== moduleId));
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  // Task management functions
  const handleAddTask = async () => {
    // Frontend validation for required fields
    if (!taskForm.estimatedTime || !taskForm.skills || !taskForm.skills[0] || !taskForm.deliverables || !taskForm.deliverables[0]) {
      alert('Please fill all required fields: Estimated Time, at least one Skill, and at least one Deliverable.');
      return;
    }
    try {
      const response = await apiService.createTask(taskForm);
      if (response.success) {
        setTasks(prev => [...prev, response.data]);
        setShowTaskForm(false);
        setTaskForm({
          title: '',
          description: '',
          category: 'frontend',
          difficulty: 'Beginner',
          points: 100,
          careerTrack: 'fullstack',
          requirements: [''],
          deliverables: [''],
          skills: [''],
          estimatedTime: '',
          isActive: true,
          assignedTo: []
        });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    // Frontend validation for required fields
    if (!taskForm.estimatedTime || !taskForm.skills || !taskForm.skills[0] || !taskForm.deliverables || !taskForm.deliverables[0]) {
      alert('Please fill all required fields: Estimated Time, at least one Skill, and at least one Deliverable.');
      return;
    }
    try {
      const response = await apiService.updateTask(editingTask.id, taskForm);
      if (response.success) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? response.data : t));
        setEditingTask(null);
        setShowTaskForm(false);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await apiService.deleteTask(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'modules', label: 'Training Modules', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: Briefcase },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ];

  // Render loading/error for settings
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }
  if (settingsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{settingsError}</p>
          <button
            onClick={() => dispatch(fetchSettings())}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your platform settings and content</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">General Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.platformName ?? ''}
                  onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settingsDraft?.general?.supportEmail ?? ''}
                  onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Students per Admin
                </label>
                <input
                  type="number"
                  value={settingsDraft?.general?.maxStudentsPerAdmin ?? 0}
                  onChange={(e) => handleSettingChange('general', 'maxStudentsPerAdmin', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settingsDraft?.general?.sessionTimeout ?? 0}
                  onChange={(e) => handleSettingChange('general', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.siteName ?? ''}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Description
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.siteDescription ?? ''}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-8">
              {/* Gemini API Key section removed as it is now in Integrations */}
            </div>
          </div>
        )}

        {/* Training Modules */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training Modules</h2>
              <button
                onClick={() => setShowModuleForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </button>
            </div>

            {/* Module Form */}
            {showModuleForm && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Module Title"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={moduleForm.careerTrack}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, careerTrack: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="fullstack">Full Stack Development</option>
                    <option value="ai-ml">AI/ML Engineering</option>
                    <option value="ui-ux">UI/UX Design</option>
                    <option value="data-science">Data Science</option>
                  </select>
                  <select
                    value={moduleForm.difficulty}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 2 hours)"
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <textarea
                    placeholder="Module Description"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Lessons</h4>
                  {moduleForm.lessons && (moduleForm.lessons.length > 0) && (
                    <div className="space-y-4 mb-4">
                      {moduleForm.lessons.map((lesson, idx) => (
                        <div key={lesson.id || idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
                          <input
                            type="text"
                            placeholder="Lesson Title"
                            value={lesson.title}
                            onChange={e => setModuleForm(prev => {
                              const lessons = [...prev.lessons];
                              lessons[idx].title = e.target.value;
                              return { ...prev, lessons };
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <select
                            value={lesson.type}
                            onChange={e => setModuleForm(prev => {
                              const lessons = [...prev.lessons];
                              lessons[idx].type = e.target.value;
                              return { ...prev, lessons };
                            })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="video">Video</option>
                            <option value="reading">Reading</option>
                            <option value="quiz">Quiz</option>
                            <option value="project">Project</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Duration (e.g., 30 min)"
                            value={lesson.duration}
                            onChange={e => setModuleForm(prev => {
                              const lessons = [...prev.lessons];
                              lessons[idx].duration = e.target.value;
                              return { ...prev, lessons };
                            })}
                            className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          {/* For video lessons, show videoUrl input */}
                          {lesson.type === 'video' && (
                            <input
                              type="text"
                              placeholder="YouTube Video URL"
                              value={lesson.videoUrl || ''}
                              onChange={e => setModuleForm(prev => {
                                const lessons = [...prev.lessons];
                                lessons[idx].videoUrl = e.target.value;
                                return { ...prev, lessons };
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          )}
                          {/* For reading/project/quiz, show content input */}
                          {(lesson.type === 'reading' || lesson.type === 'project' || lesson.type === 'quiz') && (
                            <textarea
                              placeholder="Lesson Content"
                              value={lesson.content || ''}
                              onChange={e => setModuleForm(prev => {
                                const lessons = [...prev.lessons];
                                lessons[idx].content = e.target.value;
                                return { ...prev, lessons };
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              rows={2}
                            />
                          )}
                          <input
                            type="number"
                            placeholder="Order"
                            value={lesson.order || idx + 1}
                            onChange={e => setModuleForm(prev => {
                              const lessons = [...prev.lessons];
                              lessons[idx].order = parseInt(e.target.value) || idx + 1;
                              return { ...prev, lessons };
                            })}
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setModuleForm(prev => ({
                              ...prev,
                              lessons: prev.lessons.filter((_, i) => i !== idx)
                            }))}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setModuleForm(prev => ({
                      ...prev,
                      lessons: [
                        ...prev.lessons,
                        {
                          id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                          title: '',
                          type: 'video',
                          duration: '',
                          content: '',
                          videoUrl: '',
                          order: ((prev.lessons && prev.lessons.length) || 0) + 1
                        }
                      ]
                    }))}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + Add Lesson
                  </button>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowModuleForm(false);
                      setEditingModule(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingModule ? handleEditModule : handleAddModule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingModule ? 'Update' : 'Create'} Module
                  </button>
                </div>
              </div>
            )}

            {/* Modules List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {modules.map((module) => (
                      <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {module.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {module.description.substring(0, 50)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {(() => {
                              switch(module.careerTrack) {
                                case 'fullstack': return 'Full Stack Development';
                                case 'ai-ml': return 'AI/ML Engineering';
                                case 'ui-ux': return 'UI/UX Design';
                                case 'data-science': return 'Data Science';
                                default: return module.careerTrack;
                              }
                            })()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {module.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {module.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingModule(module);
                              setModuleForm({
                                title: module.title,
                                description: module.description,
                                difficulty: module.difficulty,
                                duration: module.duration,
                                careerTrack: module.careerTrack,
                                skills: module.skills,
                                order: module.order,
                                isActive: module.isActive,
                                lessons: (module as any).lessons || []
                              });
                              setShowModuleForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors mr-2"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>

            {/* Task Form */}
            {showTaskForm && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={taskForm.careerTrack}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, careerTrack: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="fullstack">Full Stack Development</option>
                    <option value="ai-ml">AI/ML Engineering</option>
                    <option value="ui-ux">UI/UX Design</option>
                    <option value="data-science">Data Science</option>
                  </select>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="design">Design</option>
                    <option value="data">Data</option>
                  </select>
                  <select
                    value={taskForm.difficulty}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Points"
                    value={taskForm.points}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Estimated Time"
                    value={taskForm.estimatedTime}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <textarea
                    placeholder="Task Description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to Students (optional)</label>
                    <select
                      multiple
                      value={taskForm.assignedTo}
                      onChange={e => {
                        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        setTaskForm(prev => ({ ...prev, assignedTo: options }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32"
                    >
                 {(users || []).map(student => (
  <option key={student._id} value={student._id}>
    {student.name} ({student.email})
  </option>
))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to assign by track only.</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingTask ? handleEditTask : handleAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingTask ? 'Update' : 'Create'} Task
                  </button>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {task.description.substring(0, 50)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {(() => {
                              switch(task.careerTrack) {
                                case 'fullstack': return 'Full Stack Development';
                                case 'ai-ml': return 'AI/ML Engineering';
                                case 'ui-ux': return 'UI/UX Design';
                                case 'data-science': return 'Data Science';
                                default: return task.careerTrack;
                              }
                            })()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            task.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            task.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {task.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {task.points}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            task.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setTaskForm({
                                title: task.title,
                                description: task.description,
                                category: task.category,
                                difficulty: task.difficulty,
                                points: task.points,
                                careerTrack: task.careerTrack,
                                requirements: task.requirements,
                                deliverables: task.deliverables,
                                skills: task.skills,
                                estimatedTime: task.estimatedTime,
                                isActive: task.isActive,
                                assignedTo: task.assignedTo || []
                              });
                              setShowTaskForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors mr-2"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 min-h-[3.5rem]">
              <h2 className="text-xl font-semibold text-white">User Management</h2>
              <button
                onClick={() => { setShowUserForm(true); setEditingUser(null); setUserForm({ name: '', email: '', password: '', role: 'student', college: '', department: '', careerTrack: '', isActive: true }); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow mt-4"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" placeholder="Name" value={userFilters.name} onChange={e => setUserFilters(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              <input type="text" placeholder="Email" value={userFilters.email} onChange={e => setUserFilters(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              <select value={userFilters.role} onChange={e => setUserFilters(f => ({ ...f, role: e.target.value }))} className="px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
              <select value={userFilters.careerTrack} onChange={e => setUserFilters(f => ({ ...f, careerTrack: e.target.value }))} className="px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                <option value="">All Tracks</option>
                <option value="fullstack">Full Stack</option>
                <option value="ai-ml">AI/ML</option>
                <option value="ui-ux">UI/UX</option>
                <option value="data-science">Data Science</option>
              </select>
            </div>
            {/* Users Table */}
            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Track</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {usersLoading ? (
                      <tr><td colSpan={6} className="text-center py-6 text-white">Loading...</td></tr>
                    ) : (Array.isArray(users) ? users.length : 0) === 0 ? (
                      <tr><td colSpan={6} className="text-center py-6 text-white">No users found.</td></tr>
                    ) : users.map((user: any) => (
                      <tr key={user._id} className="hover:bg-gray-800 transition text-white">
                        <td className="px-6 py-4 whitespace-nowrap text-white">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize text-white">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize text-white">{user.careerTrack || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-white">
                          <button
                            onClick={() => { setEditingUser(user); setUserForm({ ...user, password: '' }); setShowUserForm(true); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStudent(user._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStudent(user._id, { ...user, isActive: !user.isActive })}
                            className={`px-2 py-1 rounded transition-colors ${user.isActive ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <ShieldIcon className="h-4 w-4" /> : <CheckCircledIcon className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Add/Edit User Modal */}
            {showUserForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-white">{editingUser ? 'Edit User' : 'Add User'}</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Name" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    {!editingUser && <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />}
                    <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                    <input type="text" placeholder="College" value={userForm.college} onChange={e => setUserForm(f => ({ ...f, college: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    <input type="text" placeholder="Department" value={userForm.department} onChange={e => setUserForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    <select value={userForm.careerTrack} onChange={e => setUserForm(f => ({ ...f, careerTrack: e.target.value }))} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                      <option value="">Select Track</option>
                      <option value="fullstack">Full Stack</option>
                      <option value="ai-ml">AI/ML</option>
                      <option value="ui-ux">UI/UX</option>
                      <option value="data-science">Data Science</option>
                    </select>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={userForm.isActive} onChange={e => setUserForm(f => ({ ...f, isActive: e.target.checked }))} />
                      <span className="text-white">Active</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={() => setShowUserForm(false)} className="px-4 py-2 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition">Cancel</button>
                    <button
                      onClick={async () => {
                        setUserFormError('');
                        // Frontend validation
                        if (!userForm.name.trim()) {
                          setUserFormError('Name is required.');
                          return;
                        }
                        if (!userForm.email.trim()) {
                          setUserFormError('Email is required.');
                          return;
                        }
                        if (!editingUser && !userForm.password) {
                          setUserFormError('Password is required.');
                          return;
                        }
                        if (!userForm.college.trim()) {
                          setUserFormError('College is required.');
                          return;
                        }
                        try {
                          if (editingUser) {
                            await updateStudent(editingUser._id, userForm);
                          } else {
                            await addStudent(userForm);
                          }
                          setShowUserForm(false);
                          refetch();
                        } catch (err: any) {
                          setUserFormError(err.message || 'Failed to add/update user.');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      {editingUser ? 'Update' : 'Add'}
                    </button>
                  </div>
                  {userFormError && <div className="mt-3 text-red-400 text-sm">{userFormError}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              Integrations
            </h3>
            {/* Gemini API Key */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Gemini API Key</label>
              <input
                type="text"
                value={geminiKeyInput}
                onChange={handleGeminiKeyChange}
                className="w-full px-4 py-2 border rounded-lg bg-gray-900 border-gray-700 text-white"
                placeholder="Enter Gemini API Key"
              />
              <p className="text-xs text-gray-400 mt-2">Used for AI features (chat, feedback, resume).</p>
            </div>
            {/* Email Provider */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Provider</label>
              <input
                type="text"
                value={settingsDraft?.integrations?.emailProvider ?? ''}
                onChange={e => handleSettingChange('integrations', 'emailProvider', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-gray-900 border-gray-700 text-white"
                placeholder="e.g. SendGrid, Gmail, Mailgun"
              />
              <p className="text-xs text-gray-400 mt-2">For reference. Not connected to any provider yet.</p>
            </div>
            {/* Analytics Enabled Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Analytics Enabled</span>
              <button
                type="button"
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settingsDraft?.integrations?.analyticsEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => handleSettingChange('integrations', 'analyticsEnabled', !settingsDraft?.integrations?.analyticsEnabled)}
              >
                <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-300 ${settingsDraft?.integrations?.analyticsEnabled ? 'translate-x-6' : ''}`}></span>
              </button>
            </div>
            {/* Backup Enabled Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Backup Enabled</span>
              <button
                type="button"
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settingsDraft?.integrations?.backupEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => handleSettingChange('integrations', 'backupEnabled', !settingsDraft?.integrations?.backupEnabled)}
              >
                <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-300 ${settingsDraft?.integrations?.backupEnabled ? 'translate-x-6' : ''}`}></span>
              </button>
            </div>
            <button
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Integrations'}
            </button>
            {saveMessage && <div className="mt-2 text-green-400">{saveMessage}</div>}
          </div>
        )}
      </div>

      {/* Save Button */}
      {activeTab === 'general' && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          saveMessage.includes('successfully') 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;