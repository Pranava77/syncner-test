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
  item: any;
  index: number;
}

export const useContentManagement = () => {
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
    setContentForm({ ...defaultForm, order: (level[type]?.length || 0) + 1 });
    setEditingContent({ type, item: { levelId: level.id }, index: -1 });
    setShowContentModal(true);
  }, []);

  // Handle edit content
  const handleEditContent = useCallback((type: 'learn' | 'test' | 'exercise', item: any, index: number, level: any) => {
    setEditingContent({ type, item, index });
    
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
      const level = editingContent?.item ? editingContent.item : null;

      if (editingContent && editingContent.index >= 0 && level) {
        // Update existing content
        const updateData = {
          ...formData,
          type: contentType,
          levelId: level.id,
          action: 'updateContent',
          contentIndex: editingContent.index
        };

        const response = await apiService.put(`/curriculum/${level.id}`, updateData);
        
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
        // Create new content
        const newContentData = {
          ...formData,
          type: contentType,
          levelId: level?.id,
          action: 'addContent'
        };

        const response = await apiService.createCurriculumItem(newContentData);
        
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
  const handleDeleteContent = useCallback(async (levelId: string, type: 'learn' | 'test' | 'exercise', index: number) => {
    try {
      // For content deletion, we need to update the level by removing the content item
      // This should be handled by updating the level with the content array minus the deleted item
      // For now, we'll use a PUT request to update the level
      const response = await apiService.put(`/curriculum/${levelId}`, {
        action: 'deleteContent',
        contentType: type,
        contentIndex: index
      });
      
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
