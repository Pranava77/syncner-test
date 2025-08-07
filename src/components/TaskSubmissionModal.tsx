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

  const validateForm = () => {
    if (!formData.submissionLink.trim()) {
      setError('Submission link is required to complete this exercise.');
      return false;
    }
    
    // Basic URL validation for main submission link
    try {
      new URL(formData.submissionLink);
    } catch {
      setError('Please enter a valid URL for your submission link.');
      return false;
    }
    
    // Validate additional links if provided
    const additionalLinks = formData.referenceMaterials.filter(link => link.trim() !== '');
    for (const link of additionalLinks) {
      try {
        new URL(link);
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
        console.log('Exercise updated successfully:', formData);
      } else {
        await apiService.submitExercise(exercise.id || '', exercise.title, links);
        console.log('Exercise submitted successfully:', formData);
      }
      
      // Trigger refresh callback if provided
      if (onExerciseSubmitted) {
        onExerciseSubmitted();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting exercise:', error);
      setError(`Failed to ${isEditMode ? 'update' : 'submit'} exercise. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-offblack rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto scroll-smooth border border-paperwhite/20">
        {/* Header */}
        <div className="sticky top-0 bg-offblack/95 backdrop-blur-sm border-b border-paperwhite/20 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <FileTextIcon className="w-6 h-6 text-trueturquoise" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-paperwhite">
                  {isEditMode ? 'Edit Submission' : exercise.title}
                </h2>
                <p className="text-sm text-teallight max-w-md">
                  {isEditMode ? `Update your submission for: ${exercise.title}` : exercise.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-trueturquoise/20 to-blue-500/20 text-trueturquoise font-semibold text-sm border border-trueturquoise/30">
                {exercise.difficulty || 'Medium'}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-paperwhite/10 hover:bg-paperwhite/20 flex items-center justify-center transition-colors"
              >
                <Cross1Icon className="w-4 h-4 text-paperwhite" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3 text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="p-6 space-y-8">
          {/* Exercise Overview Card */}
          <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-2xl p-6 border border-paperwhite/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-trueturquoise" />
              </div>
              <h3 className="text-lg font-semibold text-paperwhite">Exercise Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-trueturquoise mb-2">What you need to do:</h4>
                <div className="bg-offblack/50 rounded-xl p-4 border border-paperwhite/10">
                  <p className="text-sm leading-relaxed text-paperwhite">{formData.brief}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-trueturquoise mb-2">Instructions & Guidelines:</h4>
                <div className="bg-offblack/50 rounded-xl p-4 border border-paperwhite/10">
                  <p className="text-sm leading-relaxed text-paperwhite whitespace-pre-line">{formData.instruction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Card */}
          <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-2xl p-6 border border-paperwhite/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                <FileTextIcon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-paperwhite">Reference Materials</h3>
            </div>
            <div className="bg-offblack/50 rounded-xl p-4 border border-paperwhite/10">
              {exercise.resources && exercise.resources.length > 0 ? (
                <div className="space-y-2">
                  {exercise.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-teallight">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>{resource}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-teallight">No reference materials provided for this exercise.</p>
              )}
            </div>
          </div>

          {/* Submission Section Card */}
          <div className="bg-gradient-to-r from-green-500/5 to-teallight/10 rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-teallight/20 rounded-xl flex items-center justify-center">
                <Link1Icon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-paperwhite">Submit Your Work</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-green-400 mb-2">
                  Main Submission Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={formData.submissionLink}
                  onChange={(e) => handleInputChange('submissionLink', e.target.value)}
                  className="w-full p-4 border border-green-500/30 bg-offblack/50 text-paperwhite rounded-xl focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition placeholder:text-teallight"
                  placeholder="https://your-project-link.com"
                  required
                />
                <p className="text-xs text-teallight mt-2">
                  This link is required to unlock the next level. Please provide a valid URL to your completed work.
                </p>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-green-400 mb-2">
                  Additional Links (Optional)
                </label>
                <div className="space-y-3">
                  {formData.referenceMaterials.map((material, index) => (
                    <input
                      key={index}
                      type="url"
                      value={material}
                      onChange={(e) => handleReferenceMaterialChange(index, e.target.value)}
                      className="w-full p-4 border border-green-500/30 bg-offblack/50 text-paperwhite rounded-xl focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition placeholder:text-teallight"
                      placeholder={`Additional link ${index + 1} (GitHub, demo, docs, etc.)`}
                    />
                  ))}
                </div>
                <p className="text-xs text-teallight mt-2">
                  You can add additional links to your work (e.g., GitHub repository, live demo, documentation).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-offblack/95 backdrop-blur-sm border-t border-paperwhite/20 p-6 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-teallight">
              <span className="text-red-400">*</span> Required field
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 text-paperwhite border border-paperwhite/20 rounded-xl hover:bg-paperwhite/10 transition-colors disabled:opacity-50 font-medium"
              >
                <Cross1Icon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.submissionLink.trim()}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-teallight text-offblack rounded-xl hover:from-green-600 hover:to-teallight/90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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