import { useState, useCallback } from 'react';
import { useAppDispatch } from '../redux/store';
import { clearCache } from '../redux/slices/curriculumSlice';
import apiService from '../services/api';

interface ContentForm {
  title: string;
  order: number;
  content: string;
  externalLink?: string;
  question: string;
  options: string[];
  answer: string;
  description: string;
  resources: string[];
}

interface EditingContent {
  type: 'learn' | 'test' | 'exercise';
  item: any | null;
  index: number; // -1 means creating new
  level?: any | null;
}

export const useContentManagement = () => {
  const normalizeTrack = (track?: string) => {
    if (!track) return '' as any;
    const map: Record<string,string> = {
      'fullstack': 'full-stack', 'full-stack': 'full-stack', 'Full Stack': 'full-stack',
      'aiml': 'ai-ml', 'ai-ml': 'ai-ml', 'AI/ML': 'ai-ml',
      'uiux': 'ui-ux', 'ui-ux': 'ui-ux', 'UI/UX': 'ui-ux',
      'datascience': 'data-science', 'data-science': 'data-science', 'Data Science': 'data-science',
    };
    return map[track] || track;
  };
  const dispatch = useAppDispatch();

  // State
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<EditingContent | null>(null);
  const [contentForm, setContentForm] = useState<ContentForm>({
    title: '',
    order: 1,
    content: '',
    externalLink: '',
    question: '',
    options: ['', '', '', ''],
    answer: '',
    description: '',
    resources: []
  });
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);
  const [contentFormError, setContentFormError] = useState('');

  // Default content form for different types
  const getDefaultContentForm = (type: 'learn' | 'test' | 'exercise'): ContentForm => {
    const baseForm = {
      title: '',
      order: 1,
      content: '',
      externalLink: '',
      question: '',
      options: ['', '', '', ''],
      answer: '',
      description: '',
      resources: []
    };

    switch (type) {
      case 'learn':
        return { ...baseForm, externalLink: '' };
      case 'test':
        return { ...baseForm, question: '', options: ['', '', '', ''], answer: '' };
      case 'exercise':
        return { ...baseForm, description: '', resources: [] };
      default:
        return baseForm;
    }
  };

  // Reset content form
  const resetContentForm = useCallback(() => {
    setContentForm({
      title: '',
      order: 1,
      content: '',
      externalLink: '',
      question: '',
      options: ['', '', '', ''],
      answer: '',
      description: '',
      resources: []
    });
    setContentFormError('');
  }, []);

  // Handle add content
  const handleAddContent = useCallback((type: 'learn' | 'test' | 'exercise', level: any) => {
    const defaultForm = getDefaultContentForm(type);
    // Backend groups by level order, so content order must equal level.order
    setContentForm({ ...defaultForm, order: level.order });
    setEditingContent({ type, item: null, index: -1, level });
    setShowContentModal(true);
  }, []);

  // Handle edit content
  const handleEditContent = useCallback((type: 'learn' | 'test' | 'exercise', item: any, index: number, level: any) => {
    setEditingContent({ type, item, index, level });
    
    // Parse the content for test items
    if (type === 'test') {
      const lines = item.content.split('\n');
      const question = lines[0] || '';
      const options: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^[A-D]\)/)) {
          options.push(line.substring(2).trim());
        }
      }
      
      setContentForm({
        title: item.title || '',
        order: item.order || 1,
        content: item.content || '',
        externalLink: item.externalLink || '',
        question: question,
        options: options.length > 0 ? options : ['', '', '', ''],
        answer: item.answer || '',
        description: item.description || '',
        resources: item.resources || []
      });
    } else {
      setContentForm({
        title: item.title || '',
        order: item.order || 1,
        content: item.content || '',
        externalLink: item.externalLink || '',
        question: '',
        options: ['', '', '', ''],
        answer: '',
        description: item.description || '',
        resources: item.resources || []
      });
    }
    
    setShowContentModal(true);
  }, []);

  // Handle content submit
  const handleContentSubmit = useCallback(async (formData: ContentForm) => {
    try {
      setIsSubmittingContent(true);
      setContentFormError('');

      const contentType = editingContent?.type || 'learn';

      // Update existing content (we must have content item id)
      if (editingContent && editingContent.index >= 0 && editingContent.item && editingContent.item.id) {
        const contentId = editingContent.item.id as string;

        // Build update payload. For exercise, allow description/resources; for learn, include externalLink
        const updateData: any = {
          title: formData.title,
          // Ensure content is always provided and meets minimum length requirement
          content: (formData.content && formData.content.trim().length >= 10) 
            ? formData.content 
            : (formData.description && formData.description.trim().length >= 10)
              ? formData.description
              : `${formData.title || 'Content'} details`,
          // use the parent level's order to keep the item within the same level
          order: editingContent.level?.order ?? formData.order,
          // Backend expects: syllabus, learn, test, or exercise
          type: contentType,
          // include required fields for validation
          careerTrack: normalizeTrack(editingContent.level?.careerTrack),
          difficulty: editingContent.level?.difficulty || 'beginner',
        };
        if (contentType === 'learn') {
          updateData.externalLink = formData.externalLink || '';
          const learnDesc = formData.title || 'Learning resource';
          updateData.description = learnDesc.length >= 10 ? learnDesc : `${learnDesc} details`;
          // Ensure content is non-empty to satisfy validation downstream if used
          if (!updateData.content || updateData.content.trim().length < 10) {
            const fallback = formData.title || formData.externalLink || 'Learning resource link';
            updateData.content = `${fallback} - learning resource`;
          }
        } else if (contentType === 'exercise') {
          const exDescBase = formData.description || formData.title || 'Exercise';
          updateData.description = exDescBase.length >= 10 ? exDescBase : `${exDescBase} details`;
          // Map resources strings to schema objects
          if (Array.isArray(formData.resources)) {
            updateData.resources = formData.resources
              .filter((r) => !!r && String(r).trim())
              .map((r) => (typeof r === 'string' ? { title: r.trim(), type: 'external' } : r));
          }
          if (!updateData.content || updateData.content.trim().length < 10) {
            updateData.content = (updateData.description && updateData.description.length >= 10)
              ? updateData.description
              : `${formData.title || 'Exercise'} details`;
          }
        } else if (contentType === 'test') {
          const testDesc = formData.title || 'Test question';
          updateData.description = testDesc.length >= 10 ? testDesc : `${testDesc} text`;
        }

        const response = await apiService.updateCurriculumItem(contentId, updateData);
        
        if (response.success) {
          dispatch(clearCache());
          window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'content-updated' } }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required'));
          setShowContentModal(false);
          resetContentForm();
          return { success: true, message: 'Content updated successfully' };
        } else {
          setContentFormError(response.message || 'Failed to update content');
          return { success: false, message: response.message || 'Failed to update content' };
        }
      } else {
        // Create new content using generic curriculum item creation endpoint
        const level = editingContent?.level;
        const newData: any = {
          title: formData.title,
          type: contentType,
          order: level?.order,
          careerTrack: level?.careerTrack,
          // difficulty can be inherited from level if present
          difficulty: level?.difficulty || 'beginner',
        };

        // Build content/body fields per type
        if (contentType === 'learn') {
          newData.externalLink = formData.externalLink || '';
          const learnDesc = formData.title || 'Learning resource';
          newData.description = learnDesc.length >= 10 ? learnDesc : `${learnDesc} details`;
          // Ensure content is always provided and meets minimum length
          newData.content = (formData.content && formData.content.trim().length >= 10)
            ? formData.content
            : `${formData.title || formData.externalLink || 'Learning resource'} - details inside`;
        } else if (contentType === 'test') {
          // ContentModal already formats content with question + A-D)
          newData.content = formData.content || `${formData.title || 'Test question'} - multiple choice options`;
          const testDesc = formData.title || 'Test question';
          newData.description = testDesc.length >= 10 ? testDesc : `${testDesc} text`;
        } else if (contentType === 'exercise') {
          const exDescBase = formData.description || formData.title || 'Exercise';
          newData.description = exDescBase.length >= 10 ? exDescBase : `${exDescBase} details`;
          if (Array.isArray(formData.resources)) {
            newData.resources = formData.resources
              .filter((r) => !!r && String(r).trim())
              .map((r) => (typeof r === 'string' ? { title: r.trim(), type: 'external' } : r));
          }
          // Ensure content is always provided and meets minimum length
          newData.content = (formData.content && formData.content.trim().length >= 10)
            ? formData.content
            : (newData.description && newData.description.length >= 10)
              ? newData.description
              : `${formData.title || 'Exercise'} details`;
        }

        const response = await apiService.createCurriculumItem(newData);
        
        if (response.success) {
          dispatch(clearCache());
          window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'content-created' } }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required'));
          setShowContentModal(false);
          resetContentForm();
          return { success: true, message: 'Content created successfully' };
        } else {
          setContentFormError(response.message || 'Failed to create content');
          return { success: false, message: response.message || 'Failed to create content' };
        }
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setContentFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmittingContent(false);
    }
  }, [editingContent, dispatch, resetContentForm]);

  // Handle delete content
  const handleDeleteContent = useCallback(async (contentId: string) => {
    try {
      const response = await apiService.deleteCurriculumItem(contentId);
      
      if (response.success) {
        dispatch(clearCache());
        window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'content-deleted' } }));
        window.dispatchEvent(new CustomEvent('levels-refresh-required'));
        return { success: true, message: 'Content deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete content' };
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Handle close content modal
  const handleCloseContentModal = useCallback(() => {
    setShowContentModal(false);
    setEditingContent(null);
    resetContentForm();
  }, [resetContentForm]);

  // Ensure test options always have 4 elements
  const ensureTestOptions = useCallback((options: string[]) => {
    const newOptions = [...options];
    while (newOptions.length < 4) {
      newOptions.push('');
    }
    return newOptions.slice(0, 4);
  }, []);

  return {
    // State
    showContentModal,
    editingContent,
    contentForm,
    isSubmittingContent,
    contentFormError,

    // Actions
    handleAddContent,
    handleEditContent,
    handleContentSubmit,
    handleDeleteContent,
    handleCloseContentModal,
    setShowContentModal,
    setContentForm,
    setContentFormError,

    // Utilities
    getDefaultContentForm,
    resetContentForm,
    ensureTestOptions
  };
};

export default useContentManagement;
