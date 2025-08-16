import React, { useState, useEffect, useRef } from 'react';
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
  BarChartIcon,
  ExternalLinkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon
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
  title: string;
  content: string;
  externalLink?: string;
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

interface ContentForm {
  title: string;
  order: number;
  content: string;
  externalLink?: string; // Replace videoUrl with externalLink for learn content
  question: string;
  options: string[];
  answer: string;
  description: string;
  resources: string[];
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
  
  // Default content form structure
  const defaultContentForm = {
    title: '',
    order: 1,
    content: '',
    externalLink: '',
    question: '',
    options: [],
    answer: '',
    description: '',
    resources: []
  };
  
  const [contentForm, setContentForm] = useState<any>(defaultContentForm);
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [showTrackSelection, setShowTrackSelection] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const [isDeletingLevel, setIsDeletingLevel] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [pendingExpand, setPendingExpand] = useState<{ levelId: string | null; section?: 'learn' | 'test' | 'exercise' }>({ levelId: null });
  const [isRefetching, setIsRefetching] = useState(false);
  const [refetchMessage, setRefetchMessage] = useState<string | null>(null);
  const [trackCounts, setTrackCounts] = useState<Record<string, number>>({});

  // Normalize track ids coming from UI to API format
  const normalizeTrack = (track?: string | null) => {
    if (!track) return '';
    const map: Record<string, string> = {
      'fullstack': 'full-stack',
      'full-stack': 'full-stack',
      'Full Stack': 'full-stack',
      'aiml': 'ai-ml',
      'ai-ml': 'ai-ml',
      'AI/ML': 'ai-ml',
      'uiux': 'ui-ux',
      'ui-ux': 'ui-ux',
      'UI/UX': 'ui-ux',
      'datascience': 'data-science',
      'data-science': 'data-science',
      'Data Science': 'data-science'
    };
    return map[track] || track;
  };

