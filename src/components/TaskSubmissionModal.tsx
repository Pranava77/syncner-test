import React, { useState } from 'react';
import { 
  FileTextIcon, 
  ReaderIcon, 
  Link1Icon, 
  ClipboardIcon, 
  CheckCircledIcon,
  Cross1Icon,
  ExclamationTriangleIcon
} from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import syncnerLogo from '../assets/syncner-logo.png';

interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    id?: string;
    title: string;
    description: string;
    resources: string[];
    difficulty?: string;
    creditPoints?: number;
    order?: number;
  };
  existingSubmission?: {
    links: string[];
    submittedAt: Date;
    status: string;
  };
  onExerciseSubmitted?: () => void; // Callback to trigger refresh
}

const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({ isOpen, onClose, exercise, existingSubmission, onExerciseSubmitted }) => {
  const isEditMode = !!existingSubmission;
  
  const [formData, setFormData] = useState({
    brief: exercise.description || '',
    instruction: exercise.resources?.join('\n') || '',
    referenceMaterials: ['', '', ''],
    expectedOutput: '',
    submissionLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form with existing submission data when editing
  React.useEffect(() => {
    if (existingSubmission && existingSubmission.links.length > 0) {
      const links = [...existingSubmission.links];
      setFormData(prev => ({
        ...prev,
        submissionLink: links[0] || '',
        referenceMaterials: [
          links[1] || '',
          links[2] || '',
          links[3] || ''
        ]
      }));
    }
  }, [existingSubmission]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleReferenceMaterialChange = (index: number, value: string) => {
    const newReferenceMaterials = [...formData.referenceMaterials];
    newReferenceMaterials[index] = value;
    setFormData(prev => ({
      ...prev,
      referenceMaterials: newReferenceMaterials
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      // Silent error handling
    }
  };

  const validateForm = () => {
    if (!formData.submissionLink.trim()) {
      setError('Submission link is required to complete this exercise.');
      return false;
    }
    
    // Enhanced URL validation for main submission link
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(formData.submissionLink.trim())) {
      setError('Please enter a valid URL starting with http:// or https:// for your submission link.');
      return false;
    }
    
    try {
      new URL(formData.submissionLink.trim());
    } catch {
      setError('Please enter a valid URL for your submission link.');
      return false;
    }
    
    // Validate additional links if provided
    const additionalLinks = formData.referenceMaterials.filter(link => link.trim() !== '');
    for (const link of additionalLinks) {
      if (!urlRegex.test(link.trim())) {
        setError('Please enter valid URLs starting with http:// or https:// for all additional submission links.');
        return false;
      }
      try {
        new URL(link.trim());
      } catch {
        setError('Please enter valid URLs for all additional submission links.');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Extract links from form data
      const links = [
        formData.submissionLink,
        ...formData.referenceMaterials.filter(link => link.trim() !== '')
      ].filter(link => link.trim() !== '');
      
      // Submit or update exercise with links
      if (isEditMode) {
        await apiService.updateExercise(exercise.id || '', exercise.title, links);
      } else {
        await apiService.submitExercise(exercise.id || '', exercise.title, links);
      }
      
      // Trigger refresh callback if provided
      if (onExerciseSubmitted) {
        onExerciseSubmitted();
      }
      
      onClose();
    } catch (error) {
      setError(`Failed to ${isEditMode ? 'update' : 'submit'} exercise. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto scroll-smooth border"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 backdrop-blur-sm border-b p-6 rounded-t-2xl"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <FileTextIcon className="w-6 h-6 text-trueturquoise" />
              </div>
              <div>
                <h2 
                  className="text-xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {isEditMode ? 'Edit Submission' : exercise.title}
                </h2>
                <p 
                  className="text-sm max-w-md"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {isEditMode ? `Update your submission for: ${exercise.title}` : exercise.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span 
                className="px-4 py-2 rounded-full font-semibold text-sm border"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)',
                  borderColor: 'var(--color-accent-primary)'
                }}
              >
                {exercise.difficulty || 'Medium'}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                }}
              >
                <Cross1Icon 
                  className="w-4 h-4" 
                  style={{ color: 'var(--color-accent-primary)' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mx-6 mt-4 p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-error-bg)',
              borderColor: 'var(--color-error)'
            }}
          >
            <div 
              className="flex items-center gap-3"
              style={{ color: 'var(--color-error)' }}
            >
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="p-6 space-y-8">
          {/* Exercise Overview Card */}
          <div 
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: 'var(--color-accent-tertiary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-accent-primary)',
                  opacity: 0.2
                }}
              >
                <ClipboardIcon 
                  className="w-5 h-5" 
                  style={{ color: 'var(--color-accent-primary)' }}
                />
              </div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Exercise Overview
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--color-accent-primary)' }}
                >
                  What you need to do:
                </h4>
                <div 
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border-subtle)'
                  }}
                >
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {formData.brief}
                  </p>
                </div>
              </div>
              <div>
                <h4 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--color-accent-primary)' }}
                >
                  Instructions & Guidelines:
                </h4>
                <div 
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border-subtle)'
                  }}
                >
                  <p 
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {formData.instruction}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Card */}
          <div 
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: 'var(--color-accent-tertiary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-warning)',
                  opacity: 0.2
                }}
              >
                <FileTextIcon 
                  className="w-5 h-5" 
                  style={{ color: 'var(--color-warning)' }}
                />
              </div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Reference Materials
              </h3>
            </div>
            <div 
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-subtle)'
              }}
            >
              {exercise.resources && exercise.resources.length > 0 ? (
                <div className="space-y-3">
                  {exercise.resources.map((resource, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--color-accent-tertiary)'
                      }}
                    >
                      <div className="flex items-center gap-2 text-sm flex-1">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-warning)' }}
                        ></div>
                        <span 
                          className="break-all"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {resource}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(resource)}
                        className="ml-2 p-1.5 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--color-accent-tertiary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                        }}
                        title="Copy link"
                      >
                        <ClipboardIcon 
                          className="w-4 h-4" 
                          style={{ color: 'var(--color-text-tertiary)' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  No reference materials provided for this exercise.
                </p>
              )}
            </div>
          </div>

          {/* Submission Section Card */}
          <div 
            className="rounded-2xl p-6 border"
            style={{
              background: 'linear-gradient(135deg, var(--color-success-bg), var(--color-accent-tertiary))',
              borderColor: 'var(--color-success)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-success)',
                  opacity: 0.2
                }}
              >
                <Link1Icon 
                  className="w-5 h-5" 
                  style={{ color: 'var(--color-success)' }}
                />
              </div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Submit Your Work
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label 
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--color-success)' }}
                >
                  Main Submission Link <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.submissionLink}
                  onChange={(e) => handleInputChange('submissionLink', e.target.value)}
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition"
                  style={{ 
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-success)'
                  }}
                  placeholder="https://your-project-link.com"
                  required
                />
                <p 
                  className="text-xs mt-2"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  This link is required to unlock the next level. Please provide a valid URL to your completed work.
                </p>
              </div>
              
              <div>
                <label 
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--color-success)' }}
                >
                  Additional Links (Optional)
                </label>
                <div className="space-y-3">
                  {formData.referenceMaterials.map((material, index) => (
                    <input
                      key={index}
                      type="url"
                      value={material}
                      onChange={(e) => handleReferenceMaterialChange(index, e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-success)'
                      }}
                      placeholder={`Additional link ${index + 1} (GitHub, demo, docs, etc.)`}
                    />
                  ))}
                </div>
                <p 
                  className="text-xs mt-2"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  You can add additional links to your work (e.g., GitHub repository, live demo, documentation).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 backdrop-blur-sm border-t p-6 rounded-b-2xl"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex justify-between items-center">
            <div 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <span style={{ color: 'var(--color-error)' }}>*</span> Required field
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 border rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 font-medium"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'transparent'
                }}
              >
                <Cross1Icon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.submissionLink.trim()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ 
                  color: 'var(--color-text-inverse)',
                  background: 'linear-gradient(135deg, var(--color-success), var(--color-accent-primary))'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && formData.submissionLink.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-success), var(--color-accent-secondary))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && formData.submissionLink.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-success), var(--color-accent-primary))';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <motion.img
                      src={syncnerLogo}
                      alt="Syncner Logo"
                      className="w-4 h-4"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <CheckCircledIcon className="w-4 h-4" />
                    {isEditMode ? 'Update Submission' : 'Submit Exercise'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmissionModal; 