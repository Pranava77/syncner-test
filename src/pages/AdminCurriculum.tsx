import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  PlusIcon,
  Pencil1Icon as EditIcon,
  TrashIcon,
  Cross1Icon as X,
  CheckCircledIcon,
  FileTextIcon,
  ReaderIcon as BookOpenIcon,
  ClipboardIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LayersIcon,
  StarIcon,
  ClockIcon,
  UpdateIcon as ArrowClockwiseIcon
} from '@radix-ui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import LevelStatus from '../components/LevelStatus';

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: LearnItem[];
  test: TestItem[];
  exercise: ExerciseItem[];
  order: number;
  isActive: boolean;
  estimatedDuration: number; // Changed to match backend
  createdAt: string;
  updatedAt: string;
  type: string;
  content: string;
}

interface LearnItem {
  type: 'video' | 'reading' | 'slide' | 'other';
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

interface TestItem {
  question: string;
  options: string[];
  answer: string;
  order: number;
}

interface ExerciseItem {
  title: string;
  description: string;
  resources: string[];
  order: number;
}

interface LevelForm {
  title: string;
  description: string;
  difficulty: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  estimatedDuration: number; // Changed to match backend
  isActive: boolean;
  type: string;
  content: string;
}

const defaultLevelForm: LevelForm = {
  title: 'New Level',
  description: 'A detailed description for the new level.',
  difficulty: 'beginner',
  // duration: '', // Removed as it's not in the backend model
  careerTrack: 'full-stack',
  skills: [],
  prerequisites: [],
  estimatedDuration: 1,
  isActive: true,
  type: 'syllabus',
  content: 'Default content for the new level, at least 10 characters.',
};

const AdminCurriculum: React.FC = () => {
  const dispatch = useAppDispatch();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editingContent, setEditingContent] = useState<{ type: 'learn' | 'test' | 'exercise', item: any, index: number } | null>(null);
  const [levelForm, setLevelForm] = useState<LevelForm>(defaultLevelForm);
  const [contentForm, setContentForm] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch levels on component mount and set up auto-refresh
  useEffect(() => {
    fetchLevels();
    
    // Auto-refresh every 30 seconds to keep data fresh
    const interval = setInterval(() => {
      fetchLevels();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      console.log('Fetching levels from API...');
      const response = await apiService.getLevels();
      console.log('API Response:', response);
      
      // Handle different response formats
      let levelsData = [];
      if (response && response.data) {
        levelsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levelsData = response;
      }
      
      console.log('Processed levels data:', levelsData);
      setLevels(levelsData);
      setLastUpdated(new Date());
      setFormError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching levels:', error);
      setFormError('Failed to load levels. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLevels = levels.filter(level => {
    const matchesSearch = level.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         level.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = filterTrack === 'all' || level.careerTrack === filterTrack;
    const matchesDifficulty = filterDifficulty === 'all' || level.difficulty === filterDifficulty;
    return matchesSearch && matchesTrack && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'full-stack': return 'bg-blue-500';
      case 'ai-ml': return 'bg-purple-500';
      case 'ui-ux': return 'bg-pink-500';
      case 'data-science': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackLabel = (track: string) => {
    switch (track) {
      case 'fullstack': return 'Full Stack';
      case 'ai-ml': return 'AI/ML';
      case 'ui-ux': return 'UI/UX';
      case 'data-science': return 'Data Science';
      default: return track;
    }
  };

  const handleAddLevel = () => {
    setEditingLevel(null);
    setLevelForm(defaultLevelForm);
    setShowLevelModal(true);
    setFormError('');
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setLevelForm({
      title: level.title,
      description: level.description,
      difficulty: level.difficulty,
      // duration: level.duration, // Removed as it's not in the backend model
      careerTrack: level.careerTrack,
      skills: level.skills,
      prerequisites: level.prerequisites,
      estimatedDuration: level.estimatedDuration,
      isActive: level.isActive,
      type: level.type, // Assuming level has a type property
      content: level.content, // Assuming level has a content property
    });
    setShowLevelModal(true);
    setFormError('');
  };

  const handleDeleteLevel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      try {
        await apiService.delete(`/curriculum/${id}`);
        await fetchLevels();
      } catch (error) {
        console.error('Error deleting level:', error);
      }
    }
  };

  const handleLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.title.trim() || !levelForm.description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      if (editingLevel) {
        await apiService.put(`/curriculum/${editingLevel.id}`, levelForm);
        setShowLevelModal(false);
        setLevelForm(defaultLevelForm);
        setFormError('');
        await fetchLevels();
      } else {
        await apiService.post('/curriculum', levelForm);
        setShowLevelModal(false);
        setLevelForm(defaultLevelForm);
        setFormError('');
        await fetchLevels();
      }
    } catch (error) {
      console.error('Error saving level:', error);
      setFormError('Failed to save level');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = (levelId: string, type: 'learn' | 'test' | 'exercise') => {
    setEditingContent(null);
    setContentForm({});
    setShowContentModal(true);
    setFormError('');
  };

  const handleEditContent = (levelId: string, type: 'learn' | 'test' | 'exercise', item: any, index: number) => {
    setEditingContent({ type, item, index });
    setContentForm({ ...item });
    setShowContentModal(true);
    setFormError('');
  };

  const handleDeleteContent = async (levelId: string, type: 'learn' | 'test' | 'exercise', index: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await apiService.delete(`/curriculum/${levelId}/${type}/${index}`);
        await fetchLevels();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentForm.title || !contentForm.content) {
      setFormError('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      if (editingContent && editingLevel) {
        await apiService.put(`/curriculum/${editingLevel.id}/${editingContent.type}/${editingContent.index}`, contentForm);
      } else if (editingLevel) {
        const contentType = editingContent?.type || 'learn';
        await apiService.post(`/curriculum/${editingLevel.id}/${contentType}`, contentForm);
      }
      
      setShowContentModal(false);
      setContentForm({});
      setFormError('');
      await fetchLevels();
    } catch (error) {
      console.error('Error saving content:', error);
      setFormError('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'learn': return <BookOpenIcon className="h-4 w-4" />;
      case 'test': return <ClipboardIcon className="h-4 w-4" />;
      case 'exercise': return <PlayIcon className="h-4 w-4" />;
      default: return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'learn': return 'bg-green-500';
      case 'test': return 'bg-yellow-500';
      case 'exercise': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-paperwhite p-6">
      <LevelStatus onLevelsLoaded={(levels) => {
        console.log('Levels loaded from status component:', levels);
        setLevels(levels);
      }} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading text-paperwhite mb-2">Level Management</h1>
            <p className="text-teallight">Create and manage training levels with learn, test, and exercise content</p>
            {lastUpdated && (
              <p className="text-xs text-teallight mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            {formError && (
              <p className="text-xs text-red-400 mt-1">
                Error: {formError}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLevels}
              disabled={loading}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-paperwhite/10 text-paperwhite px-4 py-2 rounded-lg hover:bg-paperwhite/20 transition-colors font-medium disabled:opacity-50"
            >
              <ArrowClockwiseIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddLevel}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Create Level
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search levels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-offblack border border-paperwhite/20 rounded-lg text-paperwhite placeholder-teallight focus:outline-none focus:border-trueturquoise"
            />
          </div>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-4 py-2 bg-offblack border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
          >
            <option value="all">All Tracks</option>
            <option value="full-stack">Full Stack</option>
            <option value="ai-ml">AI/ML</option>
            <option value="ui-ux">UI/UX</option>
            <option value="data-science">Data Science</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 bg-offblack border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Levels */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto"></div>
              <p className="text-teallight mt-4">Loading levels...</p>
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="text-center py-12">
              <LayersIcon className="h-16 w-16 text-paperwhite/30 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-paperwhite mb-2">No levels found</h3>
              <p className="text-teallight">Create your first training level to get started</p>
            </div>
          ) : (
            filteredLevels.map((level) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-offblack border border-paperwhite/20 rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(level.difficulty)}`}>
                        <StarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-heading text-paperwhite">{level.title}</h3>
                        <p className="text-teallight text-sm">{level.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTrackColor(level.careerTrack)} text-white`}>
                            {getTrackLabel(level.careerTrack)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(level.difficulty)} text-white`}>
                            {level.difficulty}
                          </span>
                          <span className="text-xs text-teallight flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {level.estimatedDuration}h
                          </span>
                          <span className="text-xs text-teallight">
                            Order: {level.order}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${level.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {level.isActive ? <CheckCircledIcon className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {level.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(level.id)}
                        className="p-2 text-teallight hover:text-paperwhite transition-colors"
                      >
                        {expandedLevels.has(level.id) ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEditLevel(level)}
                        className="p-2 text-teallight hover:text-trueturquoise transition-colors"
                        title="Edit Level"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="p-2 text-teallight hover:text-red-400 transition-colors"
                        title="Delete Level"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedLevels.has(level.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-paperwhite/10"
                    >
                      <div className="p-4 bg-paperwhite/5">
                        {/* Skills and Prerequisites */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h4 className="text-sm font-medium text-paperwhite mb-2">Skills:</h4>
                            <div className="flex flex-wrap gap-1">
                              {level.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-trueturquoise/20 text-trueturquoise text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-paperwhite mb-2">Prerequisites:</h4>
                            <div className="flex flex-wrap gap-1">
                              {level.prerequisites.map((prereq, index) => (
                                <span key={index} className="px-2 py-1 bg-paperwhite/20 text-paperwhite text-xs rounded">
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-4">
                          {/* Learn Content */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-paperwhite flex items-center gap-2">
                                <BookOpenIcon className="h-4 w-4 text-green-400" />
                                Learn Content ({level.learn.length})
                              </h4>
                              <button
                                onClick={() => handleAddContent(level.id, 'learn')}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                              >
                                Add Learn
                              </button>
                            </div>
                            <div className="space-y-2">
                              {level.learn.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-paperwhite/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getContentColor('learn')}`}>
                                      {getContentIcon('learn')}
                                    </div>
                                    <span className="text-sm text-paperwhite">{item.title}</span>
                                    <span className="text-xs text-teallight">({item.type})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditContent(level.id, 'learn', item, index)}
                                      className="p-1 text-teallight hover:text-trueturquoise transition-colors"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(level.id, 'learn', index)}
                                      className="p-1 text-teallight hover:text-red-400 transition-colors"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Test Content */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-paperwhite flex items-center gap-2">
                                <ClipboardIcon className="h-4 w-4 text-yellow-400" />
                                Test Content ({level.test.length})
                              </h4>
                              <button
                                onClick={() => handleAddContent(level.id, 'test')}
                                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                              >
                                Add Test
                              </button>
                            </div>
                            <div className="space-y-2">
                              {level.test.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-paperwhite/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getContentColor('test')}`}>
                                      {getContentIcon('test')}
                                    </div>
                                    <span className="text-sm text-paperwhite">{item.question}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditContent(level.id, 'test', item, index)}
                                      className="p-1 text-teallight hover:text-trueturquoise transition-colors"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(level.id, 'test', index)}
                                      className="p-1 text-teallight hover:text-red-400 transition-colors"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Exercise Content */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-paperwhite flex items-center gap-2">
                                <PlayIcon className="h-4 w-4 text-purple-400" />
                                Exercise Content ({level.exercise.length})
                              </h4>
                              <button
                                onClick={() => handleAddContent(level.id, 'exercise')}
                                className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 transition-colors"
                              >
                                Add Exercise
                              </button>
                            </div>
                            <div className="space-y-2">
                              {level.exercise.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-paperwhite/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getContentColor('exercise')}`}>
                                      {getContentIcon('exercise')}
                                    </div>
                                    <span className="text-sm text-paperwhite">{item.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditContent(level.id, 'exercise', item, index)}
                                      className="p-1 text-teallight hover:text-trueturquoise transition-colors"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(level.id, 'exercise', index)}
                                      className="p-1 text-teallight hover:text-red-400 transition-colors"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Level Modal */}
      <AnimatePresence>
        {showLevelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLevelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-offblack border border-paperwhite/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading text-paperwhite">
                  {editingLevel ? 'Edit Level' : 'Create Level'}
                </h2>
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="p-2 text-teallight hover:text-paperwhite transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLevelSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={levelForm.title}
                    onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    placeholder="Enter level title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Description *
                  </label>
                  <textarea
                    value={levelForm.description}
                    onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                    placeholder="Enter level description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Content *
                  </label>
                  <textarea
                    value={levelForm.content}
                    onChange={(e) => setLevelForm({ ...levelForm, content: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                    placeholder="Enter content for the level (e.g., syllabus details)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={levelForm.difficulty}
                      onChange={(e) => setLevelForm({ ...levelForm, difficulty: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Career Track *
                    </label>
                    <select
                      value={levelForm.careerTrack}
                      onChange={(e) => setLevelForm({ ...levelForm, careerTrack: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    >
                      <option value="full-stack">Full Stack</option>
                      <option value="ai-ml">AI/ML</option>
                      <option value="ui-ux">UI/UX</option>
                      <option value="data-science">Data Science</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={levelForm.duration}
                      onChange={(e) => setLevelForm({ ...levelForm, duration: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                      placeholder="e.g., 2-3 weeks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={levelForm.estimatedDuration}
                      onChange={(e) => setLevelForm({ ...levelForm, estimatedDuration: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={levelForm.skills.join(', ')}
                    onChange={(e) => setLevelForm({ ...levelForm, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    placeholder="e.g., HTML, CSS, JavaScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Prerequisites (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={levelForm.prerequisites.join(', ')}
                    onChange={(e) => setLevelForm({ ...levelForm, prerequisites: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    placeholder="e.g., Basic programming knowledge"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={levelForm.isActive}
                    onChange={(e) => setLevelForm({ ...levelForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-trueturquoise bg-black border-paperwhite/20 rounded focus:ring-trueturquoise"
                  />
                  <label htmlFor="isActive" className="text-sm text-paperwhite">
                    Active
                  </label>
                </div>

                {formError && (
                  <div className="text-red-400 text-sm">{formError}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingLevel ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLevelModal(false)}
                    className="px-4 py-2 border border-paperwhite/20 text-paperwhite rounded-lg hover:bg-paperwhite/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Modal */}
      <AnimatePresence>
        {showContentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowContentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-offblack border border-paperwhite/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading text-paperwhite">
                  {editingContent ? `Edit ${editingContent.type}` : `Add ${editingContent?.type || 'Learn'}`}
                </h2>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="p-2 text-teallight hover:text-paperwhite transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleContentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={contentForm.title || ''}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    placeholder="Enter title"
                  />
                </div>

                                 {editingContent?.type === 'learn' && (
                   <div>
                     <label className="block text-sm font-medium text-paperwhite mb-2">
                       Type
                     </label>
                     <select
                       value={contentForm.type || 'reading'}
                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContentForm({ ...contentForm, type: e.target.value })}
                       className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                     >
                       <option value="reading">Reading</option>
                       <option value="video">Video</option>
                       <option value="slide">Slide</option>
                       <option value="other">Other</option>
                     </select>
                   </div>
                 )}

                 {editingContent?.type === 'learn' && contentForm.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Video URL
                    </label>
                                         <input
                       type="url"
                       value={contentForm.videoUrl || ''}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentForm({ ...contentForm, videoUrl: e.target.value })}
                       className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                       placeholder="https://example.com/video"
                     />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    {editingContent?.type === 'test' ? 'Question' : editingContent?.type === 'exercise' ? 'Description' : 'Content'} *
                  </label>
                  <textarea
                    value={contentForm.content || contentForm.question || contentForm.description || ''}
                    onChange={(e) => {
                      const field = editingContent?.type === 'test' ? 'question' : 
                                   editingContent?.type === 'exercise' ? 'description' : 'content';
                      setContentForm({ ...contentForm, [field]: e.target.value });
                    }}
                    rows={4}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                    placeholder={`Enter ${editingContent?.type === 'test' ? 'question' : editingContent?.type === 'exercise' ? 'description' : 'content'}`}
                  />
                </div>

                {editingContent?.type === 'test' && (
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Options (one per line)
                    </label>
                    <textarea
                      value={contentForm.options?.join('\n') || ''}
                      onChange={(e) => setContentForm({ ...contentForm, options: e.target.value.split('\n').filter(s => s.trim()) })}
                      rows={3}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                {editingContent?.type === 'test' && (
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={contentForm.answer || ''}
                      onChange={(e) => setContentForm({ ...contentForm, answer: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                      placeholder="Enter correct answer"
                    />
                  </div>
                )}

                {editingContent?.type === 'exercise' && (
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Resources (one per line)
                    </label>
                    <textarea
                      value={contentForm.resources?.join('\n') || ''}
                      onChange={(e) => setContentForm({ ...contentForm, resources: e.target.value.split('\n').filter(s => s.trim()) })}
                      rows={3}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                      placeholder="Resource 1&#10;Resource 2&#10;Resource 3"
                    />
                  </div>
                )}

                {formError && (
                  <div className="text-red-400 text-sm">{formError}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContentModal(false)}
                    className="px-4 py-2 border border-paperwhite/20 text-paperwhite rounded-lg hover:bg-paperwhite/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCurriculum; 