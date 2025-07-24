import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  Pencil1Icon as EditIcon,
  TrashIcon,
  Cross1Icon,
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
  UpdateIcon as ArrowClockwiseIcon,
  HamburgerMenuIcon,
  DesktopIcon,
  RocketIcon,
  ImageIcon,
  BarChartIcon
} from '@radix-ui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';


interface ReadFirst {
  brief?: string;
  whyLearn?: string;
  whereUsed?: string;
  customExample?: string;
}

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: LearnItem[];
  test: TestItem[];
  exercise: ExerciseItem[];
  order: number;
  isActive: boolean;
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
  readFirst?: ReadFirst;
  learnExpanded?: boolean;
  testExpanded?: boolean;
  exerciseExpanded?: boolean;
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
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  estimatedHours: number;
  isActive: boolean;
  order?: number;
  readFirst?: ReadFirst;
}

const defaultLevelForm: LevelForm = {
  title: '',
  description: '',
  difficulty: 'beginner',
  duration: '',
  careerTrack: 'full-stack',
  skills: [],
  prerequisites: [],
  estimatedHours: 1,
  isActive: true,
  readFirst: {
    brief: '',
    whyLearn: '',
    whereUsed: '',
    customExample: ''
  }
};

const AdminCurriculum: React.FC = () => {
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showTrackSelection, setShowTrackSelection] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async (track?: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching curriculum from API...');
      const url = track ? `/curriculum?careerTrack=${track}` : '/curriculum';
      const response = await apiService.get(url);
      console.log('API Response:', response);
      
      // Handle different response formats
      let levelsData = [];
      if (response && response.data) {
        levelsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levelsData = response;
      }
      
      console.log('Processed levels data:', levelsData);
      
      // First, find all syllabus items (main levels)
      const syllabusItems = levelsData.filter((item: any) => item.type === 'syllabus');
      console.log('Found syllabus items:', syllabusItems.length);
      
      // Create level map from syllabus items
      const levelMap = new Map();
      
      syllabusItems.forEach((syllabus: any) => {
        const levelKey = `${syllabus.order}-${syllabus.careerTrack}`;
        console.log('Creating level from syllabus:', { title: syllabus.title, order: syllabus.order, careerTrack: syllabus.careerTrack });
        
        levelMap.set(levelKey, {
          id: syllabus.id || levelKey,
          title: syllabus.title,
          description: syllabus.description || syllabus.content || '',
          difficulty: syllabus.difficulty || 'beginner',
          duration: syllabus.duration || '',
          careerTrack: syllabus.careerTrack,
          skills: syllabus.tags || [],
          prerequisites: syllabus.prerequisites || [],
          readFirst: syllabus.readFirst || {
            brief: '',
            whyLearn: '',
            whereUsed: '',
            customExample: ''
          },
          learn: [],
          test: [],
          exercise: [],
          order: syllabus.order || 1,
          isActive: syllabus.isActive !== false,
          estimatedHours: syllabus.estimatedDuration ? Math.ceil(syllabus.estimatedDuration / 60) : 1,
          createdAt: syllabus.createdAt || new Date().toISOString(),
          updatedAt: syllabus.updatedAt || new Date().toISOString()
        });
      });
      
      // Now add content items to their respective levels
      const contentItems = levelsData.filter((item: any) => item.type !== 'syllabus');
      console.log('Found content items:', contentItems.length);
      
      contentItems.forEach((item: any) => {
        const levelKey = `${item.order}-${item.careerTrack}`;
        const level = levelMap.get(levelKey);
        
        if (level) {
          console.log('Adding content to level:', { levelTitle: level.title, contentType: item.type, contentTitle: item.title });
          
          if (item.type === 'learn') {
            level.learn.push({
              id: item.id,
              type: 'reading',
              title: item.title,
              content: item.content || '',
              videoUrl: '',
              order: item.order || 1
            });
          } else if (item.type === 'test') {
            // Parse test content to extract question and options
            const lines = (item.content || '').split('\n');
            const question = lines[0] || item.title;
            const options: string[] = [];
            let answer = '';
            
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
                options.push(line.substring(2).trim());
              } else if (line.startsWith('Answer:')) {
                answer = line.split(':')[1]?.trim() || '';
              }
            }
            
            level.test.push({
              id: item.id,
              question: question,
              options: options,
              answer: answer,
              order: item.order || 1
            });
          } else if (item.type === 'exercise') {
            level.exercise.push({
              id: item.id,
              title: item.title,
              description: item.content || item.description || '',
              resources: item.resources || [],
              order: item.order || 1
            });
          }
        } else {
          console.warn('No level found for content item:', { title: item.title, order: item.order, careerTrack: item.careerTrack });
        }
      });
      
      // Convert map to array and sort by order
      const uniqueLevels = Array.from(levelMap.values()).sort((a: Level, b: Level) => a.order - b.order);
      console.log('Grouping complete. Unique levels created:', uniqueLevels.length);
      
      console.log('Unique levels after grouping:', uniqueLevels);
      console.log('AdminCurriculum: Levels by track:', uniqueLevels.reduce((acc: Record<string, number>, level: Level) => {
        acc[level.careerTrack] = (acc[level.careerTrack] || 0) + 1;
        return acc;
      }, {}));
      
      // Debug: Show content distribution
      uniqueLevels.forEach((level: Level) => {
        console.log(`Level ${level.order}: ${level.title}`, {
          learn: level.learn.length,
          test: level.test.length,
          exercise: level.exercise.length
        });
      });
      
      setLevels(uniqueLevels);
      setLastUpdated(new Date());
      setFormError(''); // Clear any previous errors
    } catch (error: any) {
      console.error('Error fetching levels:', error);
      const errorMessage = error.message || 'Failed to load levels. Please check your connection.';
      setError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
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
      case 'full-stack': return 'Full Stack';
      case 'ai-ml': return 'AI/ML';
      case 'ui-ux': return 'UI/UX';
      case 'data-science': return 'Data Science';
      default: return track;
    }
  };

  const handleAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({
      ...defaultLevelForm,
      careerTrack: selectedTrack || 'full-stack',
      order: levels.length + 1 // Auto-assign next order number
    });
    setShowLevelModal(true);
    setFormError('');
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setLevelForm({
      title: level.title,
      description: level.description,
      difficulty: level.difficulty.toLowerCase(),
      duration: level.duration,
      careerTrack: level.careerTrack,
      skills: level.skills,
      prerequisites: level.prerequisites,
      estimatedHours: level.estimatedHours,
      isActive: level.isActive,
      readFirst: level.readFirst || {
        brief: '',
        whyLearn: '',
        whereUsed: '',
        customExample: ''
      }
    });
    setShowLevelModal(true);
    setFormError('');
  };

  const handleDeleteLevel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      try {
        setError(null);
        // Find the level to get its title and career track
        const level = levels.find(l => l.id === id);
        if (level) {
          // Delete all curriculum items for this level (same title and career track)
          const response = await apiService.get('/curriculum');
          const curriculumItems = response.data || [];
          const itemsToDelete = curriculumItems.filter((item: any) => 
            item.title === level.title && item.careerTrack === level.careerTrack
          );
          
          // Delete each item
          for (const item of itemsToDelete) {
            await apiService.delete(`/curriculum/${item._id}`);
          }
        }
        await fetchLevels(selectedTrack || undefined);
        setSuccessMessage('Level deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: any) {
        console.error('Error deleting level:', error);
        const errorMessage = error.message || 'Failed to delete level';
        setError(errorMessage);
      }
    }
  };

  const handleLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.title.trim() || !levelForm.description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingLevel) {
        await apiService.put(`/curriculum/${editingLevel.id}`, {
          ...levelForm,
          type: 'syllabus',
          content: levelForm.description,
          estimatedDuration: levelForm.estimatedHours * 60,
          tags: levelForm.skills,
          learningObjectives: levelForm.prerequisites,
          readFirst: levelForm.readFirst
        });
        setShowLevelModal(false);
        setLevelForm(defaultLevelForm);
        setFormError('');
        await fetchLevels(selectedTrack || undefined);
        setSuccessMessage('Level updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Create new level
        await apiService.post('/curriculum', {
          ...levelForm,
          type: 'syllabus',
          content: levelForm.description,
          estimatedDuration: levelForm.estimatedHours * 60,
          tags: levelForm.skills,
          learningObjectives: levelForm.prerequisites,
          readFirst: levelForm.readFirst
        });
        setShowLevelModal(false);
        setLevelForm(defaultLevelForm);
        setFormError('');
        await fetchLevels(selectedTrack || undefined);
        setSuccessMessage('Level created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error saving level:', error);
      const errorMessage = error.message || 'Failed to save level';
      setFormError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContent = (type: 'learn' | 'test' | 'exercise', level: Level) => {
    setEditingContent({ type, item: null, index: -1 });
    setEditingLevel(level);
    setContentForm({
      title: '',
      order: 1,
      type: type === 'learn' ? 'reading' : undefined,
      content: '',
      videoUrl: '',
      question: '',
      options: [],
      answer: '',
      description: '',
      resources: []
    });
    setShowContentModal(true);
    setFormError('');
  };

  const handleEditContent = (type: 'learn' | 'test' | 'exercise', item: any, index: number, level: Level) => {
    setEditingContent({ type, item, index });
    setEditingLevel(level);
    
    // Parse content based on type
    let parsedForm = { ...item };
    
    if (type === 'test' && item.content) {
      const lines = item.content.split('\n');
      parsedForm.question = lines[0];
      parsedForm.options = [];
      parsedForm.answer = '';
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
          parsedForm.options.push(line.substring(2).trim());
        } else if (line.startsWith('Answer:') || line.startsWith('Correct Answer:')) {
          parsedForm.answer = line.split(':')[1]?.trim() || '';
        }
      }
    } else if (type === 'exercise') {
      parsedForm.description = item.content;
    }
    
    setContentForm(parsedForm);
    setShowContentModal(true);
    setFormError('');
  };

  const handleDeleteContent = async (levelId: string, type: 'learn' | 'test' | 'exercise', index: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        setError(null);
        // Find the level to get its title and career track
        const level = levels.find(l => l.id === levelId);
        if (level) {
          // Find the specific content item to delete
          const response = await apiService.get('/curriculum');
          const curriculumItems = response.data || [];
          const levelItems = curriculumItems.filter((item: any) => 
            item.title === level.title && 
            item.careerTrack === level.careerTrack &&
            item.type === type
          ).sort((a: any, b: any) => a.order - b.order);
          
          if (levelItems[index]) {
            await apiService.delete(`/curriculum/${levelItems[index]._id}`);
          }
        }
        await fetchLevels(selectedTrack || undefined);
        setSuccessMessage('Content deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: any) {
        console.error('Error deleting content:', error);
        const errorMessage = error.message || 'Failed to delete content';
        setError(errorMessage);
      }
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentForm.title) {
      setFormError('Title is required');
      return;
    }

    // Validate content based on type
    const contentType = editingContent?.type || 'learn';
    if (contentType === 'learn' && !contentForm.content) {
      setFormError('Content is required for learn items');
      return;
    } else if (contentType === 'test' && !contentForm.question) {
      setFormError('Question is required for test items');
      return;
    } else if (contentType === 'exercise' && !contentForm.description) {
      setFormError('Description is required for exercise items');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingContent && editingLevel) {
        // Find the specific content item to update
        const response = await apiService.get('/curriculum');
        const curriculumItems = response.data || [];
        const levelItems = curriculumItems.filter((item: any) => 
          item.title === editingLevel.title && 
          item.careerTrack === editingLevel.careerTrack &&
          item.type === editingContent.type
        ).sort((a: any, b: any) => a.order - b.order);
        
        if (levelItems[editingContent.index]) {
          const itemToUpdate = levelItems[editingContent.index];
          const updateData: any = {
            title: contentForm.title,
            type: editingContent.type,
            careerTrack: editingLevel.careerTrack,
            difficulty: editingLevel.difficulty,
            order: editingLevel.order, // Use the level's order
            isActive: true,
            prerequisites: [editingLevel.title], // Link to the level
            tags: [contentType, editingLevel.careerTrack]
          };

          if (contentType === 'learn') {
            updateData.content = contentForm.content;
            updateData.videoUrl = contentForm.videoUrl;
            updateData.description = contentForm.title;
          } else if (contentType === 'test') {
            // Format test content
            let formattedContent = contentForm.question;
            if (contentForm.options && contentForm.options.length > 0) {
              formattedContent += '\n' + contentForm.options.map((opt: string, idx: number) => 
                `${String.fromCharCode(65 + idx)}) ${opt}`
              ).join('\n');
            }
            if (contentForm.answer) {
              formattedContent += `\nAnswer: ${contentForm.answer}`;
            }
            updateData.content = formattedContent;
            updateData.description = contentForm.title;
          } else if (contentType === 'exercise') {
            updateData.content = contentForm.description;
            updateData.resources = contentForm.resources || [];
            updateData.description = contentForm.title;
          }

          await apiService.put(`/curriculum/${itemToUpdate._id}`, updateData);
        }
      } else if (editingLevel) {
        // Create new content item
        const newContentData: any = {
          title: contentForm.title,
          type: contentType,
          careerTrack: editingLevel.careerTrack,
          difficulty: editingLevel.difficulty,
          order: editingLevel.order, // Use the level's order
          isActive: true,
          prerequisites: [editingLevel.title], // Link to the level
          tags: [contentType, editingLevel.careerTrack]
        };

        if (contentType === 'learn') {
          newContentData.content = contentForm.content;
          newContentData.videoUrl = contentForm.videoUrl;
          newContentData.description = contentForm.title;
        } else if (contentType === 'test') {
          // Format test content
          let formattedContent = contentForm.question;
          if (contentForm.options && contentForm.options.length > 0) {
            formattedContent += '\n' + contentForm.options.map((opt: string, idx: number) => 
              `${String.fromCharCode(65 + idx)}) ${opt}`
            ).join('\n');
          }
          if (contentForm.answer) {
            formattedContent += `\nAnswer: ${contentForm.answer}`;
          }
          newContentData.content = formattedContent;
          newContentData.description = contentForm.title;
        } else if (contentType === 'exercise') {
          newContentData.content = contentForm.description;
          newContentData.resources = contentForm.resources || [];
          newContentData.description = contentForm.title;
        }

        await apiService.post('/curriculum', newContentData);
      }
      
      setShowContentModal(false);
      setContentForm({});
      setFormError('');
      await fetchLevels(selectedTrack || undefined);
      setSuccessMessage('Content saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving content:', error);
      const errorMessage = error.message || 'Failed to save content';
      setFormError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get track statistics
  const trackStats = levels.reduce((acc: Record<string, number>, level: Level) => {
    acc[level.careerTrack] = (acc[level.careerTrack] || 0) + 1;
    return acc;
  }, {});

  // Filter levels based on search and filters
  const filteredLevels = levels.filter(level => {
    const matchesSearch = level.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         level.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = filterTrack === 'all' || level.careerTrack === filterTrack;
    const matchesDifficulty = filterDifficulty === 'all' || level.difficulty === filterDifficulty;
    
    return matchesSearch && matchesTrack && matchesDifficulty;
  });

  const handleTrackSelect = (track: string) => {
    setSelectedTrack(track);
    setShowTrackSelection(false);
    fetchLevels(track);
  };

  const applyTemplate = (templateType: string) => {
    const templates = {
      'web-development': {
        brief: 'Web development is the process of creating websites and web applications that run on the internet. It involves writing code that browsers can understand and display to users.',
        whyLearn: 'Web development is one of the most in-demand skills in today\'s digital world. Every business needs a website, and the demand for web developers continues to grow.',
        whereUsed: 'Web development is used everywhere! From simple business websites to complex applications like Facebook, Netflix, and Google.',
        customExample: 'Think of web development like building a house. HTML is the foundation and structure, CSS is the design and decoration, and JavaScript is the electrical system that makes everything interactive.'
      },
      'ai-ml': {
        brief: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.',
        whyLearn: 'Machine Learning is revolutionizing every industry - from healthcare and finance to entertainment and transportation.',
        whereUsed: 'ML is used in recommendation systems, autonomous vehicles, medical diagnosis, fraud detection, and countless other applications.',
        customExample: 'Think of ML like teaching a child to recognize animals. You show them many pictures, and over time, they learn to identify new animals they\'ve never seen before.'
      },
      'ui-ux': {
        brief: 'User Experience (UX) Design is the process of creating products that provide meaningful and relevant experiences to users.',
        whyLearn: 'UX design is crucial for business success. Good UX leads to higher user satisfaction, increased engagement, and better conversion rates.',
        whereUsed: 'UX design is used in websites, mobile apps, software applications, digital products, and even physical products.',
        customExample: 'Think of UX design like designing a restaurant. You consider the layout, lighting, menu design, and service flow to create a natural and enjoyable experience.'
      },
      'data-science': {
        brief: 'Data Science is an interdisciplinary field that uses scientific methods to extract knowledge and insights from structured and unstructured data.',
        whyLearn: 'Data Science is one of the fastest-growing fields with high demand and excellent salaries. Every industry needs data scientists.',
        whereUsed: 'Data Science is used in finance, healthcare, marketing, sports analytics, and virtually every industry that collects data.',
        customExample: 'Think of Data Science like being a detective. You collect evidence, analyze patterns, form hypotheses, and solve mysteries using data.'
      }
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setLevelForm({
        ...levelForm,
        readFirst: template
      });
      setShowTemplates(false);
    }
  };

  const handleBackToTracks = () => {
    setSelectedTrack(null);
    setShowTrackSelection(true);
    setLevels([]);
  };

  if (loading && levels.length === 0) {
    return (
      <div className="flex h-screen bg-offblack w-full">
        <main className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto mb-4"></div>
            <p className="text-paperwhite text-lg">Loading curriculum levels...</p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm max-w-md mx-auto">
                <p className="font-medium">Error loading curriculum:</p>
                <p>{error}</p>
                <button 
                  onClick={() => fetchLevels(selectedTrack || undefined)}
                  className="mt-2 bg-trueturquoise text-offblack px-3 py-1 rounded text-xs hover:bg-trueturquoise/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-offblack w-full">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {showTrackSelection ? (
            // Track Selection View
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-heading text-paperwhite mb-2">Curriculum Management</h1>
                    <p className="text-teallight">
                      Select a career track to manage its training levels and content
                    </p>
                    {successMessage && (
                      <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                        {successMessage}
                      </div>
                    )}
                    {error && (
                      <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    {formError && (
                      <p className="text-xs text-red-400 mt-1">
                        Error: {formError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => fetchLevels()}
                    disabled={loading}
                    className="flex items-center gap-2 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <ArrowClockwiseIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh All
                  </button>
                </div>
              </div>

              {/* Track Selection Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: 'full-stack', name: 'Full Stack', icon: DesktopIcon, color: 'bg-blue-500', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
                  { id: 'ai-ml', name: 'AI/ML', icon: RocketIcon, color: 'bg-purple-500', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
                  { id: 'ui-ux', name: 'UI/UX', icon: ImageIcon, color: 'bg-pink-500', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
                  { id: 'data-science', name: 'Data Science', icon: BarChartIcon, color: 'bg-orange-500', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' }
                ].map((track, index) => {
                  const IconComponent = track.icon;
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTrackSelect(track.id)}
                      className="bg-offblack border border-paperwhite/20 rounded-xl p-6 cursor-pointer hover:border-trueturquoise/50 hover:bg-paperwhite/5 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 ${track.bgColor} ${track.borderColor} border-2 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-8 w-8 text-paperwhite" />
                        </div>
                        <h3 className="text-lg font-heading text-paperwhite mb-2">{track.name}</h3>
                        <p className="text-teallight text-sm mb-4">
                          {trackStats[track.id] || 0} levels available
                        </p>
                        <div className="text-xs text-teallight group-hover:text-trueturquoise transition-colors">
                          Click to manage levels
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            // Level Management View
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <button
                        onClick={handleBackToTracks}
                        className="p-2 text-teallight hover:text-paperwhite transition-colors"
                        title="Back to Tracks"
                      >
                        <ChevronRightIcon className="h-5 w-5 rotate-180" />
                      </button>
                      <h1 className="text-3xl font-heading text-paperwhite">
                        {getTrackLabel(selectedTrack || '')} Curriculum Management
                      </h1>
                    </div>
                    <p className="text-teallight">
                      Manage training levels and content for {getTrackLabel(selectedTrack || '')} curriculum
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-teallight">
                      <span className="flex items-center gap-1">
                        <LayersIcon className="h-4 w-4" />
                        {filteredLevels.length} levels total
                      </span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4" />
                        Level {filteredLevels.length > 0 ? `1 - ${filteredLevels[filteredLevels.length - 1].order}` : '0'} progression
                      </span>
                    </div>
                    {lastUpdated && (
                      <p className="text-xs text-teallight mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                    {successMessage && (
                      <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                        {successMessage}
                      </div>
                    )}
                    {error && (
                      <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    {formError && (
                      <p className="text-xs text-red-400 mt-1">
                        Error: {formError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleAddLevel}
                    className="flex items-center gap-2 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Create Level
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="mb-6 p-4 bg-paperwhite/5 rounded-lg border border-paperwhite/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search levels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite placeholder-teallight focus:outline-none focus:border-trueturquoise text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">Difficulty</label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise text-sm"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => fetchLevels(selectedTrack || undefined)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-trueturquoise text-offblack px-3 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 text-sm"
                    >
                      <ArrowClockwiseIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Levels Grid */}
              {filteredLevels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-paperwhite/30 mb-4">
                    <FileTextIcon className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-heading text-paperwhite mb-2">No levels found</h3>
                  <p className="text-teallight mb-6">Create your first training level for this track</p>
                  <div className="space-y-2 text-sm text-teallight">
                    <p>Debug Info:</p>
                    <p>Selected track: {selectedTrack}</p>
                    <p>Total levels in database: {levels.length}</p>
                    <p>Filter difficulty: {filterDifficulty}</p>
                    <p>Search term: "{searchTerm}"</p>
                    <button 
                      onClick={() => fetchLevels(selectedTrack || undefined)}
                      className="mt-4 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors text-sm"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 relative">
                  {filteredLevels.map((level, index) => (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-offblack border border-paperwhite/20 rounded-xl p-6 hover:border-trueturquoise/50 hover:bg-paperwhite/5 transition-all duration-300 group relative"
                    >
                      {/* Level Order Indicator */}
                      <div className="absolute top-2 right-2 bg-paperwhite/10 text-paperwhite/60 text-xs px-2 py-1 rounded-full">
                        #{level.order}
                      </div>
                      {/* Header with level number, difficulty and track */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Level Number Badge */}
                          <div className="bg-trueturquoise text-offblack px-3 py-1 rounded-lg font-bold text-sm">
                            Level {level.order}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(level.difficulty)} text-white`}>
                            {level.difficulty}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTrackColor(level.careerTrack)} text-white`}>
                          {getTrackLabel(level.careerTrack)}
                        </span>
                      </div>

                      {/* Title and Description */}
                      <h3 className="text-lg font-heading text-paperwhite mb-2">
                        Level {level.order}: {level.title}
                      </h3>
                      <p className="text-teallight text-sm mb-4 line-clamp-2">{level.description}</p>

                      {/* Duration and Difficulty */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-teallight">
                          <ClockIcon className="h-3 w-3" />
                          <span>{level.estimatedHours}h estimated</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-teallight">
                          <span className={`px-2 py-1 rounded ${getDifficultyColor(level.difficulty)} text-white`}>
                            {level.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Content Counts */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs text-teallight">
                          <span className="flex items-center gap-1">
                            <BookOpenIcon className="h-3 w-3" />
                            {level.learn.length} learn
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardIcon className="h-3 w-3" />
                            {level.test.length} test
                          </span>
                          <span className="flex items-center gap-1">
                            <PlayIcon className="h-3 w-3" />
                            {level.exercise.length} exercise
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {level.isActive ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <CheckCircledIcon className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">
                              <Cross1Icon className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      {level.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {level.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-trueturquoise/20 text-trueturquoise text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {level.skills.length > 3 && (
                              <span className="px-2 py-1 bg-paperwhite/20 text-paperwhite text-xs rounded">
                                +{level.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Sections */}
                      <div className="space-y-3 mb-4">
                        {/* Learn Content */}
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-green-400 flex items-center gap-1">
                              <BookOpenIcon className="h-3 w-3" />
                              Learn Content ({level.learn.length})
                            </h4>
                            <button
                              onClick={() => {
                                const updatedLevels = levels.map(l => 
                                  l.id === level.id 
                                    ? { ...l, learnExpanded: !l.learnExpanded }
                                    : l
                                );
                                setLevels(updatedLevels);
                              }}
                              className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            >
                              {level.learnExpanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                            </button>
                          </div>
                          {level.learnExpanded && (
                            <div className="space-y-2">
                              {level.learn.length > 0 ? (
                                level.learn.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-green-500/5 rounded-lg p-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-paperwhite font-medium truncate">{item.title}</p>
                                      <p className="text-xs text-teallight truncate">{item.type}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleEditContent('learn', item, idx, level)}
                                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                        title="Edit"
                                      >
                                        <EditIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(level.id, 'learn', idx)}
                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-teallight text-center py-2">No learn content yet</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Test Content */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                              <ClipboardIcon className="h-3 w-3" />
                              Test Content ({level.test.length})
                            </h4>
                            <button
                              onClick={() => {
                                const updatedLevels = levels.map(l => 
                                  l.id === level.id 
                                    ? { ...l, testExpanded: !l.testExpanded }
                                    : l
                                );
                                setLevels(updatedLevels);
                              }}
                              className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              {level.testExpanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                            </button>
                          </div>
                          {level.testExpanded && (
                            <div className="space-y-2">
                              {level.test.length > 0 ? (
                                level.test.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-yellow-500/5 rounded-lg p-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-paperwhite font-medium truncate">{item.question}</p>
                                      <p className="text-xs text-teallight">{item.options.length} options</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleEditContent('test', item, idx, level)}
                                        className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                                        title="Edit"
                                      >
                                        <EditIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(level.id, 'test', idx)}
                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-teallight text-center py-2">No test content yet</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Exercise Content */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-purple-400 flex items-center gap-1">
                              <PlayIcon className="h-3 w-3" />
                              Exercise Content ({level.exercise.length})
                            </h4>
                            <button
                              onClick={() => {
                                const updatedLevels = levels.map(l => 
                                  l.id === level.id 
                                    ? { ...l, exerciseExpanded: !l.exerciseExpanded }
                                    : l
                                );
                                setLevels(updatedLevels);
                              }}
                              className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              {level.exerciseExpanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                            </button>
                          </div>
                          {level.exerciseExpanded && (
                            <div className="space-y-2">
                              {level.exercise.length > 0 ? (
                                level.exercise.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-purple-500/5 rounded-lg p-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-paperwhite font-medium truncate">{item.title}</p>
                                      <p className="text-xs text-teallight truncate">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleEditContent('exercise', item, idx, level)}
                                        className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                                        title="Edit"
                                      >
                                        <EditIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(level.id, 'exercise', idx)}
                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-teallight text-center py-2">No exercise content yet</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls */}
                      <div className="border-t border-paperwhite/10 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
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
                          
                          {/* Content Management Buttons */}
                          <div className="flex items-center gap-1">
                                                    <button
                          onClick={() => handleAddContent('learn', level)}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                          title="Add Learn Content"
                        >
                          +Learn
                        </button>
                        <button
                          onClick={() => handleAddContent('test', level)}
                          className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                          title="Add Test Content"
                        >
                          +Test
                        </button>
                        <button
                          onClick={() => handleAddContent('exercise', level)}
                          className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                          title="Add Exercise Content"
                        >
                          +Exercise
                        </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
                  <Cross1Icon className="h-5 w-5" />
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
                    <input
                      type="text"
                      value={getTrackLabel(levelForm.careerTrack)}
                      disabled
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite/50 cursor-not-allowed"
                    />
                    <p className="text-xs text-teallight mt-1">
                      Track is determined by your selection
                    </p>
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
                      value={levelForm.estimatedHours}
                      onChange={(e) => setLevelForm({ ...levelForm, estimatedHours: parseInt(e.target.value) || 1 })}
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

                {/* Read First Section */}
                <div className="border-t border-paperwhite/20 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-paperwhite">Read This First! Section</h3>
                      <p className="text-sm text-teallight">
                        This section appears to students before the learning materials to provide context and motivation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-sm text-trueturquoise hover:text-teallight transition-colors"
                    >
                      {showTemplates ? 'Hide' : 'Show'} Templates
                    </button>
                  </div>
                  
                  {/* Content Templates */}
                  {showTemplates && (
                    <div className="mb-6 p-4 bg-paperwhite/5 rounded-lg border border-paperwhite/10">
                      <h4 className="text-sm font-medium text-paperwhite mb-3">Quick Templates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => applyTemplate('web-development')}
                          className="text-left p-3 bg-paperwhite/5 rounded-lg border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                        >
                          <div className="text-xs font-medium text-trueturquoise">Web Development</div>
                          <div className="text-xs text-teallight">HTML, CSS, JavaScript basics</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate('ai-ml')}
                          className="text-left p-3 bg-paperwhite/5 rounded-lg border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                        >
                          <div className="text-xs font-medium text-trueturquoise">AI/ML</div>
                          <div className="text-xs text-teallight">Machine learning fundamentals</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate('ui-ux')}
                          className="text-left p-3 bg-paperwhite/5 rounded-lg border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                        >
                          <div className="text-xs font-medium text-trueturquoise">UI/UX Design</div>
                          <div className="text-xs text-teallight">User experience design</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate('data-science')}
                          className="text-left p-3 bg-paperwhite/5 rounded-lg border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                        >
                          <div className="text-xs font-medium text-trueturquoise">Data Science</div>
                          <div className="text-xs text-teallight">Data analysis and statistics</div>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-paperwhite mb-2">
                        Brief - What is this?
                      </label>
                      <textarea
                        value={levelForm.readFirst?.brief || ''}
                        onChange={(e) => setLevelForm({ 
                          ...levelForm, 
                          readFirst: { 
                            ...levelForm.readFirst, 
                            brief: e.target.value 
                          } 
                        })}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                        placeholder="Briefly explain what this topic/concept is..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-teallight">
                          Keep it concise and engaging
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.brief?.length || 0) > 450 ? 'text-red-400' : 'text-teallight'}`}>
                          {(levelForm.readFirst?.brief?.length || 0)}/500
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-paperwhite mb-2">
                        Why you need to learn this
                      </label>
                      <textarea
                        value={levelForm.readFirst?.whyLearn || ''}
                        onChange={(e) => setLevelForm({ 
                          ...levelForm, 
                          readFirst: { 
                            ...levelForm.readFirst, 
                            whyLearn: e.target.value 
                          } 
                        })}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                        placeholder="Explain why this knowledge is important and valuable..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-teallight">
                          Focus on career benefits and opportunities
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.whyLearn?.length || 0) > 450 ? 'text-red-400' : 'text-teallight'}`}>
                          {(levelForm.readFirst?.whyLearn?.length || 0)}/500
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-paperwhite mb-2">
                        Where it is used
                      </label>
                      <textarea
                        value={levelForm.readFirst?.whereUsed || ''}
                        onChange={(e) => setLevelForm({ 
                          ...levelForm, 
                          readFirst: { 
                            ...levelForm.readFirst, 
                            whereUsed: e.target.value 
                          } 
                        })}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                        placeholder="Describe real-world applications and use cases..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-teallight">
                          Provide specific examples and industries
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.whereUsed?.length || 0) > 450 ? 'text-red-400' : 'text-teallight'}`}>
                          {(levelForm.readFirst?.whereUsed?.length || 0)}/500
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-paperwhite mb-2">
                        Custom Example
                      </label>
                      <textarea
                        value={levelForm.readFirst?.customExample || ''}
                        onChange={(e) => setLevelForm({ 
                          ...levelForm, 
                          readFirst: { 
                            ...levelForm.readFirst, 
                            customExample: e.target.value 
                          } 
                        })}
                        rows={4}
                        maxLength={1000}
                        className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                        placeholder="Provide a practical example to illustrate the concept..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-teallight">
                          Use analogies or real-world scenarios
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.customExample?.length || 0) > 900 ? 'text-red-400' : 'text-teallight'}`}>
                          {(levelForm.readFirst?.customExample?.length || 0)}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="text-red-400 text-sm">{formError}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : (editingLevel ? 'Update' : 'Create')}
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
                  {editingContent ? `Edit ${editingContent.type}` : `Add Content`}
                </h2>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="p-2 text-teallight hover:text-paperwhite transition-colors"
                >
                  <Cross1Icon className="h-5 w-5" />
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



                {editingContent?.type === 'learn' && (
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Content *
                    </label>
                    <textarea
                      value={contentForm.content || ''}
                      onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                      placeholder="Enter content"
                    />
                  </div>
                )}

                {editingContent?.type === 'test' && (
                  <div>
                    <label className="block text-sm font-medium text-paperwhite mb-2">
                      Question *
                    </label>
                    <textarea
                      value={contentForm.question || ''}
                      onChange={(e) => setContentForm({ ...contentForm, question: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                      placeholder="Enter question"
                    />
                  </div>
                )}

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
                      placeholder="Option 1
Option 2
Option 3"
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
                      Description *
                    </label>
                    <textarea
                      value={contentForm.description || ''}
                      onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise resize-none"
                      placeholder="Enter description"
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

                <div>
                  <label className="block text-sm font-medium text-paperwhite mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={contentForm.order || 1}
                    onChange={(e) => setContentForm({ ...contentForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-black border border-paperwhite/20 rounded-lg text-paperwhite focus:outline-none focus:border-trueturquoise"
                    min="1"
                  />
                </div>

                {formError && (
                  <div className="text-red-400 text-sm">{formError}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
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