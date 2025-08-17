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

// Import new components
import {
  TrackSelection,
  SearchAndFilters,
  LevelCard,
  ContentManagement,
  LevelModal,
  ContentModal,
  ContentSection
} from '../components/admin/curriculum';

// Import hooks directly
import useCurriculumManagement from '../hooks/useCurriculumManagement';
import useContentManagement from '../hooks/useContentManagement';
import useLevelReordering from '../hooks/useLevelReordering';
import LoadingModal from '../components/LoadingModal';

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

interface EditingLevel extends LevelForm {
  id: string;
}

const AdminCurriculum: React.FC = () => {
  const dispatch = useAppDispatch();

  // Use custom hooks
  const {
    levels,
    loading,
    error,
    successMessage,
    selectedTrack,
    activeTrack,
    showTrackSelection,
    trackCounts,
    lastUpdated,
    isRefetching,
    refetchMessage,
    tracks,
    fetchLevels,
    handleTrackSelect,
    handleBackToTracks,
    showSuccessMessage,
    clearError,
    setLevels,
    setLoading,
    setError,
    setSuccessMessage,
    setIsRefetching,
    setRefetchMessage,
    normalizeTrack,
    setSelectedTrack
  } = useCurriculumManagement();

  const {
    showContentModal,
    editingContent,
    contentForm,
    isSubmittingContent,
    contentFormError,
    handleAddContent,
    handleEditContent,
    handleContentSubmit,
    handleDeleteContent,
    handleCloseContentModal,
    setShowContentModal,
    setContentForm,
    setContentFormError,
    getDefaultContentForm,
    resetContentForm,
    ensureTestOptions
  } = useContentManagement();

  const {
    isReordering,
    reorderError,
    moveLevelUp,
    moveLevelDown,
    clearReorderError
  } = useLevelReordering();

  // Local state
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EditingLevel | null>(null);
  const [levelForm, setLevelForm] = useState<LevelForm>({
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
  });
  const [isSubmittingLevel, setIsSubmittingLevel] = useState(false);
  const [formError, setFormError] = useState('');
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newSkill, setNewSkill] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  // Filtered levels
  const filteredLevels = levels.filter(level => {
    const matchesSearch = !searchTerm || 
      level.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = filterDifficulty === 'all' || level.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? level.isActive : !level.isActive);
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // Utility functions
  const getTrackLabel = (track: string) => {
    switch (track) {
      case 'full-stack': return 'Full Stack';
      case 'ai-ml': return 'AI/ML';
      case 'ui-ux': return 'UI/UX';
      case 'data-science': return 'Data Science';
      default: return track;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--color-success)';
      case 'intermediate': return 'var(--color-warning)';
      case 'advanced': return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'full-stack': return 'var(--color-accent-primary)';
      case 'ai-ml': return 'var(--color-accent-secondary)';
      case 'ui-ux': return 'var(--color-accent-tertiary)';
      case 'data-science': return 'var(--color-warning)';
      default: return 'var(--color-accent-primary)';
    }
  };

  // Level management functions
  const handleCreateLevel = () => {
    setEditingLevel(null);
    setLevelForm({
      title: '',
      description: '',
      difficulty: 'beginner',
      duration: '',
      careerTrack: selectedTrack || 'full-stack',
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
    });
    setFormError('');
    setShowLevelModal(true);
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel({
      id: level.id,
      title: level.title,
      description: level.description,
      difficulty: level.difficulty,
      duration: level.duration,
      careerTrack: level.careerTrack,
      skills: level.skills,
      prerequisites: level.prerequisites,
      estimatedHours: level.estimatedHours,
      isActive: level.isActive,
      order: level.order,
      readFirst: level.readFirst
    });
    setFormError('');
    setShowLevelModal(true);
  };

  const handleLevelSubmit = async (formData: LevelForm) => {
    try {
      setLoadingOpen(true);
      setLoadingMessage(editingLevel ? 'Updating level...' : 'Creating level...');
      setIsSubmittingLevel(true);
      setFormError('');

      if (editingLevel) {
        // Update existing level
        const response = await apiService.put(`/curriculum/${editingLevel.id}`, formData);
        
        if (response.success) {
        dispatch(clearCache());
          window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'level-updated' } }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required'));
          setShowLevelModal(false);
        showSuccessMessage('Level updated successfully');
      } else {
          setFormError(response.message || 'Failed to update level');
        }
      } else {
        // Create new level - align with backend schema requirements
        const newLevelData = {
          // required
          title: formData.title,
          description: formData.description,
          type: 'syllabus',
          careerTrack: formData.careerTrack,
          // required by schema: content
          content: (formData.description && formData.description.trim().length >= 10)
            ? formData.description
            : `${formData.title} overview`,
          // optional / mapped fields
          order: (levels.length + 1),
          isActive: formData.isActive,
          difficulty: formData.difficulty || 'beginner',
          estimatedDuration: Math.max(30, Math.round((formData.estimatedHours || 1) * 60)),
          tags: formData.skills || [],
          prerequisites: formData.prerequisites || [],
          readFirst: formData.readFirst || {}
        };

        const response = await apiService.createCurriculumItem(newLevelData);
        
        if (response.success) {
          dispatch(clearCache());
          window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'level-created' } }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required'));
          setShowLevelModal(false);
        showSuccessMessage('Level created successfully');
        } else {
          setFormError(response.message || 'Failed to create level');
        }
      }
    } catch (error) {
      console.error('Error submitting level:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormError(errorMessage);
    } finally {
      setIsSubmittingLevel(false);
      setLoadingOpen(false);
      setLoadingMessage('');
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this level? This action cannot be undone.')) {
      try {
        setLoadingOpen(true);
        setLoadingMessage('Deleting level...');
        const response = await apiService.delete(`/curriculum/${id}`);
        
        if (response.success) {
          dispatch(clearCache());
          window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'level-deleted' } }));
          window.dispatchEvent(new CustomEvent('levels-refresh-required'));
          showSuccessMessage('Level deleted successfully');
          } else {
          setError(response.message || 'Failed to delete level');
        }
      } catch (error) {
        console.error('Error deleting level:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setLoadingOpen(false);
        setLoadingMessage('');
      }
    }
  };

  // Content management functions
  const handleToggleContentExpansion = (levelId: string, type: 'learn' | 'test' | 'exercise') => {
    setLevels(prevLevels => 
      prevLevels.map(level => 
        level.id === levelId 
          ? { ...level, [`${type}Expanded`]: !level[`${type}Expanded`] }
          : level
      )
    );
  };

  // Level reordering functions
  const handleMoveLevelUp = async (track: string, currentOrder: number, targetOrder: number) => {
    setLoadingOpen(true);
    setLoadingMessage('Reordering levels...');
    const result = await moveLevelUp(track, currentOrder, targetOrder);
    if (result.success) {
      showSuccessMessage(result.message);
    } else {
      setError(result.message);
    }
    setLoadingOpen(false);
    setLoadingMessage('');
  };

  const handleMoveLevelDown = async (track: string, currentOrder: number, targetOrder: number) => {
    setLoadingOpen(true);
    setLoadingMessage('Reordering levels...');
    const result = await moveLevelDown(track, currentOrder, targetOrder);
    if (result.success) {
      showSuccessMessage(result.message);
    } else {
      setError(result.message);
    }
    setLoadingOpen(false);
    setLoadingMessage('');
  };

  // Initialize on mount
  useEffect(() => {
    if (selectedTrack) {
      fetchLevels(selectedTrack);
    }
  }, [selectedTrack, fetchLevels]);

  // Refresh levels when content/levels change elsewhere
  useEffect(() => {
    const refresh = () => {
      if (selectedTrack) {
        fetchLevels(selectedTrack);
      }
    };
    window.addEventListener('levels-refresh-required', refresh as EventListener);
    window.addEventListener('curriculum-changed', refresh as EventListener);
    return () => {
      window.removeEventListener('levels-refresh-required', refresh as EventListener);
      window.removeEventListener('curriculum-changed', refresh as EventListener);
    };
  }, [selectedTrack, fetchLevels]);

    return (
      <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full">
          {showTrackSelection ? (
            // Track Selection View
            <TrackSelection
              tracks={tracks}
              trackCounts={trackCounts}
              onTrackSelect={handleTrackSelect}
              successMessage={successMessage}
              error={error}
            />
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
                    </div>

                  <div className="flex items-center gap-4">
                  <button
                      onClick={handleCreateLevel}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
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
                  </div>
                  
              {/* Search and Filters */}
              <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterTrack={selectedTrack || 'all'}
                onFilterTrackChange={(value) => setSelectedTrack(value === 'all' ? null : value)}
                filterDifficulty={filterDifficulty}
                onFilterDifficultyChange={setFilterDifficulty}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
                onClearFilters={() => {
                  setSearchTerm('');
                  setFilterDifficulty('all');
                  setFilterStatus('all');
                  setSelectedTrack(null);
                }}
                tracks={tracks}
                difficulties={['beginner', 'intermediate', 'advanced']}
                statuses={['all', 'active', 'inactive']}
              />

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
                    <button 
                    onClick={handleCreateLevel}
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
                    Create Level
                    </button>
                </div>
              ) : (
                <div className="space-y-6">
                    {filteredLevels.map((level, index) => (
                    <LevelCard
                      key={level.id}
                      level={level}
                      levels={filteredLevels}
                      onEditLevel={handleEditLevel}
                      onDeleteLevel={handleDeleteLevel}
                      onAddContent={handleAddContent}
                      onEditContent={handleEditContent}
                      onDeleteContent={handleDeleteContent}
                      onToggleContentExpansion={handleToggleContentExpansion}
                      onMoveLevelUp={handleMoveLevelUp}
                      onMoveLevelDown={handleMoveLevelDown}
                      isReordering={isReordering}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <LevelModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        onSubmit={handleLevelSubmit}
        editingLevel={editingLevel}
        isSubmitting={isSubmittingLevel}
        formError={formError}
        tracks={tracks}
      />

      <ContentModal
        isOpen={showContentModal}
        onClose={handleCloseContentModal}
        onSubmit={handleContentSubmit}
        editingContent={editingContent}
        isSubmitting={isSubmittingContent}
        formError={contentFormError}
        level={editingContent?.level || (editingContent?.item?.levelId ? levels.find(l => l.id === editingContent.item?.levelId) || null : null)}
      />
      <LoadingModal open={loadingOpen} message={loadingMessage} />
    </div>
  );
};

export default AdminCurriculum; 