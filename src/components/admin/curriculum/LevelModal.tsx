import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cross1Icon,
  PlusIcon
} from '@radix-ui/react-icons';

interface ReadFirst {
  brief?: string;
  whyLearn?: string;
  whereUsed?: string;
  customExample?: string;
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

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LevelForm) => void;
  editingLevel?: LevelForm | null;
  isSubmitting: boolean;
  formError: string;
  tracks: string[];
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

const LevelModal: React.FC<LevelModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingLevel,
  isSubmitting,
  formError,
  tracks
}) => {
  const [form, setForm] = useState<LevelForm>(defaultLevelForm);
  const [newSkill, setNewSkill] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  useEffect(() => {
    if (editingLevel) {
      setForm(editingLevel);
    } else {
      setForm(defaultLevelForm);
    }
  }, [editingLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleClose = () => {
    setForm(defaultLevelForm);
    onClose();
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !form.prerequisites.includes(newPrerequisite.trim())) {
      setForm({ ...form, prerequisites: [...form.prerequisites, newPrerequisite.trim()] });
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisite: string) => {
    setForm({ ...form, prerequisites: form.prerequisites.filter(p => p !== prerequisite) });
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

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return difficulty;
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
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
              {editingLevel ? 'Edit Level' : 'Create New Level'}
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
                  Level Title *
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
                  placeholder="Enter level title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Career Track *
                </label>
                <select
                  value={form.careerTrack}
                  onChange={(e) => setForm({ ...form, careerTrack: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  required
                >
                  {tracks.map((track) => (
                    <option key={track} value={track}>
                      {getTrackLabel(track)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Difficulty *
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Duration *
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="e.g., 2-3 hours, 1 week"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Estimated Hours *
                </label>
                <input
                  type="number"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="mr-2 w-4 h-4"
                    style={{ accentColor: 'var(--color-accent-primary)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Active Level
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
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
                placeholder="Describe what this level covers and what students will learn"
                required
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Skills Covered
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
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
                {form.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    {skill}
                                                    <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                                >
                                  <Cross1Icon className="h-3 w-3" />
                                </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Prerequisites
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Add a prerequisite"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <button
                  type="button"
                  onClick={addPrerequisite}
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
                {form.prerequisites.map((prerequisite, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    {prerequisite}
                                                    <button
                                  type="button"
                                  onClick={() => removePrerequisite(prerequisite)}
                                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                                >
                                  <Cross1Icon className="h-3 w-3" />
                                </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Read First Section */}
            <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Read First (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Brief Overview
                  </label>
                  <textarea
                    value={form.readFirst?.brief || ''}
                    onChange={(e) => setForm({ 
                      ...form, 
                      readFirst: { ...form.readFirst, brief: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Brief overview of the topic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Why Learn This?
                  </label>
                  <textarea
                    value={form.readFirst?.whyLearn || ''}
                    onChange={(e) => setForm({ 
                      ...form, 
                      readFirst: { ...form.readFirst, whyLearn: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Why is this important to learn?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Where Is It Used?
                  </label>
                  <textarea
                    value={form.readFirst?.whereUsed || ''}
                    onChange={(e) => setForm({ 
                      ...form, 
                      readFirst: { ...form.readFirst, whereUsed: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Real-world applications and use cases"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Custom Example
                  </label>
                  <textarea
                    value={form.readFirst?.customExample || ''}
                    onChange={(e) => setForm({ 
                      ...form, 
                      readFirst: { ...form.readFirst, customExample: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="A practical example or analogy"
                  />
                </div>
              </div>
            </div>

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
                {isSubmitting ? 'Saving...' : (editingLevel ? 'Update Level' : 'Create Level')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelModal;
