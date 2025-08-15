import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import apiService from '../services/api';
import syncnerLogo from '../assets/syncner-logo.png';
import { useAppDispatch } from '../redux/store';
import { clearCache } from '../redux/slices/curriculumSlice';

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
  id: string;
  type: 'video' | 'reading' | 'slide' | 'other';
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

interface TestItem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  order: number;
}

interface ExerciseItem {
  id: string;
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showTrackSelection, setShowTrackSelection] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async (track?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = track ? `/curriculum?careerTrack=${track}` : '/curriculum';
      const response = await apiService.get(url);
      
      // Handle different response formats
      let levelsData = [];
      if (response && response.data) {
        levelsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levelsData = response;
      }
      
      // First, find all syllabus items (main levels)
      const syllabusItems = levelsData.filter((item: any) => item.type === 'syllabus');
      
      // Create level map from syllabus items
      const levelMap = new Map();
      
      syllabusItems.forEach((syllabus: any) => {
        const levelKey = `${syllabus.order}-${syllabus.careerTrack}`;
        
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
      
      contentItems.forEach((item: any) => {
        const levelKey = `${item.order}-${item.careerTrack}`;
        const level = levelMap.get(levelKey);
        
        if (level) {
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
        }
      });
      
      // Convert map to array and sort by order
      const uniqueLevels = Array.from(levelMap.values()).sort((a: Level, b: Level) => a.order - b.order);
      
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
      case 'beginner': return {
        backgroundColor: 'var(--color-success)',
        color: 'var(--color-text-inverse)'
      };
      case 'intermediate': return {
        backgroundColor: 'var(--color-warning)',
        color: 'var(--color-text-inverse)'
      };
      case 'advanced': return {
        backgroundColor: 'var(--color-error)',
        color: 'var(--color-text-inverse)'
      };
      default: return {
        backgroundColor: 'var(--color-text-muted)',
        color: 'var(--color-text-inverse)'
      };
    }
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'full-stack': return {
        backgroundColor: 'var(--color-accent-primary)',
        color: 'var(--color-text-inverse)'
      };
      case 'ai-ml': return {
        backgroundColor: 'var(--color-accent-secondary)',
        color: 'var(--color-text-inverse)'
      };
      case 'ui-ux': return {
        backgroundColor: 'var(--color-accent-primary)',
        color: 'var(--color-text-inverse)'
      };
      case 'data-science': return {
        backgroundColor: 'var(--color-warning)',
        color: 'var(--color-text-inverse)'
      };
      default: return {
        backgroundColor: 'var(--color-text-muted)',
        color: 'var(--color-text-inverse)'
      };
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
    if (!id) {
      setError('Invalid level ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this level?')) {
      try {
        setError(null);
        // Find the level to get its title and career track
        const level = levels.find(l => l.id === id);
        
        if (level) {
          // Use bulk delete endpoint to remove all items for this level
          console.log(`Bulk deleting all items for track ${level.careerTrack} level order ${level.order}`);
          const bulkDeleteRes = await apiService.deleteLevelByTrackAndOrder(level.careerTrack, level.order);
          console.log('Bulk delete result:', bulkDeleteRes);
          console.log('All items deleted. Now clearing cache...');
        }
        await fetchLevels(selectedTrack || undefined);
        
        // Clear the student training cache to ensure changes are reflected
        try {
          // Clear the curriculum cache in Redux store
          dispatch(clearCache());
          
          // Also clear local levels state to force immediate UI update
          setLevels([]);
          
          // Call backend cache invalidation endpoint
          try {
            await apiService.invalidateCache();
            console.log('Backend cache invalidation successful');
          } catch (backendCacheError) {
            console.warn('Backend cache invalidation failed:', backendCacheError);
          }
          
          // Dispatch a global event to notify all components
          if (level) {
            window.dispatchEvent(new CustomEvent('curriculum-changed', { 
              detail: { 
                action: 'delete', 
                track: selectedTrack,
                levelOrder: level.order,
                levelId: level.id,
                timestamp: Date.now()
              } 
            }));
            
            // Also dispatch a more specific event for immediate refresh
            window.dispatchEvent(new CustomEvent('levels-refresh-required', { 
              detail: { 
                track: selectedTrack,
                reason: 'level_deleted',
                levelOrder: level.order,
                levelId: level.id,
                timestamp: Date.now()
              } 
            }));
          }
          
          console.log('Cache cleared, local state reset, and global events dispatched. Changes should be visible immediately.');
        } catch (cacheError) {
          console.warn('Could not clear cache:', cacheError);
        }
        
        showSuccessMessage('Level deleted successfully');
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
        const levelId = editingLevel.id;
        await apiService.put(`/curriculum/${levelId}`, {
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
        
        // Clear the student training cache to ensure changes are reflected
        dispatch(clearCache());
        
        // Also clear local levels state to force immediate UI update
        setLevels([]);
        
        // Dispatch a global event to notify all components
        window.dispatchEvent(new CustomEvent('curriculum-changed', { 
          detail: { 
            action: 'update', 
            track: selectedTrack,
            levelOrder: editingLevel.order 
          } 
        }));
        
        showSuccessMessage('Level updated successfully');
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
        
        // Clear the student training cache to ensure changes are reflected
        dispatch(clearCache());
        
        // Also clear local levels state to force immediate UI update
        setLevels([]);
        
        // Dispatch a global event to notify all components
        window.dispatchEvent(new CustomEvent('curriculum-changed', { 
          detail: { 
            action: 'create', 
            track: selectedTrack,
            levelOrder: levelForm.order || levels.length + 1
          } 
        }));
        
        showSuccessMessage('Level created successfully');
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
          const contentItems = (level as any)[type] || [];
          const itemToDelete = contentItems[index];
          
          if (itemToDelete?.id) {
            // Fast path: backend now supplies id on grouped content
            await apiService.delete(`/curriculum/${itemToDelete.id}`);
          } else {
            // Fallback: resolve by (careerTrack + order + type + index)
            const response = await apiService.get('/curriculum');
            const curriculumItems = response.data || [];
            const levelItems = curriculumItems
              .filter((item: any) => 
                item.careerTrack === level.careerTrack &&
                item.order === level.order &&
                item.type === type
              )
              .sort((a: any, b: any) => {
                const aKey = a.createdAt || a._id;
                const bKey = b.createdAt || b._id;
                return String(aKey).localeCompare(String(bKey));
              });
            const fallbackItem = levelItems[index];
            if (fallbackItem?.id) {
              await apiService.delete(`/curriculum/${fallbackItem.id}`);
            }
          }
        }
        await fetchLevels(selectedTrack || undefined);
        
        // Clear the student training cache to ensure changes are reflected
        dispatch(clearCache());
        
        showSuccessMessage('Content deleted successfully');
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
        // Resolve target item id: prefer id carried on level content, fallback to resolution by (track+order+type+index)
        let itemToUpdate: any = (editingLevel as any)[editingContent.type]?.[editingContent.index];
        if (!itemToUpdate?.id) {
          const response = await apiService.get('/curriculum');
          const curriculumItems = response.data || [];
          const levelItems = curriculumItems
            .filter((item: any) => 
              item.careerTrack === editingLevel.careerTrack &&
              item.order === editingLevel.order &&
              item.type === editingContent.type
            )
            .sort((a: any, b: any) => {
              const aKey = a.createdAt || a._id;
              const bKey = b.createdAt || b._id;
              return String(aKey).localeCompare(String(bKey));
            });
          itemToUpdate = levelItems[editingContent.index];
        }
        
        if (itemToUpdate?.id) {
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

          await apiService.put(`/curriculum/${itemToUpdate.id}`, updateData);
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
      
      // Clear the student training cache to ensure changes are reflected
      dispatch(clearCache());
      
      showSuccessMessage('Content saved successfully');
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

  const handleBackToTracks = () => {
    setSelectedTrack(null);
    setShowTrackSelection(true);
    setLevels([]);
  };

  // Utility function to show success message with auto-hide
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (loading && levels.length === 0) {
    return (
      <div 
        className="flex h-screen w-full"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <main className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <div className="text-center">
            <motion.img
              src={syncnerLogo}
              alt="Syncner Logo"
              className="w-12 h-12 mx-auto mb-4"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Loading curriculum levels...
            </p>
            {error && (
              <div className="mt-4 p-3 rounded-lg text-sm max-w-md mx-auto" style={{
                backgroundColor: 'var(--color-error-bg)',
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)'
              }}>
                <p className="font-medium">Error loading curriculum:</p>
                <p>{error}</p>
                <button 
                  onClick={() => fetchLevels(selectedTrack || undefined)}
                  className="mt-2 px-3 py-1 rounded text-xs transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'var(--color-text-inverse)' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  }}
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
    <div 
      className="flex h-screen w-full"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
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
                    <h1 
                      className="text-3xl font-heading mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Curriculum Management
                    </h1>
                    <p 
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Select a career track to manage its training levels and content
                    </p>
                    {successMessage && (
                      <div className="mt-2 p-2 rounded-lg text-sm" style={{
                        backgroundColor: 'var(--color-success-bg)',
                        borderColor: 'var(--color-success)',
                        color: 'var(--color-success)'
                      }}>
                        {successMessage}
                      </div>
                    )}
                    {error && (
                      <div className="mt-2 p-2 rounded-lg text-sm" style={{
                        backgroundColor: 'var(--color-error-bg)',
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error)'
                      }}>
                        {error}
                      </div>
                    )}
                    {formError && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                        Error: {formError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => fetchLevels()}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }
                    }}
                  >
                    {loading ? (
                      <motion.img
                        src={syncnerLogo}
                        alt="Syncner Logo"
                        className="h-4 w-4"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    ) : (
                      <ArrowClockwiseIcon className="h-4 w-4" />
                    )}
                    Refresh All
                  </button>
                </div>
              </div>

              {/* Track Selection Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { 
                    id: 'full-stack', 
                    name: 'Full Stack', 
                    icon: DesktopIcon, 
                    bgColor: 'var(--color-accent-primary)',
                    borderColor: 'var(--color-accent-primary)'
                  },
                  { 
                    id: 'ai-ml', 
                    name: 'AI/ML', 
                    icon: RocketIcon, 
                    bgColor: 'var(--color-accent-secondary)',
                    borderColor: 'var(--color-accent-secondary)'
                  },
                  { 
                    id: 'ui-ux', 
                    name: 'UI/UX', 
                    icon: ImageIcon, 
                    bgColor: 'var(--color-accent-primary)',
                    borderColor: 'var(--color-accent-primary)'
                  },
                  { 
                    id: 'data-science', 
                    name: 'Data Science', 
                    icon: BarChartIcon, 
                    bgColor: 'var(--color-warning)',
                    borderColor: 'var(--color-warning)'
                  }
                ].map((track, index) => {
                  const IconComponent = track.icon;
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTrackSelect(track.id)}
                      className="border rounded-xl p-6 cursor-pointer transition-all duration-300 group"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                      }}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 border-2 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{
                          backgroundColor: track.bgColor,
                          borderColor: track.borderColor
                        }}>
                          <IconComponent 
                            className="h-8 w-8"
                            style={{ color: 'var(--color-text-inverse)' }}
                          />
                        </div>
                        <h3 
                          className="text-lg font-heading mb-2"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {track.name}
                        </h3>
                        <p 
                          className="text-sm mb-4"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {trackStats[track.id] || 0} levels available
                        </p>
                        <div 
                          className="text-xs transition-colors"
                          style={{ color: 'var(--color-text-tertiary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-accent-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-text-tertiary)';
                          }}
                        >
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
                        className="p-2 transition-colors"
                        style={{ color: 'var(--color-text-tertiary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-tertiary)';
                        }}
                        title="Back to Tracks"
                      >
                        <ChevronRightIcon className="h-5 w-5 rotate-180" />
                      </button>
                      <h1 
                        className="text-3xl font-heading"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {getTrackLabel(selectedTrack || '')} Curriculum Management
                      </h1>
                    </div>
                    <p 
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Manage training levels and content for {getTrackLabel(selectedTrack || '')} curriculum
                    </p>
                    <div 
                      className="flex items-center gap-4 mt-2 text-sm"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      <span className="flex items-center gap-1">
                        <LayersIcon className="h-4 w-4" style={{ color: 'var(--color-accent-primary)' }} />
                        {filteredLevels.length} levels total
                      </span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4" style={{ color: 'var(--color-accent-primary)' }} />
                        Level {filteredLevels.length > 0 ? `1 - ${filteredLevels.length}` : '0'} progression
                      </span>
                    </div>
                    {lastUpdated && (
                      <p 
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                    {successMessage && (
                      <div className="mt-2 p-2 rounded-lg text-sm" style={{
                        backgroundColor: 'var(--color-success-bg)',
                        borderColor: 'var(--color-success)',
                        color: 'var(--color-success)'
                      }}>
                        {successMessage}
                      </div>
                    )}
                    {error && (
                      <div className="mt-2 p-2 rounded-lg text-sm" style={{
                        backgroundColor: 'var(--color-error-bg)',
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error)'
                      }}>
                        {error}
                      </div>
                    )}
                    {formError && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                        Error: {formError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleAddLevel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    }}
                  >
                    <PlusIcon className="h-5 w-5" style={{ color: 'var(--color-text-inverse)' }} />
                    Create Level
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div 
                className="mb-6 p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-tertiary-bg)',
                  borderColor: 'var(--color-border-subtle)'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search levels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Difficulty
                    </label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 text-sm"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)' 
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                        }
                      }}
                    >
                      {loading ? (
                        <motion.img
                          src={syncnerLogo}
                          alt="Syncner Logo"
                          className="h-4 w-4"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                          }}
                        />
                      ) : (
                        <ArrowClockwiseIcon className="h-4 w-4" />
                      )}
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Levels Grid */}
              {filteredLevels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    <FileTextIcon className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 
                    className="text-xl font-heading mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    No levels found
                  </h3>
                  <p 
                    className="mb-6"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Create your first training level for this track
                  </p>
                  <div 
                    className="space-y-2 text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <p>Debug Info:</p>
                    <p>Selected track: {selectedTrack}</p>
                    <p>Total levels in database: {levels.length}</p>
                    <p>Filter difficulty: {filterDifficulty}</p>
                    <p>Search term: "{searchTerm}"</p>
                    <button 
                      onClick={() => fetchLevels(selectedTrack || undefined)}
                      className="mt-4 px-4 py-2 rounded-lg transition-colors text-sm"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)' 
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }}
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="rounded-xl shadow-lg p-8"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div className="grid gap-6 grid-cols-1 relative">
                    {filteredLevels.map((level, index) => (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-xl p-6 transition-all duration-300 group relative"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                      }}
                    >
                      {/* Level Order Indicator */}
                      <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full" style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        color: 'var(--color-text-muted)'
                      }}>
                        #{level.order}
                      </div>
                      {/* Header with level number, difficulty and track */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Level Number Badge */}
                          <div 
                            className="px-3 py-1 rounded-lg font-bold text-sm"
                            style={{ 
                              backgroundColor: 'var(--color-accent-primary)',
                              color: 'var(--color-text-inverse)' 
                            }}
                          >
                            Level {level.order}
                          </div>
                          <div 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={getDifficultyColor(level.difficulty)}
                          >
                            {level.difficulty}
                          </div>
                        </div>
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium ${getTrackColor(level.careerTrack)}`}
                          style={{ color: 'var(--color-text-inverse)' }}
                        >
                          {getTrackLabel(level.careerTrack)}
                        </span>
                      </div>

                      {/* Title and Description */}
                      <h3 className="text-lg font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Level {level.order}: {level.title}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-tertiary)' }}>{level.description}</p>

                      {/* Duration and Difficulty */}
                      <div className="space-y-2 mb-4">
                        <div 
                          className="flex items-center gap-2 text-xs"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          <ClockIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} />
                          <span>{level.estimatedHours}h estimated</span>
                        </div>
                        <div 
                          className="flex items-center gap-2 text-xs"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          <span 
                            className="px-2 py-1 rounded"
                            style={getDifficultyColor(level.difficulty)}
                          >
                            {level.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Content Counts */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="flex items-center gap-1">
                            <BookOpenIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} />
                            {level.learn?.length || 0} learn items
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} />
                            {level.test?.length || 0} test items
                          </span>
                          <span className="flex items-center gap-1">
                            <PlayIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} />
                            {level.exercise?.length || 0} exercises
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {level.isActive ? (
                            <span className="flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                              <CheckCircledIcon className="h-3 w-3" style={{ color: 'var(--color-success)' }} />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                              <Cross1Icon className="h-3 w-3" style={{ color: 'var(--color-error)' }} />
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
                              <span key={idx} className="px-2 py-1 text-xs rounded" style={{
                                backgroundColor: 'var(--color-accent-tertiary)',
                                color: 'var(--color-accent-primary)'
                              }}>
                                {skill}
                              </span>
                            ))}
                            {level.skills.length > 3 && (
                              <span className="px-2 py-1 text-xs rounded" style={{
                                backgroundColor: 'var(--color-tertiary-bg)',
                                color: 'var(--color-text-primary)'
                              }}>
                                +{level.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Sections */}
                      <div className="space-y-3 mb-4">
                        {/* Learn Content */}
                        <div className="rounded-lg p-3" style={{
                          backgroundColor: 'var(--color-success-bg)',
                          borderColor: 'var(--color-success)',
                          border: '1px solid'
                        }}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                              <BookOpenIcon className="h-3 w-3" style={{ color: 'var(--color-success)' }} />
                              Learn Content ({level.learn?.length || 0})
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
                              className="p-1 transition-colors"
                              style={{ color: 'var(--color-success)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-success-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-success)';
                              }}
                            >
                              {level.learnExpanded ? <ChevronDownIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} /> : <ChevronRightIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} />}
                            </button>
                          </div>
                          {level.learnExpanded && (
                            <div className="space-y-2">
                              {level.learn?.length > 0 ? (
                                level.learn.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between rounded-lg p-2" style={{
                                    backgroundColor: 'var(--color-success-bg-subtle)'
                                  }}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                                      <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{item.type}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleEditContent('learn', item, idx, level)}
                                        className="p-1 transition-colors"
                                        title="Edit"
                                        style={{ color: 'var(--color-success)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-success-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-success)';
                                        }}
                                      >
                                        <EditIcon className="h-3 w-3" style={{ color: 'var(--color-success)' }} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(level.id, 'learn', idx)}
                                        className="p-1 transition-colors"
                                        title="Delete"
                                        style={{ color: 'var(--color-error)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error)';
                                        }}
                                      >
                                        <TrashIcon className="h-3 w-3" style={{ color: 'var(--color-error)' }} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-tertiary)' }}>No learn content yet</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Test Content */}
                        <div className="rounded-lg p-3" style={{
                          backgroundColor: 'var(--color-warning-bg)',
                          borderColor: 'var(--color-warning)',
                          border: '1px solid'
                        }}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                              <ClipboardIcon className="h-3 w-3" style={{ color: 'var(--color-warning)' }} />
                              Test Content ({level.test?.length || 0})
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
                              className="p-1 transition-colors"
                              style={{ color: 'var(--color-warning)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-warning-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-warning)';
                              }}
                            >
                              {level.testExpanded ? <ChevronDownIcon className="h-3 w-3" style={{ color: 'var(--color-warning)' }} /> : <ChevronRightIcon className="h-3 w-3" style={{ color: 'var(--color-warning)' }} />}
                            </button>
                          </div>
                          {level.testExpanded && (
                            <div className="space-y-2">
                              {level.test?.length > 0 ? (
                                level.test.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between rounded-lg p-2" style={{
                                    backgroundColor: 'var(--color-warning-bg-subtle)'
                                  }}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.question}</p>
                                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.options.length} options</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleEditContent('test', item, idx, level)}
                                        className="p-1 transition-colors"
                                        title="Edit"
                                        style={{ color: 'var(--color-warning)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-warning-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-warning)';
                                        }}
                                      >
                                        <EditIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(level.id, 'test', idx)}
                                        className="p-1 transition-colors"
                                        title="Delete"
                                        style={{ color: 'var(--color-error)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error)';
                                        }}
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-tertiary)' }}>No test content yet</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Exercise Content */}
                        <div className="rounded-lg p-3" style={{
                          backgroundColor: 'var(--color-accent-tertiary)',
                          borderColor: 'var(--color-accent-secondary)',
                          border: '1px solid'
                        }}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-accent-secondary)' }}>
                              <PlayIcon className="h-3 w-3" style={{ color: 'var(--color-accent-secondary)' }} />
                              Exercise Content ({level.exercise?.length || 0})
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
                              className="p-1 transition-colors"
                              style={{ color: 'var(--color-accent-secondary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-accent-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-accent-secondary)';
                              }}
                            >
                              {level.exerciseExpanded ? <ChevronDownIcon className="h-3 w-3" style={{ color: 'var(--color-accent-secondary)' }} /> : <ChevronRightIcon className="h-3 w-3" style={{ color: 'var(--color-accent-secondary)' }} />}
                            </button>
                          </div>
                          {level.exerciseExpanded && (
                            <div className="space-y-2">
                              {level.exercise?.length > 0 ? (
                                level.exercise.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between rounded-lg p-2" style={{
                                    backgroundColor: 'var(--color-accent-tertiary-subtle)'
                                  }}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                                      <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleEditContent('exercise', item, idx, level)}
                                        className="p-1 transition-colors"
                                        title="Edit"
                                        style={{ color: 'var(--color-accent-secondary)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-accent-primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-accent-secondary)';
                                        }}
                                      >
                                        <EditIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(level.id, 'exercise', idx)}
                                        className="p-1 transition-colors"
                                        title="Delete"
                                        style={{ color: 'var(--color-error)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error)';
                                        }}
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-tertiary)' }}>No exercise content yet</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls */}
                      <div className="border-t pt-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Level Reorder Controls */}
                            <button
                              onClick={async () => {
                                // Move level up (swap with previous order)
                                if (!selectedTrack) return;
                                const currentOrder = level.order;
                                const targetOrder = currentOrder - 1;
                                if (targetOrder < 1 || isReordering) return;
                                try {
                                  setIsReordering(true);
                                  const res = await apiService.get('/curriculum');
                                  const all = res.data || [];
                                  const currItems = all.filter((i: any) => i.careerTrack === selectedTrack && i.order === currentOrder);
                                  const targItems = all.filter((i: any) => i.careerTrack === selectedTrack && i.order === targetOrder);
                                  if (currItems.length === 0 || targItems.length === 0) return;
                                  const items = [
                                    ...currItems.map((i: any) => ({ id: i.id, order: targetOrder })),
                                    ...targItems.map((i: any) => ({ id: i.id, order: currentOrder })),
                                  ];
                                  await apiService.put('/curriculum/bulk-order', { items });
                                  dispatch(clearCache());
                                  window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { track: selectedTrack, action: 'reorder', timestamp: Date.now() } }));
                                  window.dispatchEvent(new CustomEvent('levels-refresh-required', { detail: { track: selectedTrack, reason: 'reorder', timestamp: Date.now() } }));
                                  await apiService.invalidateCache();
                                  await fetchLevels(selectedTrack || undefined);
                                } catch (e) {
                                  console.error('Reorder up failed:', e);
                                } finally {
                                  setIsReordering(false);
                                }
                              }}
                              disabled={isReordering || level.order === 1}
                              className="p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ color: 'var(--color-text-tertiary)' }}
                              title="Move Level Up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={async () => {
                                // Move level down (swap with next order)
                                if (!selectedTrack) return;
                                const currentOrder = level.order;
                                const targetOrder = currentOrder + 1;
                                if (isReordering) return;
                                try {
                                  setIsReordering(true);
                                  const res = await apiService.get('/curriculum');
                                  const all = res.data || [];
                                  const currItems = all.filter((i: any) => i.careerTrack === selectedTrack && i.order === currentOrder);
                                  const targItems = all.filter((i: any) => i.careerTrack === selectedTrack && i.order === targetOrder);
                                  if (currItems.length === 0 || targItems.length === 0) return;
                                  const items = [
                                    ...currItems.map((i: any) => ({ id: i.id, order: targetOrder })),
                                    ...targItems.map((i: any) => ({ id: i.id, order: currentOrder })),
                                  ];
                                  await apiService.put('/curriculum/bulk-order', { items });
                                  dispatch(clearCache());
                                  window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { track: selectedTrack, action: 'reorder', timestamp: Date.now() } }));
                                  window.dispatchEvent(new CustomEvent('levels-refresh-required', { detail: { track: selectedTrack, reason: 'reorder', timestamp: Date.now() } }));
                                  await apiService.invalidateCache();
                                  await fetchLevels(selectedTrack || undefined);
                                } catch (e) {
                                  console.error('Reorder down failed:', e);
                                } finally {
                                  setIsReordering(false);
                                }
                              }}
                              disabled={isReordering /* last-level disable handled by lack of targItems */}
                              className="p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ color: 'var(--color-text-tertiary)' }}
                              title="Move Level Down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => {
                                if (!level.id) {
                                  setError('Level ID not found. Please refresh the page.');
                                  return;
                                }
                                handleEditLevel(level);
                              }}
                              className="p-2 transition-colors"
                              style={{ color: 'var(--color-text-tertiary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-accent-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-tertiary)';
                              }}
                              title="Edit Level"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (!level.id) {
                                  setError('Level ID not found. Please refresh the page.');
                                  return;
                                }
                                handleDeleteLevel(level.id);
                              }}
                              className="p-2 transition-colors"
                              style={{ color: 'var(--color-text-tertiary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-error)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-tertiary)';
                              }}
                              title="Delete Level"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Content Management Buttons */}
                          <div className="flex items-center gap-1">
                                                    <button
                          onClick={() => handleAddContent('learn', level)}
                          className="px-2 py-1 text-xs rounded transition-colors"
                          style={{ 
                            backgroundColor: 'var(--color-success)',
                            color: 'var(--color-text-inverse)' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-success-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-success)';
                          }}
                          title="Add Learn Content"
                        >
                          +Learn
                        </button>
                        <button
                          onClick={() => handleAddContent('test', level)}
                          className="px-2 py-1 text-xs rounded transition-colors"
                          style={{ 
                            backgroundColor: 'var(--color-warning)',
                            color: 'var(--color-text-inverse)' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-warning-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-warning)';
                          }}
                          title="Add Test Content"
                        >
                          +Test
                        </button>
                        <button
                          onClick={() => handleAddContent('exercise', level)}
                          className="px-2 py-1 text-xs rounded transition-colors"
                          style={{ 
                            backgroundColor: 'var(--color-accent-secondary)',
                            color: 'var(--color-text-inverse)' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                          }}
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
              className="border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-lg)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {editingLevel ? 'Edit Level' : 'Create Level'}
                </h2>
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="p-2 transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                  }}
                >
                  <Cross1Icon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLevelSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={levelForm.title}
                    onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter level title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Description *
                  </label>
                  <textarea
                    value={levelForm.description}
                    onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter level description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Difficulty *
                    </label>
                    <select
                      value={levelForm.difficulty}
                      onChange={(e) => setLevelForm({ ...levelForm, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Career Track *
                    </label>
                    <input
                      type="text"
                      value={getTrackLabel(levelForm.careerTrack)}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Track is determined by your selection
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Duration
                    </label>
                    <input
                      type="text"
                      value={levelForm.duration}
                      onChange={(e) => setLevelForm({ ...levelForm, duration: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="e.g., 2-3 weeks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={levelForm.estimatedHours}
                      onChange={(e) => setLevelForm({ ...levelForm, estimatedHours: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Skills (comma-separated)
                  </label>
                                      <input
                      type="text"
                      value={levelForm.skills.join(', ')}
                      onChange={(e) => setLevelForm({ ...levelForm, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="e.g., HTML, CSS, JavaScript"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Prerequisites (comma-separated)
                  </label>
                                      <input
                      type="text"
                      value={levelForm.prerequisites.join(', ')}
                      onChange={(e) => setLevelForm({ ...levelForm, prerequisites: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="e.g., Basic programming knowledge"
                    />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={levelForm.isActive}
                    onChange={(e) => setLevelForm({ ...levelForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                    style={{
                      color: 'var(--color-accent-primary)',
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                  <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Active
                  </label>
                </div>

                {/* Read First Section */}
                <div className="border-t pt-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Read This First! Section</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                      This section appears to students before the learning materials to provide context and motivation.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                        style={{
                          backgroundColor: 'var(--color-secondary-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                          e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Briefly explain what this topic/concept is..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Keep it concise and engaging
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.brief?.length || 0) > 450 ? 'text-red-400' : ''}`} style={{ 
                          color: (levelForm.readFirst?.brief?.length || 0) > 450 ? 'var(--color-error)' : 'var(--color-text-tertiary)' 
                        }}>
                          {(levelForm.readFirst?.brief?.length || 0)}/500
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                        style={{
                          backgroundColor: 'var(--color-secondary-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                          e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Explain why this knowledge is important and valuable..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Focus on career benefits and opportunities
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.whyLearn?.length || 0) > 450 ? 'text-red-400' : ''}`} style={{ 
                          color: (levelForm.readFirst?.whyLearn?.length || 0) > 450 ? 'var(--color-error)' : 'var(--color-text-tertiary)' 
                        }}>
                          {(levelForm.readFirst?.whyLearn?.length || 0)}/500
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                        style={{
                          backgroundColor: 'var(--color-secondary-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                          e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Describe real-world applications and use cases..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Provide specific examples and industries
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.whereUsed?.length || 0) > 450 ? 'text-red-400' : ''}`} style={{ 
                          color: (levelForm.readFirst?.whereUsed?.length || 0) > 450 ? 'var(--color-error)' : 'var(--color-text-tertiary)' 
                        }}>
                          {(levelForm.readFirst?.whereUsed?.length || 0)}/500
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                        style={{
                          backgroundColor: 'var(--color-secondary-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                          e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Provide a practical example to illustrate the concept..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Use analogies or real-world scenarios
                        </span>
                        <span className={`text-xs ${(levelForm.readFirst?.customExample?.length || 0) > 900 ? 'text-red-400' : ''}`} style={{ 
                          color: (levelForm.readFirst?.customExample?.length || 0) > 900 ? 'var(--color-error)' : 'var(--color-text-tertiary)' 
                        }}>
                          {(levelForm.readFirst?.customExample?.length || 0)}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="text-sm" style={{ color: 'var(--color-error)' }}>{formError}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }
                    }}
                  >
                    {isSubmitting ? 'Saving...' : (editingLevel ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLevelModal(false)}
                    className="px-4 py-2 border rounded-lg transition-colors"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-tertiary-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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
              className="border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-lg)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-heading"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {editingContent ? `Edit ${editingContent.type}` : `Add Content`}
                </h2>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="p-2 transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                  }}
                >
                  <Cross1Icon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleContentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={contentForm.title || ''}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter title"
                  />
                </div>

                {editingContent?.type === 'learn' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Type
                    </label>
                    <select
                      value={contentForm.type || 'reading'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContentForm({ ...contentForm, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Content *
                    </label>
                    <textarea
                      value={contentForm.content || ''}
                      onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter content"
                    />
                  </div>
                )}

                {editingContent?.type === 'test' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Question *
                    </label>
                    <textarea
                      value={contentForm.question || ''}
                      onChange={(e) => setContentForm({ ...contentForm, question: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter question"
                    />
                  </div>
                )}

                {editingContent?.type === 'test' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Options (one per line)
                    </label>
                    <textarea
                      value={contentForm.options?.join('\n') || ''}
                      onChange={(e) => setContentForm({ ...contentForm, options: e.target.value.split('\n').filter(s => s.trim()) })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Option 1
Option 2
Option 3"
                    />
                  </div>
                )}

                {editingContent?.type === 'test' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={contentForm.answer || ''}
                      onChange={(e) => setContentForm({ ...contentForm, answer: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter correct answer"
                    />
                  </div>
                )}

                {editingContent?.type === 'exercise' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Description *
                    </label>
                    <textarea
                      value={contentForm.description || ''}
                      onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter description"
                    />
                  </div>
                )}

                {editingContent?.type === 'exercise' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Resources (one per line)
                    </label>
                    <textarea
                      value={contentForm.resources?.join('\n') || ''}
                      onChange={(e) => setContentForm({ ...contentForm, resources: e.target.value.split('\n').filter(s => s.trim()) })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Resource 1&#10;Resource 2&#10;Resource 3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Order
                  </label>
                  <input
                    type="number"
                    value={contentForm.order || 1}
                    onChange={(e) => setContentForm({ ...contentForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    min="1"
                  />
                </div>

                {formError && (
                  <div className="text-sm" style={{ color: 'var(--color-error)' }}>{formError}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)' 
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }
                    }}
                  >
                    {isSubmitting ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContentModal(false)}
                    className="px-4 py-2 border rounded-lg transition-colors"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-tertiary-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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