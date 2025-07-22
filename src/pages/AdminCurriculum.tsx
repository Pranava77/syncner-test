import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchCurriculum,
} from '../redux/slices/curriculumSlice';
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

interface Curriculum {
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
  estimatedDuration: number; // Changed from estimatedHours to estimatedDuration to match backend
  createdAt: string;
  updatedAt: string;
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

interface CurriculumForm {
  title: string;
  description: string;
  difficulty: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  estimatedDuration: number; // Changed from estimatedHours to estimatedDuration
  isActive: boolean;
}

const defaultCurriculumForm: CurriculumForm = {
  title: '',
  description: '',
  difficulty: 'Beginner',
  
  careerTrack: 'fullstack',
  skills: [],
  prerequisites: [],
  estimatedDuration: 1,
  isActive: true,
};

const AdminCurriculum: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: curriculum, loading, error } = useAppSelector((state) => state.curriculum);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [editingContent, setEditingContent] = useState<{ type: 'learn' | 'test' | 'exercise', item: any, index: number } | null>(null);
  const [curriculumForm, setCurriculumForm] = useState<CurriculumForm>(defaultCurriculumForm);
  const [contentForm, setContentForm] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [expandedCurriculum, setExpandedCurriculum] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    dispatch(fetchCurriculum());
  }, [dispatch]);

  const filteredCurriculum = curriculum.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = filterTrack === 'all' || item.careerTrack === filterTrack;
    const matchesDifficulty = filterDifficulty === 'all' || item.difficulty === filterDifficulty;
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
      case 'fullstack': return 'bg-blue-500';
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

  const handleAddCurriculum = () => {
    setEditingCurriculum(null);
    setCurriculumForm(defaultCurriculumForm);
    setShowCurriculumModal(true);
    setFormError('');
  };

  const handleEditCurriculum = (item: Curriculum) => {
    setEditingCurriculum(item);
    setCurriculumForm({
      title: item.title,
      description: item.description,
      difficulty: item.difficulty,
      // duration: item.duration, // Removed as it's not in the backend model
      estimatedDuration: item.estimatedDuration,
      careerTrack: item.careerTrack,
      skills: item.skills,
      prerequisites: item.prerequisites,
    });
    setShowCurriculumModal(true);
    setFormError('');
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this curriculum item?')) {
      try {
        await apiService.delete(`/curriculum/${id}`);
        dispatch(fetchCurriculum());
      } catch (error) {
        console.error('Error deleting curriculum item:', error);
      }
    }
  };

  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumForm.title.trim() || !curriculumForm.description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    try {
      const payload = {
        ...curriculumForm,
        estimatedDuration: curriculumForm.estimatedDuration,
      };
      if (editingCurriculum) {
        await apiService.put(`/curriculum/${editingCurriculum.id}`, payload);
      } else {
        await apiService.post('/curriculum', payload);
      }
      setShowCurriculumModal(false);
      setCurriculumForm(defaultCurriculumForm);
      setFormError('');
      dispatch(fetchCurriculum());
    } catch (error) {
      console.error('Error saving curriculum item:', error);
      setFormError('Failed to save curriculum item');
    }
  };

  const handleAddContent = (curriculumId: string, type: 'learn' | 'test' | 'exercise') => {
    setEditingContent(null);
    setContentForm({});
    setShowContentModal(true);
    setFormError('');
  };

  const handleEditContent = (curriculumId: string, type: 'learn' | 'test' | 'exercise', item: any, index: number) => {
    setEditingContent({ type, item, index });
    setContentForm({ ...item });
    setShowContentModal(true);
    setFormError('');
  };

  const handleDeleteContent = async (curriculumId: string, type: 'learn' | 'test' | 'exercise', index: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await apiService.delete(`/curriculum/${curriculumId}/${type}/${index}`);
        dispatch(fetchCurriculum());
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentForm.title) {
      setFormError('Title is required');
      return;
    }

    try {
      if (editingContent && editingCurriculum) {
        await apiService.put(`/curriculum/${editingCurriculum.id}/${editingContent.type}/${editingContent.index}`, contentForm);
      } else if (editingCurriculum) {
        const contentType = editingContent?.type || 'learn';
        await apiService.post(`/curriculum/${editingCurriculum.id}/${contentType}`, contentForm);
      }
      
      setShowContentModal(false);
      setContentForm({});
      setFormError('');
      dispatch(fetchCurriculum());
    } catch (error) {
      console.error('Error saving content:', error);
      setFormError('Failed to save content');
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedCurriculum(prev => {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading text-paperwhite mb-2">Curriculum Management</h1>
            <p className="text-teallight">Create and manage training curriculum with learn, test, and exercise content</p>
            {lastUpdated && (
              <p className="text-xs text-teallight mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-400 mt-1">
                Error: {error}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(fetchCurriculum())}
              disabled={loading}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-paperwhite/10 text-paperwhite px-4 py-2 rounded-lg hover:bg-paperwhite/20 transition-colors font-medium disabled:opacity-50"
            >
              <ArrowClockwiseIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddCurriculum}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Create Curriculum
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search curriculum..."
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
            <option value="fullstack">Full Stack</option>
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

        {/* Curriculum */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto"></div>
              <p className="text-teallight mt-4">Loading curriculum...</p>
            </div>
          ) : filteredCurriculum.length === 0 ? (
            <div className="text-center py-12">
              <LayersIcon className="h-16 w-16 text-paperwhite/30 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-paperwhite mb-2">No curriculum found</h3>
              <p className="text-teallight">Create your first curriculum item to get started</p>
            </div>
          ) : (
            filteredCurriculum.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-offblack border border-paperwhite/20 rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(item.difficulty)}`}>
                        <StarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-heading text-paperwhite">{item.title}</h3>
                        <p className="text-teallight text-sm">{item.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTrackColor(item.careerTrack)} text-white`}>
                            {getTrackLabel(item.careerTrack)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(item.difficulty)} text-white`}>
                            {item.difficulty}
                          </span>
                          <span className="text-xs text-teallight flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {item.estimatedDuration}h
                          </span>
                          <span className="text-xs text-teallight">
                            Order: {item.order}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${item.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {item.isActive ? <CheckCircledIcon className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="p-2 text-teallight hover:text-paperwhite transition-colors"
                      >
                        {expandedCurriculum.has(item.id) ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEditCurriculum(item)}
                        className="p-2 text-teallight hover:text-trueturquoise transition-colors"
                        title="Edit Curriculum"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCurriculum(item.id)}
                        className="p-2 text-teallight hover:text-red-400 transition-colors"
                        title="Delete Curriculum"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedCurriculum.has(item.id) && (
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
                              {item.skills.map((skill: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-trueturquoise/20 text-trueturquoise text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-paperwhite mb-2">Prerequisites:</h4>
                            <div className="flex flex-wrap gap-1">
                              {item.prerequisites.map((prereq: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-paperwhite/20 text-paperwhite text-xs rounded">
                                  {prereq}
                                </span>
                              ))}
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-4">
                          {/* Learn Content */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-paperwhite flex items-center gap-2">
                                <BookOpenIcon className="h-4 w-4 text-green-400" />
                                Learn Content ({item.learn.length})
                              </h4>
                              <button
                                onClick={() => handleAddContent(item.id, 'learn')}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                              >
                                Add Learn
                              </button>
                            </div>
                            <div className="space-y-2">
                              {item.learn.map((learnItem: LearnItem, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-paperwhite/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getContentColor('learn')}`}>
                                      {getContentIcon('learn')}
                                    </div>
                                    <span className="text-sm text-paperwhite">{learnItem.title}</span>
                                    <span className="text-xs text-teallight">({learnItem.type})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditContent(item.id, 'learn', learnItem, index)}
                                      className="p-1 text-teallight hover:text-trueturquoise transition-colors"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(item.id, 'learn', index)}
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
                                Test Content ({item.test.length})
                              </h4>
                              <button
                                onClick={() => handleAddContent(item.id, 'test')}
                                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                              >
                                Add Test
                              </button>
                            </div>
                            <div className="space-y-2">
                              {item.test.map((testItem: TestItem, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-paperwhite/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getContentColor('test')}`}>
                                      {getContentIcon('test')}
                                    </div>
                                    <span className="text-sm text-paperwhite">{testItem.question}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditContent(item.id, 'test', testItem, index)}
                                      className="p-1 text-teallight hover:text-trueturquoise transition-colors"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(item.id, 'test', index)}
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
                                Exercise Content ({item.exercise.length})
                              </h4>
                              <button
                                onClick={() => handleAddContent(item.id, 'exercise')}
                                className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 transition-colors"
                              >
                                Add Exercise
                              </button>
                            </div>
                            <div className="space-y-2">
                              {item.exercise.map((exerciseItem: ExerciseItem, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-paperwhite/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getContentColor('exercise')}`}>
                                      {getContentIcon('exercise')}
                                    </div>
                                    <span className="text-sm text-paperwhite">{exerciseItem.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditContent(item.id, 'exercise', exerciseItem, index)}
                                      className="p-1 text-teallight hover:text-trueturquoise transition-colors"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(item.id, 'exercise', index)}
                                      className="p-1 text-teallight hover:text-red-400 transition-colors"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
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

      {/* Curriculum Modal */}
      <AnimatePresence>
        {showCurriculumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCurriculumModal(false)}
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
                  {editingCurriculum ? 'Edit Curriculum' : 'Create Curriculum'}
                </h2>
                <button
                  onClick={() => setShowCurriculumModal(false)}
                  className="p-2 text-teallight hover:text-paperwhite transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCurriculumSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={curriculumForm.title}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    placeholder="Enter curriculum title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Description *
                  </label>
                  <textarea
                    value={curriculumForm.description}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                    placeholder="Enter curriculum description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={curriculumForm.difficulty}
                      onChange={(e) => setCurriculumForm({ ...curriculumForm, difficulty: e.target.value })}
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
                      value={curriculumForm.careerTrack}
                      onChange={(e) => setCurriculumForm({ ...curriculumForm, careerTrack: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    >
                      <option value="fullstack">Full Stack</option>
                      <option value="ai-ml">AI/ML</option>
                      <option value="ui-ux">UI/UX</option>
                      <option value="data-science">Data Science</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  

                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={curriculumForm.estimatedDuration}
                      onChange={(e) => setCurriculumForm({ ...curriculumForm, estimatedDuration: parseInt(e.target.value) || 1 })}
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
                    value={curriculumForm.skills.join(', ')}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
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
                    value={curriculumForm.prerequisites.join(', ')}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, prerequisites: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    placeholder="e.g., Basic programming knowledge"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={curriculumForm.isActive}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, isActive: e.target.checked })}
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
                    {loading ? 'Saving...' : (editingCurriculum ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCurriculumModal(false)}
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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