  // On mount, fetch only counts per track (not full levels) to populate track cards
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await apiService.get('/curriculum?grouped=true');
        if (res.success && Array.isArray(res.data)) {
          const counts: Record<string, number> = {};
          res.data.forEach((lvl: any) => {
            const key = normalizeTrack(lvl.careerTrack);
            counts[key] = (counts[key] || 0) + 1;
          });
          setTrackCounts(counts);
        }
      } catch (e) {
        console.warn('Failed to fetch track counts', e);
      }
    };
    fetchCounts();
  }, []);

  const fetchLevels = async (track?: string) => {
    try {
      setLoading(true);
      const chosenTrackRaw = track ?? selectedTrack ?? '';
      const chosenTrack = normalizeTrack(chosenTrackRaw);
      // If no track selected, don't fetch to avoid initial flash of other tracks
      if (!chosenTrack) {
        setLevels([]);
        setLoading(false);
        return;
      }
      const url = `/curriculum?grouped=true${chosenTrack ? `&careerTrack=${chosenTrack}` : ''}`;
      const response = await apiService.get(url);
      
      if (response.success) {
        // The backend now returns grouped levels structure, same as training endpoint
        let levelsData = response.data || [];
        // Extra safety: filter client-side if backend ignores careerTrack
        if (chosenTrack) {
          levelsData = (levelsData || []).filter((lvl: any) => lvl.careerTrack === chosenTrack);
        }
        
        // Transform the data to match the expected format
        const transformedLevels = levelsData.map((level: any) => ({
          ...level,
          learnExpanded: false,
          testExpanded: false,
          exerciseExpanded: false
        }));
        
        setLevels(transformedLevels);
        console.log('Fetched levels:', transformedLevels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
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
      careerTrack: normalizeTrack(selectedTrack) || 'full-stack',
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
        setIsDeletingLevel(true);
        setDeleteMessage('Deleting level...');
        // Find the level to get its title and career track
        const level = levels.find(l => l.id === id);
        
        if (level) {
          // Use bulk delete endpoint to remove all items for this level
          console.log(`Bulk deleting all items for track ${level.careerTrack} level order ${level.order}`);
          const bulkDeleteRes = await apiService.deleteLevelByTrackAndOrder(level.careerTrack, level.order);
          console.log('Bulk delete result:', bulkDeleteRes);
          console.log('All items deleted. Now clearing cache...');

          // Clear caches first
          dispatch(clearCache());
          try {
            await apiService.invalidateCache();
            console.log('Backend cache invalidation successful');
          } catch (backendCacheError) {
            console.warn('Backend cache invalidation failed:', backendCacheError);
          }

          // Notify all components with the correct track
          const track = level.careerTrack;
          window.dispatchEvent(new CustomEvent('curriculum-changed', { 
            detail: { 
              action: 'delete', 
              track,
              levelOrder: level.order,
              levelId: level.id,
              timestamp: Date.now()
            } 
          }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required', { 
            detail: { 
              track,
              reason: 'level_deleted',
              levelOrder: level.order,
              levelId: level.id,
              timestamp: Date.now()
            } 
          }));

          // Finally, refetch levels for this track so the list repopulates immediately
          await fetchLevels(track);
        }
        
        showSuccessMessage('Level deleted successfully');
      } catch (error: any) {
        console.error('Error deleting level:', error);
        const errorMessage = error.message || 'Failed to delete level';
        setError(errorMessage);
      } finally {
        setIsDeletingLevel(false);
        setDeleteMessage(null);
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
        await fetchLevels(editingLevel.careerTrack);
        
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
    // Ensure careerTrack is normalized for new content creation
    setEditingLevel({ ...level, careerTrack: normalizeTrack(level.careerTrack) } as Level);
    // Reset to default content form structure
    setContentForm({ ...defaultContentForm });
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
            const response = await apiService.get('/curriculum?grouped=false');
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
        
        // Invalidate caches and notify app to refresh levels everywhere
        try {
          await apiService.invalidateCache();
        } catch (backendCacheError) {
          console.warn('Backend cache invalidation failed:', backendCacheError);
        }
        if (level) {
          window.dispatchEvent(new CustomEvent('curriculum-changed', {
            detail: {
              action: 'content_deleted',
              track: level.careerTrack,
              levelOrder: level.order,
              contentType: type,
              timestamp: Date.now()
            }
          }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required', {
            detail: {
              track: level.careerTrack,
              reason: 'content_deleted',
              levelOrder: level.order,
              contentType: type,
              timestamp: Date.now()
            }
          }));
        }

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
    console.log('Form submitted! Event:', e);
    console.log('Form data:', contentForm);
    
    if (!contentForm.title) {
      console.log('Title validation failed - no title');
      setFormError('Title is required');
      return;
    }

    // Validate content based on type
    const contentType = editingContent?.type || 'learn';
    console.log('Content type determined:', contentType);
    console.log('Content form:', contentForm);
    
    if (contentType === 'learn' && !contentForm.content) {
      console.log('Learn content validation failed - no content');
      setFormError('Content is required for learn items');
      return;
    } else if (contentType === 'test' && !contentForm.question) {
      console.log('Test validation failed - no question');
      setFormError('Question is required for test items');
      return;
    } else if (contentType === 'exercise' && !contentForm.description) {
      console.log('Exercise validation failed - no description');
      setFormError('Description is required for exercise items');
      return;
    }

    console.log('All validations passed, proceeding with submission');

    setIsSubmitting(true);
    setError(null);
    try {
      console.log('handleContentSubmit - editingContent:', editingContent);
      console.log('handleContentSubmit - editingLevel:', editingLevel);
      
      if (editingContent && editingContent.index >= 0 && editingLevel) {
        // Update existing content item
        console.log('Going to UPDATE path');
        // Find the specific content item to update
        // Resolve target item id: prefer id carried on level content, fallback to resolution by (track+order+type+index)
        let itemToUpdate: any = (editingLevel as any)[editingContent.type]?.[editingContent.index];
        if (!itemToUpdate?.id) {
          const response = await apiService.get('/curriculum?grouped=false');
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
            updateData.externalLink = contentForm.externalLink;
            // Ensure description meets minimum length requirement (10 chars)
            updateData.description = contentForm.title.length >= 10 ? contentForm.title : 
              `${contentForm.title} - ${contentForm.content.substring(0, Math.max(0, 10 - contentForm.title.length))}`;
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
            // Ensure description meets minimum length requirement (10 chars)
            updateData.description = contentForm.title.length >= 10 ? contentForm.title : 
              `${contentForm.title} - ${contentForm.question.substring(0, Math.max(0, 10 - contentForm.title.length))}`;
          } else if (contentType === 'exercise') {
            updateData.content = contentForm.description; // Map description to content
            updateData.resources = contentForm.resources || [];
            // Ensure description meets minimum length requirement (10 chars)
            updateData.description = contentForm.title.length >= 10 ? contentForm.title : 
              `${contentForm.title} - ${contentForm.description.substring(0, Math.max(0, 10 - contentForm.title.length))}`;
          }

          await apiService.put(`/curriculum/${itemToUpdate.id}`, updateData);

          // Optimistic UI update: reflect edited content immediately
          setLevels((prev: any[]) => prev.map((lvl: any) => {
            if (lvl.id !== editingLevel.id) return lvl;
            const updated = { ...lvl };
            if (contentType === 'learn') {
              const arr = [...(updated.learn || [])];
              arr[editingContent.index] = {
                ...(arr[editingContent.index] || {}),
                id: itemToUpdate.id,
                title: contentForm.title,
                content: contentForm.content,
                externalLink: contentForm.externalLink || '',
                order: updated.order,
              };
              updated.learn = arr;
            } else if (contentType === 'test') {
              const arr = [...(updated.test || [])];
              arr[editingContent.index] = {
                ...(arr[editingContent.index] || {}),
                id: itemToUpdate.id,
                question: contentForm.question,
                options: contentForm.options || [],
                answer: contentForm.answer || '',
                order: updated.order,
              };
              updated.test = arr;
            } else if (contentType === 'exercise') {
              const arr = [...(updated.exercise || [])];
              arr[editingContent.index] = {
                ...(arr[editingContent.index] || {}),
                id: itemToUpdate.id,
                title: contentForm.title,
                description: contentForm.description,
                resources: contentForm.resources || [],
                order: updated.order,
              };
              updated.exercise = arr;
            }
            return updated;
          }));

          // Invalidate caches and notify app to refresh levels everywhere
          try {
            await apiService.invalidateCache();
          } catch (backendCacheError) {
            console.warn('Backend cache invalidation failed:', backendCacheError);
          }
          window.dispatchEvent(new CustomEvent('curriculum-changed', {
            detail: {
              action: 'content_updated',
              track: editingLevel.careerTrack,
              levelOrder: editingLevel.order,
              contentType,
              timestamp: Date.now()
            }
          }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required', {
            detail: {
              track: editingLevel.careerTrack,
              reason: 'content_updated',
              levelOrder: editingLevel.order,
              contentType,
              timestamp: Date.now()
            }
          }));
        }
      } else if (editingLevel) {
        // Create new content item
        console.log('Going to CREATE path');
        const newContentData: any = {
          title: contentForm.title,
          type: contentType === 'learn' ? 'learn' : contentType,
          careerTrack: editingLevel.careerTrack,
          difficulty: editingLevel.difficulty,
          order: editingLevel.order, // Use the level's order
          isActive: true,
          prerequisites: [editingLevel.title], // Link to the level
          tags: [contentType, editingLevel.careerTrack]
        };

        if (contentType === 'learn') {
          newContentData.content = contentForm.content;
          newContentData.externalLink = contentForm.externalLink;
          // Ensure description meets minimum length requirement (10 chars)
          newContentData.description = contentForm.title.length >= 10 ? contentForm.title : 
            `${contentForm.title} - ${contentForm.content.substring(0, Math.max(0, 10 - contentForm.title.length))}`;
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
          // Ensure description meets minimum length requirement (10 chars)
          newContentData.description = contentForm.title.length >= 10 ? contentForm.title : 
            `${contentForm.title} - ${contentForm.question.substring(0, Math.max(0, 10 - contentForm.title.length))}`;
        } else if (contentType === 'exercise') {
          newContentData.content = contentForm.description; // Map description to content
          newContentData.resources = contentForm.resources || [];
          // Ensure description meets minimum length requirement (10 chars)
          newContentData.description = contentForm.title.length >= 10 ? contentForm.title : 
            `${contentForm.title} - ${contentForm.description.substring(0, Math.max(0, 10 - contentForm.title.length))}`;
        }

        // Fix: Use the correct API service method
        console.log('Creating curriculum item with data:', newContentData);
        const createRes = await apiService.createCurriculumItem(newContentData);
        console.log('Create response:', createRes);

        // Optimistic UI update: append new content immediately
        const newId = createRes?.data?.id || createRes?.id;
        
        setLevels((prev: any[]) => prev.map((lvl: any) => {
          if (lvl.id !== editingLevel.id) return lvl;
          const updated = { ...lvl };
          if (contentType === 'learn') {
            const newLearnItem = {
              id: newId,
              type: 'learn',
              title: contentForm.title,
              content: contentForm.content,
              externalLink: contentForm.externalLink || '',
              order: updated.order,
            };
            updated.learn = [
              ...(updated.learn || []),
              newLearnItem
            ];
            updated.learnExpanded = true;
          } else if (contentType === 'test') {
            updated.test = [
              ...(updated.test || []),
              {
                id: newId,
                question: contentForm.question,
                options: contentForm.options || [],
                answer: contentForm.answer || '',
                order: updated.order,
              }
            ];
            updated.testExpanded = true;
          } else if (contentType === 'exercise') {
            updated.exercise = [
              ...(updated.exercise || []),
              {
                id: newId,
                title: contentForm.title,
                description: contentForm.description,
                resources: contentForm.resources || [],
                order: updated.order,
              }
            ];
            updated.exerciseExpanded = true;
          }
          return updated;
        }));

        // Remember to auto-expand and scroll after refetch as well
        setPendingExpand({ levelId: editingLevel.id, section: contentType });

        // Invalidate caches and notify app to refresh levels everywhere
        try {
          await apiService.invalidateCache();
        } catch (backendCacheError) {
          console.warn('Backend cache invalidation failed:', backendCacheError);
        }
        window.dispatchEvent(new CustomEvent('curriculum-changed', {
          detail: {
            action: 'content_created',
            track: editingLevel.careerTrack,
            levelOrder: editingLevel.order,
            contentType,
            timestamp: Date.now()
          }
        }));
        window.dispatchEvent(new CustomEvent('levels-refresh-required', {
          detail: {
            track: editingLevel.careerTrack,
            reason: 'content_created',
            levelOrder: editingLevel.order,
            contentType,
            timestamp: Date.now()
          }
        }));
      }
      
      setShowContentModal(false);
      setContentForm({});
      setFormError('');
      // Small delay to allow DB write to be fully visible, then refetch targeted track
      setIsRefetching(true);
      setRefetchMessage('Finalizing changes...');
      await new Promise(res => setTimeout(res, 250));
      await fetchLevels(editingLevel?.careerTrack || selectedTrack || undefined);
      setIsRefetching(false);
      setRefetchMessage(null);
      
      // Clear the student training cache to ensure changes are reflected
      dispatch(clearCache());
      
      showSuccessMessage('Content saved successfully');
    } catch (error: any) {
      console.error('Error saving content:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      const errorMessage = error.message || 'Failed to save content';
      setFormError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use pre-fetched counts for track cards
  const trackStats = trackCounts;

  // Debug logging for content modal
  useEffect(() => {
    if (showContentModal) {
      console.log('Content modal opened:', {
        editingContent,
        editingLevel,
        contentForm,
        showContentModal
      });
    }
  }, [showContentModal, editingContent, editingLevel, contentForm]);

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
    // Clear existing levels immediately to avoid showing previous track while loading
    setLevels([]);
    setLoading(true);
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

  // Reset content form to default state
  const resetContentForm = () => {
    setContentForm({ ...defaultContentForm });
    setEditingContent(null);
    setEditingLevel(null);
    setFormError('');
  };

  // Close content modal and reset form
  const handleCloseContentModal = () => {
    setShowContentModal(false);
    resetContentForm();
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full">
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    {filteredLevels.map((level, index) => {
                      console.log('Level data:', { 
                        id: level.id, 
                        title: level.title, 
                        order: level.order, 
                        careerTrack: level.careerTrack
                      });
                      
                      return (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                                             {/* Level Header */}
                       <div 
                         className="p-4 border-b"
                         style={{ borderColor: 'var(--color-border-subtle)' }}
                       >
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-start gap-4 flex-1">
                             {/* Level Number Badge */}
                             <div 
                               className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                               style={{
                                 background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                                 color: 'var(--color-text-inverse)'
                               }}
                             >
                               <span className="text-2xl font-bold">{level.order}</span>
                             </div>
                             
                             {/* Level Info */}
                             <div className="flex-1 min-w-0">
                               <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                 {level.title}
                               </h3>
                               <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                                 {level.description}
                               </p>
                               
                               {/* Badges Row */}
                               <div className="flex items-center gap-3 mb-4">
                                 <span 
                                   className="px-3 py-1 rounded-lg text-xs font-medium"
                                   style={getDifficultyColor(level.difficulty)}
                                 >
                                   {level.difficulty}
                                 </span>
                                 <span 
                                   className={`px-3 py-1 rounded-lg text-xs font-medium ${getTrackColor(level.careerTrack)}`}
                                   style={{ color: 'var(--color-text-inverse)' }}
                                 >
                                   {getTrackLabel(level.careerTrack)}
                                 </span>
                                 <span 
                                   className="px-3 py-1 rounded-lg text-xs font-medium"
                                   style={{
                                     backgroundColor: 'var(--color-accent-tertiary)',
                                     color: 'var(--color-accent-primary)'
                                   }}
                                 >
                                   {level.estimatedHours}h estimated
                                 </span>
                               </div>
                             </div>
                           </div>
                           
                           {/* Status Badge */}
                           <div className="flex items-center gap-2 flex-shrink-0">
                             {level.isActive ? (
                                                            <span 
                               className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                               style={{
                                 backgroundColor: 'var(--color-success)',
                                 color: 'var(--color-text-inverse)'
                               }}
                             >
                               <CheckCircledIcon className="h-4 w-4" />
                               Active
                             </span>
                             ) : (
                                                            <span 
                               className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                               style={{
                                 backgroundColor: 'var(--color-error)',
                                 color: 'var(--color-text-inverse)'
                               }}
                             >
                               <Cross1Icon className="h-4 w-4" />
                               Inactive
                             </span>
                             )}
                           </div>
                         </div>
                        
                                                 {/* Skills */}
                         {level.skills && level.skills.length > 0 && (
                           <div className="mb-4">
                             <div className="flex flex-wrap gap-2">
                               {level.skills.slice(0, 8).map((skill, idx) => (
                                 <span 
                                   key={idx} 
                                   className="px-3 py-1 rounded-lg text-xs font-medium shadow-sm"
                                   style={{
                                     backgroundColor: 'var(--color-accent-primary)',
                                     color: 'var(--color-text-inverse)'
                                   }}
                                 >
                                   {skill}
                                 </span>
                               ))}
                               {level.skills.length > 8 && (
                                 <span 
                                   className="px-3 py-1 rounded-lg text-xs font-medium shadow-sm"
                                   style={{
                                     backgroundColor: 'var(--color-tertiary-bg)',
                                     color: 'var(--color-text-secondary)'
                                   }}
                                 >
                                   +{level.skills.length - 8} more
                                 </span>
                               )}
                             </div>
                           </div>
                         )}
                        
                                                 {/* Content Summary */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div 
                            className="p-4 rounded-xl text-center shadow-md"
                            style={{
                              backgroundColor: 'var(--color-success-bg)',
                              border: '1px solid var(--color-success)'
                            }}
                          >
                            <div className="flex items-center justify-center mb-2">
                              <BookOpenIcon className="h-6 w-6" style={{ color: 'var(--color-success)' }} />
                            </div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                              {level.learn?.length || 0}
                            </div>
                            <div className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                              Learning Resources
                            </div>
                          </div>
                          
                          <div 
                            className="p-4 rounded-xl text-center shadow-md"
                            style={{
                              backgroundColor: 'var(--color-warning-bg)',
                              border: '1px solid var(--color-warning)'
                            }}
                          >
                            <div className="flex items-center justify-center mb-2">
                              <ClipboardIcon className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                            </div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                              {level.test?.length || 0}
                            </div>
                            <div className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
                              Test Questions
                            </div>
                          </div>
                          
                          <div 
                            className="p-4 rounded-xl text-center shadow-md"
                            style={{
                              backgroundColor: 'var(--color-accent-secondary-bg)',
                              border: '1px solid var(--color-accent-secondary)'
                            }}
                          >
                            <div className="flex items-center justify-center mb-2">
                              <PlayIcon className="h-6 w-6" style={{ color: 'var(--color-accent-secondary)' }} />
                            </div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-secondary)' }}>
                              {level.exercise?.length || 0}
                            </div>
                            <div className="text-sm font-medium" style={{ color: 'var(--color-accent-secondary)' }}>
                              Practical Exercises
                            </div>
                          </div>
                        </div>
                      </div>
                      
                                             {/* Action Buttons */}
                       <div 
                         className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                         style={{ backgroundColor: 'var(--color-secondary-bg)' }}
                       >
                         <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditLevel(level)}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                            <EditIcon className="h-4 w-4 inline mr-2" />
                            Edit Level
                          </button>
                          
                          <button
                            onClick={() => handleDeleteLevel(level.id)}
                            disabled={isDeletingLevel}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                            style={{
                              backgroundColor: 'var(--color-error)',
                              color: 'var(--color-text-inverse)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeletingLevel) {
                                e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isDeletingLevel) {
                                e.currentTarget.style.backgroundColor = 'var(--color-error)';
                              }
                            }}
                          >
                            <TrashIcon className="h-4 w-4 inline mr-2" />
                            {isDeletingLevel ? 'Deleting...' : 'Delete Level'}
                          </button>
                        </div>
                        
                        {/* Level Reorder Controls */}
                        <div className="flex items-center gap-2">
                          <div 
                            className="px-3 py-1 rounded-lg text-sm font-medium text-center min-w-[60px]"
                            style={{
                              backgroundColor: 'var(--color-tertiary-bg)',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            #{level.order}
                          </div>
                          
                          <div 
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: 'var(--color-border-subtle)',
                              color: 'var(--color-text-tertiary)'
                            }}
                          >
                            of {levels.filter((l: any) => l.careerTrack === level.careerTrack).length}
                          </div>
                          
                          <button
                            onClick={async () => {
                              // Move level up (swap with previous order)
                              const currentOrder = level.order;
                              const targetOrder = currentOrder - 1;
                              if (targetOrder < 1 || isReordering) return;
                              
                              console.log('Moving level up:', { 
                                levelId: level.id, 
                                currentOrder, 
                                targetOrder, 
                                track: level.careerTrack 
                              });
                              
                              try {
                                setIsReordering(true);
                                setReorderMessage('Moving level up...');
                                const track = level.careerTrack;
                                
                                console.log('Calling API with:', { track, from: currentOrder, to: targetOrder });
                                const result = await apiService.reorderLevelsByTrack(track, currentOrder, targetOrder);
                                console.log('API result:', result);
                                
                                dispatch(clearCache());
                                window.dispatchEvent(new CustomEvent('curriculum-changed', { 
                                  detail: { track, action: 'reorder', timestamp: Date.now() } 
                                }));
                                window.dispatchEvent(new CustomEvent('levels-refresh-required', { 
                                  detail: { track, reason: 'reorder', timestamp: Date.now() } 
                                }));
                                await apiService.invalidateCache();
                                await fetchLevels(track);
                              } catch (e) {
                                console.error('Reorder up failed:', e);
                                setError('Failed to reorder level. Please try again.');
                              } finally {
                                setIsReordering(false);
                                setReorderMessage(null);
                              }
                            }}
                            disabled={isReordering || level.order === 1}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: 'var(--color-accent-tertiary)',
                              color: 'var(--color-accent-primary)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isReordering && level.order > 1) {
                                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                                e.currentTarget.style.color = 'var(--color-text-inverse)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isReordering && level.order > 1) {
                                e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                                e.currentTarget.style.color = 'var(--color-accent-primary)';
                              }
                            }}
                            title="Move Level Up"
                          >
                            <ChevronUpIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={async () => {
                              // Move level down (swap with next order)
                              const currentOrder = level.order;
                              const targetOrder = currentOrder + 1;
                              if (isReordering) return;
                              
                              // Check if this is the last level in the track
                              const trackLevels = levels.filter((l: any) => l.careerTrack === level.careerTrack);
                              const maxOrder = Math.max(...trackLevels.map((l: any) => l.order));
                              if (currentOrder >= maxOrder) return;
                              
                              console.log('Moving level down:', { 
                                levelId: level.id, 
                                currentOrder, 
                                targetOrder, 
                                track: level.careerTrack,
                                maxOrder 
                              });
                              
                              try {
                                setIsReordering(true);
                                setReorderMessage('Moving level down...');
                                const track = level.careerTrack;
                                
                                console.log('Calling API with:', { track, from: currentOrder, to: targetOrder });
                                const result = await apiService.reorderLevelsByTrack(track, currentOrder, targetOrder);
                                console.log('API result:', result);
                                
                                dispatch(clearCache());
                                window.dispatchEvent(new CustomEvent('curriculum-changed', { 
                                  detail: { track, action: 'reorder', timestamp: Date.now() } 
                                }));
                                window.dispatchEvent(new CustomEvent('levels-refresh-required', { 
                                  detail: { track, reason: 'reorder', timestamp: Date.now() } 
                                }));
                                await apiService.invalidateCache();
                                await fetchLevels(track);
                              } catch (e) {
                                console.error('Reorder down failed:', e);
                                setError('Failed to reorder level. Please try again.');
                              } finally {
                                setIsReordering(false);
                                setReorderMessage(null);
                              }
                            }}
                            disabled={isReordering || level.order >= Math.max(...levels.filter((l: any) => l.careerTrack === level.careerTrack).map((l: any) => l.order))}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: 'var(--color-accent-tertiary)',
                              color: 'var(--color-accent-primary)'
                            }}
                            onMouseEnter={(e) => {
                              const trackLevels = levels.filter((l: any) => l.careerTrack === level.careerTrack);
                              const maxOrder = Math.max(...trackLevels.map((l: any) => l.order));
                              if (!isReordering && level.order < maxOrder) {
                                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                                e.currentTarget.style.color = 'var(--color-text-inverse)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              const trackLevels = levels.filter((l: any) => l.careerTrack === level.careerTrack);
                              const maxOrder = Math.max(...trackLevels.map((l: any) => l.order));
                              if (!isReordering && level.order < maxOrder) {
                                e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                                e.currentTarget.style.color = 'var(--color-accent-primary)';
                              }
                            }}
                            title="Move Level Down"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleAddContent('learn', level)}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                          >
                            <PlusIcon className="h-4 w-4 inline mr-2" />
                            Add Learn
                          </button>
                          
                          <button
                            onClick={() => handleAddContent('test', level)}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                          >
                            <PlusIcon className="h-4 w-4 inline mr-2" />
                            Add Test
                          </button>
                          
                          <button
                            onClick={() => handleAddContent('exercise', level)}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: 'var(--color-accent-secondary)',
                              color: 'var(--color-text-inverse)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                            }}
                          >
                            <PlusIcon className="h-4 w-4 inline mr-2" />
                            Add Exercise
                          </button>
                        </div>
                      </div>
                      
                                             {/* Content Sections */}
                       <div className="p-4 space-y-4">
                        {/* Learn Content Section */}
                        <div 
                          className="rounded-xl p-4 shadow-md"
                          style={{
                            backgroundColor: 'var(--color-success-bg)',
                            border: '1px solid var(--color-success)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: 'var(--color-success)',
                                  color: 'var(--color-text-inverse)'
                                }}
                              >
                                <BookOpenIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
                                  Learning Resources
                                </h4>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  {level.learn?.length || 0} resource{level.learn?.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const updatedLevels = levels.map(l => 
                                  l.id === level.id 
                                    ? { ...l, learnExpanded: !l.learnExpanded }
                                    : l
                                );
                                setLevels(updatedLevels);
                              }}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
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
                            >
                              {level.learnExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                          </div>
                          
                          {level.learnExpanded && (
                            <div className="space-y-3">
                              {level.learn?.length > 0 ? (
                                level.learn.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className="group relative rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
                                    style={{
                                      backgroundColor: 'var(--color-surface)',
                                      border: '1px solid var(--color-border-subtle)'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-success)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    {/* Content Header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div 
                                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                          style={{
                                            backgroundColor: 'var(--color-success-bg)',
                                            color: 'var(--color-success)'
                                          }}
                                        >
                                          <BookOpenIcon className="h-5 w-5" />
                                        </div>
                                        
                                        {/* Content Info */}
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                                            {item.title}
                                          </h5>
                                           
                                          {/* Order Badge */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span 
                                              className="px-2 py-1 rounded-md text-xs font-medium"
                                              style={{
                                                backgroundColor: 'var(--color-tertiary-bg)',
                                                color: 'var(--color-text-secondary)'
                                              }}
                                            >
                                              Order: {item.order}
                                            </span>
                                            {item.externalLink && (
                                              <span 
                                                className="px-2 py-1 rounded-md text-xs font-medium"
                                                style={{
                                                  backgroundColor: 'var(--color-accent-tertiary)',
                                                  color: 'var(--color-accent-primary)'
                                                }}
                                              >
                                                External Link
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditContent('learn', item, idx, level);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                          title="Edit"
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
                                        >
                                          <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteContent(level.id, 'learn', idx);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                          title="Delete"
                                          style={{ 
                                            backgroundColor: 'var(--color-error)',
                                            color: 'var(--color-text-inverse)'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--color-error)';
                                          }}
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* External Link Display */}
                                    {item.externalLink && (
                                      <div 
                                        className="mt-3 pt-3 border-t"
                                        style={{ borderColor: 'var(--color-border-subtle)' }}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span 
                                            className="text-xs font-medium"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                          >
                                            External Resource:
                                          </span>
                                          <a 
                                            href={item.externalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105"
                                            style={{
                                              backgroundColor: 'var(--color-accent-primary)',
                                              color: 'var(--color-text-inverse)'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                                            }}
                                          >
                                            <span>Open</span>
                                            <ExternalLinkIcon className="h-3 w-3" />
                                          </a>
                                        </div>
                                        
                                        {/* Link Preview */}
                                        <div className="mt-2 p-2 rounded bg-opacity-50"
                                          style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
                                        >
                                          <p 
                                            className="text-xs break-all font-mono"
                                            style={{ color: 'var(--color-accent-primary)' }}
                                          >
                                            {item.externalLink}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div 
                                  className="text-center py-8 rounded-xl border-2 border-dashed"
                                  style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border-subtle)'
                                  }}
                                >
                                  <div 
                                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                    style={{
                                      backgroundColor: 'var(--color-tertiary-bg)',
                                      color: 'var(--color-text-muted)'
                                    }}
                                  >
                                    <BookOpenIcon className="h-6 w-6" />
                                  </div>
                                  <p 
                                    className="text-sm font-medium mb-2"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    No Learning Resources
                                  </p>
                                  <p 
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                  >
                                    Add your first learning resource to get started
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Test Content Section */}
                        <div 
                          className="rounded-xl p-4 shadow-md"
                          style={{
                            backgroundColor: 'var(--color-warning-bg)',
                            border: '1px solid var(--color-warning)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: 'var(--color-warning)',
                                  color: 'var(--color-text-inverse)'
                                }}
                              >
                                <ClipboardIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold" style={{ color: 'var(--color-warning)' }}>
                                  Test Questions
                                </h4>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  {level.test?.length || 0} question{level.test?.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const updatedLevels = levels.map(l => 
                                  l.id === level.id 
                                    ? { ...l, testExpanded: !l.testExpanded }
                                    : l
                                );
                                setLevels(updatedLevels);
                              }}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
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
                            >
                              {level.testExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                          </div>
                          
                          {level.testExpanded && (
                            <div className="space-y-3">
                              {level.test?.length > 0 ? (
                                level.test.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className="group relative rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
                                    style={{
                                      backgroundColor: 'var(--color-surface)',
                                      border: '1px solid var(--color-border-subtle)'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-warning)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    {/* Content Header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div 
                                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                          style={{
                                            backgroundColor: 'var(--color-warning-bg)',
                                            color: 'var(--color-warning)'
                                          }}
                                        >
                                          <ClipboardIcon className="h-5 w-5" />
                                        </div>
                                        
                                        {/* Content Info */}
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                                            {item.question}
                                          </h5>
                                           
                                          {/* Order Badge */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span 
                                              className="px-2 py-1 rounded-md text-xs font-medium"
                                              style={{
                                                backgroundColor: 'var(--color-tertiary-bg)',
                                                color: 'var(--color-text-secondary)'
                                              }}
                                            >
                                              Order: {item.order}
                                            </span>
                                            <span 
                                              className="px-2 py-1 rounded-md text-xs font-medium"
                                              style={{
                                                backgroundColor: 'var(--color-warning-bg)',
                                                color: 'var(--color-warning)'
                                              }}
                                            >
                                              {item.options.length} option{item.options.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditContent('test', item, idx, level);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                          title="Edit"
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
                                        >
                                          <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteContent(level.id, 'test', idx);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                          title="Delete"
                                          style={{ 
                                            backgroundColor: 'var(--color-error)',
                                            color: 'var(--color-text-inverse)'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--color-error)';
                                          }}
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div 
                                  className="text-center py-8 rounded-xl border-2 border-dashed"
                                  style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border-subtle)'
                                  }}
                                >
                                  <div 
                                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                    style={{
                                      backgroundColor: 'var(--color-tertiary-bg)',
                                      color: 'var(--color-text-muted)'
                                    }}
                                  >
                                    <ClipboardIcon className="h-6 w-6" />
                                  </div>
                                  <p 
                                    className="text-sm font-medium mb-2"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    No Test Questions
                                  </p>
                                  <p 
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                  >
                                    Add your first test question to get started
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Exercise Content Section */}
                        <div 
                          className="rounded-xl p-4 shadow-md"
                          style={{
                            backgroundColor: 'var(--color-accent-secondary-bg)',
                            border: '1px solid var(--color-accent-secondary)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: 'var(--color-accent-secondary)',
                                  color: 'var(--color-text-inverse)'
                                }}
                              >
                                <PlayIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold" style={{ color: 'var(--color-accent-secondary)' }}>
                                  Practical Exercises
                                </h4>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  {level.exercise?.length || 0} exercise{level.exercise?.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const updatedLevels = levels.map(l => 
                                  l.id === level.id 
                                    ? { ...l, exerciseExpanded: !l.exerciseExpanded }
                                    : l
                                );
                                setLevels(updatedLevels);
                              }}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
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
                            >
                              {level.exerciseExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                          </div>
                          
                          {level.exerciseExpanded && (
                            <div className="space-y-3">
                              {level.exercise?.length > 0 ? (
                                level.exercise.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className="group relative rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
                                    style={{
                                      backgroundColor: 'var(--color-surface)',
                                      border: '1px solid var(--color-border-subtle)'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-accent-secondary)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    {/* Content Header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div 
                                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                          style={{
                                            backgroundColor: 'var(--color-accent-secondary-bg)',
                                            color: 'var(--color-accent-secondary)'
                                          }}
                                        >
                                          <PlayIcon className="h-5 w-5" />
                                        </div>
                                        
                                        {/* Content Info */}
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                                            {item.title}
                                          </h5>
                                           
                                          {/* Order Badge */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span 
                                              className="px-2 py-1 rounded-md text-xs font-medium"
                                              style={{
                                                backgroundColor: 'var(--color-tertiary-bg)',
                                                color: 'var(--color-text-secondary)'
                                              }}
                                            >
                                              Order: {item.order}
                                            </span>
                                            {item.resources && item.resources.length > 0 && (
                                              <span 
                                                className="px-2 py-1 rounded-md text-xs font-medium"
                                                style={{
                                                  backgroundColor: 'var(--color-accent-tertiary)',
                                                  color: 'var(--color-accent-primary)'
                                                }}
                                              >
                                                {item.resources.length} resource{item.resources.length !== 1 ? 's' : ''}
                                              </span>
                                            )}
                                          </div>
                                           
                                          {/* Description */}
                                          <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-tertiary)' }}>
                                            {item.description}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditContent('exercise', item, idx, level);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                          title="Edit"
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
                                        >
                                          <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteContent(level.id, 'exercise', idx);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                          title="Delete"
                                          style={{ 
                                            backgroundColor: 'var(--color-error)',
                                            color: 'var(--color-text-inverse)'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--color-error)';
                                          }}
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div 
                                  className="text-center py-8 rounded-xl border-2 border-dashed"
                                  style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border-subtle)'
                                  }}
                                >
                                  <div 
                                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                    style={{
                                      backgroundColor: 'var(--color-tertiary-bg)',
                                      color: 'var(--color-text-muted)'
                                    }}
                                  >
                                    <PlayIcon className="h-6 w-6" />
                                  </div>
                                  <p 
                                    className="text-sm font-medium mb-2"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    No Exercises
                                  </p>
                                  <p 
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                  >
                                    Add your first exercise to get started
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Loading Modals: Reorder / Delete / Refetch */}
      <AnimatePresence>
        {(isReordering || isDeletingLevel || isRefetching) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="border rounded-lg p-6 w-full max-w-sm text-center"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <motion.img
                src={syncnerLogo}
                alt="Syncner Logo"
                className="w-10 h-10 mx-auto mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }}
              />
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {reorderMessage || deleteMessage || refetchMessage || 'Please wait...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowContentModal(false);
              }
            }}
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
                  onClick={handleCloseContentModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Cross1Icon className="h-6 w-6" />
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

                {editingContent?.type === 'learn' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      External Link
                    </label>
                    <input
                      type="url"
                      value={contentForm.externalLink || ''}
                      onChange={(e) => {
                        setContentForm({ ...contentForm, externalLink: e.target.value });
                      }}
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
                      placeholder="https://example.com (optional)"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Add a link to external resources, videos, or additional reading material
                    </p>
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
                    onClick={handleCloseContentModal}
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