import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cross1Icon,
  PlusIcon
} from '@radix-ui/react-icons';

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

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ContentForm) => void;
  editingContent?: { type: 'learn' | 'test' | 'exercise', item: any, index: number } | null;
  isSubmitting: boolean;
  formError: string;
  level: any;
}

const defaultContentForm: ContentForm = {
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

const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingContent,
  isSubmitting,
  formError,
  level
}) => {
  const [form, setForm] = useState<ContentForm>(defaultContentForm);
  const [newResource, setNewResource] = useState('');

  useEffect(() => {
    if (editingContent && editingContent.item) {
      // Parse the content for test items
      if (editingContent.type === 'test') {
        const lines = editingContent.item.content.split('\n');
        const question = lines[0] || '';
        const options: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^[A-D]\)/)) {
            options.push(line.substring(2).trim());
          }
        }
        
        setForm({
          title: editingContent.item.title || '',
          order: editingContent.item.order || 1,
          content: editingContent.item.content || '',
          externalLink: editingContent.item.externalLink || '',
          question: question,
          options: options.length > 0 ? options : ['', '', '', ''],
          answer: editingContent.item.answer || '',
          description: editingContent.item.description || '',
          resources: editingContent.item.resources || []
        });
      } else {
        setForm({
          title: editingContent.item.title || '',
          order: editingContent.item.order || 1,
          content: editingContent.item.content || '',
          externalLink: editingContent.item.externalLink || '',
          question: '',
          options: ['', '', '', ''],
          answer: '',
          description: editingContent.item.description || '',
          resources: editingContent.item.resources || []
        });
      }
    } else {
      setForm(defaultContentForm);
    }
  }, [editingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContent?.type === 'test') {
      // Format test content
      const testContent = `${form.question}\n${form.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}`;
      const testForm = {
        ...form,
        content: testContent
      };
      onSubmit(testForm);
    } else {
      onSubmit(form);
    }
  };

  const handleClose = () => {
    setForm(defaultContentForm);
    onClose();
  };

  const addResource = () => {
    if (newResource.trim() && !form.resources.includes(newResource.trim())) {
      setForm({ ...form, resources: [...form.resources, newResource.trim()] });
      setNewResource('');
    }
  };

  const removeResource = (resource: string) => {
    setForm({ ...form, resources: form.resources.filter(r => r !== resource) });
  };

  const ensureTestOptions = (options: string[]) => {
    const newOptions = [...options];
    while (newOptions.length < 4) {
      newOptions.push('');
    }
    return newOptions.slice(0, 4);
  };

  const getContentTypeLabel = (type: 'learn' | 'test' | 'exercise') => {
    switch (type) {
      case 'learn': return 'Learning Resource';
      case 'test': return 'Test Question';
      case 'exercise': return 'Exercise';
      default: return 'Content';
    }
  };

  const getContentTypeColor = (type: 'learn' | 'test' | 'exercise') => {
    switch (type) {
      case 'learn': return 'var(--color-accent-primary)';
      case 'test': return 'var(--color-accent-secondary)';
      case 'exercise': return 'var(--color-accent-tertiary)';
      default: return 'var(--color-accent-primary)';
    }
  };

  if (!isOpen) return null;

  const contentType = editingContent?.type || 'learn';
  const typeColor = getContentTypeColor(contentType);
  const typeLabel = getContentTypeLabel(contentType);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {editingContent ? `Edit ${typeLabel}` : `Add ${typeLabel}`}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <Cross1Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder={`Enter ${typeLabel.toLowerCase()} title`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Order *
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Content Type Specific Fields */}
            {contentType === 'learn' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  External Link
                </label>
                <input
                  type="url"
                  value={form.externalLink}
                  onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="https://example.com/resource"
                />
              </div>
            )}

            {contentType === 'test' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Question *
                  </label>
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Enter the test question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Multiple Choice Options *
                  </label>
                  
                  {/* Option A */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)'
                      }}>
                      A
                    </div>
                    <input
                      type="text"
                      value={form.options[0] || ''}
                      onChange={(e) => {
                        const newOptions = [...form.options];
                        newOptions[0] = e.target.value;
                        setForm({ ...form, options: ensureTestOptions(newOptions) });
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="Enter option A"
                      required
                    />
                  </div>

                  {/* Option B */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--color-accent-secondary)',
                        color: 'var(--color-text-inverse)'
                      }}>
                      B
                    </div>
                    <input
                      type="text"
                      value={form.options[1] || ''}
                      onChange={(e) => {
                        const newOptions = [...form.options];
                        newOptions[1] = e.target.value;
                        setForm({ ...form, options: ensureTestOptions(newOptions) });
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="Enter option B"
                      required
                    />
                  </div>

                  {/* Option C */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--color-warning)',
                        color: 'var(--color-text-inverse)'
                      }}>
                      C
                    </div>
                    <input
                      type="text"
                      value={form.options[2] || ''}
                      onChange={(e) => {
                        const newOptions = [...form.options];
                        newOptions[2] = e.target.value;
                        setForm({ ...form, options: ensureTestOptions(newOptions) });
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="Enter option C"
                      required
                    />
                  </div>

                  {/* Option D */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: 'var(--color-text-inverse)'
                      }}>
                      D
                    </div>
                    <input
                      type="text"
                      value={form.options[3] || ''}
                      onChange={(e) => {
                        const newOptions = [...form.options];
                        newOptions[3] = e.target.value;
                        setForm({ ...form, options: ensureTestOptions(newOptions) });
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="Enter option D"
                      required
                    />
                  </div>

                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    All 4 options are required for multiple choice questions. Option A, B, C, and D must be filled.
                  </p>

                  {/* Validation Status */}
                  <div className="mt-3 p-2 rounded-lg text-xs"
                    style={{
                      backgroundColor: form.options.length === 4 && form.options.every(opt => opt.trim()) 
                        ? 'var(--color-success-bg)' 
                        : 'var(--color-warning-bg)',
                      border: '1px solid',
                      borderColor: form.options.length === 4 && form.options.every(opt => opt.trim()) 
                        ? 'var(--color-success)' 
                        : 'var(--color-warning)',
                      color: form.options.length === 4 && form.options.every(opt => opt.trim()) 
                        ? 'var(--color-success)' 
                        : 'var(--color-warning)'
                    }}
                  >
                    {form.options.length === 4 && form.options.every(opt => opt.trim()) 
                      ? '✓ All options are filled correctly' 
                      : `⚠ ${form.options.filter(opt => opt.trim()).length}/4 options filled`}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Correct Answer *
                  </label>
                  <select
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  >
                    <option value="">Select correct answer</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            )}

            {contentType === 'exercise' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Describe the exercise and what students need to do"
                  required
                />
              </div>
            )}

            {/* General Content */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder={`Enter ${typeLabel.toLowerCase()} content`}
              />
            </div>

            {/* Resources (for exercises) */}
            {contentType === 'exercise' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Resources
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Add a resource URL"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                  />
                  <button
                    type="button"
                    onClick={addResource}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
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
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.resources.map((resource, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: 'var(--color-accent-tertiary)',
                        color: 'var(--color-accent-primary)'
                      }}
                    >
                      {resource}
                                                        <button
                                    type="button"
                                    onClick={() => removeResource(resource)}
                                    className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                                  >
                                    <Cross1Icon className="h-3 w-3" />
                                  </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-lg text-sm" style={{
                backgroundColor: 'var(--color-error-bg)',
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)'
              }}>
                {formError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-tertiary-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary-bg)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: typeColor,
                  color: 'var(--color-text-inverse)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = typeColor;
                  }
                }}
              >
                {isSubmitting ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContentModal;
