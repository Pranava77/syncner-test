import React from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  Pencil1Icon as EditIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FileTextIcon,
  ReaderIcon as BookOpenIcon,
  ClipboardIcon,
  PlayIcon,
  LayersIcon,
  StarIcon,
  ClockIcon,
  CheckCircledIcon,
  Cross1Icon,
  ChevronRightIcon
} from '@radix-ui/react-icons';

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: any[];
  test: any[];
  exercise: any[];
  order: number;
  isActive: boolean;
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
  readFirst?: any;
  learnExpanded?: boolean;
  testExpanded?: boolean;
  exerciseExpanded?: boolean;
}

interface LevelCardProps {
  level: Level;
  onEditLevel: (level: Level) => void;
  onDeleteLevel: (id: string) => void;
  onAddContent: (type: 'learn' | 'test' | 'exercise', level: Level) => void;
  onEditContent: (type: 'learn' | 'test' | 'exercise', item: any, index: number, level: Level) => void;
  onDeleteContent: (levelId: string, type: 'learn' | 'test' | 'exercise', index: number) => void;
  onToggleContentExpansion: (levelId: string, type: 'learn' | 'test' | 'exercise') => void;
  onMoveLevelUp: (track: string, currentOrder: number, targetOrder: number) => void;
  onMoveLevelDown: (track: string, currentOrder: number, targetOrder: number) => void;
  isReordering: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  onEditLevel,
  onDeleteLevel,
  onAddContent,
  onEditContent,
  onDeleteContent,
  onToggleContentExpansion,
  onMoveLevelUp,
  onMoveLevelDown,
  isReordering
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { backgroundColor: 'var(--color-success)', color: 'var(--color-text-inverse)' };
      case 'intermediate': return { backgroundColor: 'var(--color-warning)', color: 'var(--color-text-inverse)' };
      case 'advanced': return { backgroundColor: 'var(--color-error)', color: 'var(--color-text-inverse)' };
      default: return { backgroundColor: 'var(--color-text-muted)', color: 'var(--color-text-inverse)' };
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

  const getTrackLabel = (track: string) => {
    switch (track) {
      case 'full-stack': return 'Full Stack';
      case 'ai-ml': return 'AI/ML';
      case 'ui-ux': return 'UI/UX';
      case 'data-science': return 'Data Science';
      default: return track;
    }
  };

  const trackLevels = [level]; // This would need to be passed from parent
  const maxOrder = Math.max(...trackLevels.map((l: any) => l.order));

  return (
    <motion.div
      key={level.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
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
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ 
                    backgroundColor: getTrackColor(level.careerTrack),
                    color: 'var(--color-text-inverse)' 
                  }}
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
            onClick={() => onEditLevel(level)}
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
            onClick={() => onDeleteLevel(level.id)}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
            <TrashIcon className="h-4 w-4 inline mr-2" />
            Delete Level
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAddContent('learn', level)}
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
            onClick={() => onAddContent('test', level)}
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
            onClick={() => onAddContent('exercise', level)}
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
              onClick={() => onToggleContentExpansion(level.id, 'learn')}
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
                            onEditContent('learn', item, idx, level);
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
                            onDeleteContent(level.id, 'learn', idx);
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
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'var(--color-success-bg)',
                      color: 'var(--color-success)'
                    }}>
                    <BookOpenIcon className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-success)' }}>
                    No learning resources yet
                  </h4>
                  <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Create your first learning resource for this level
                  </p>
                  <button
                    onClick={() => onAddContent('learn', level)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                    <PlusIcon className="h-4 w-4" />
                    Add Learning Resource
                  </button>
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
              onClick={() => onToggleContentExpansion(level.id, 'test')}
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
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContent('test', item, idx, level);
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
                            onDeleteContent(level.id, 'test', idx);
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
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'var(--color-warning-bg)',
                      color: 'var(--color-warning)'
                    }}>
                    <ClipboardIcon className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-warning)' }}>
                    No test questions yet
                  </h4>
                  <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Create your first test question for this level
                  </p>
                  <button
                    onClick={() => onAddContent('test', level)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                    <PlusIcon className="h-4 w-4" />
                    Add Test Question
                  </button>
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
              onClick={() => onToggleContentExpansion(level.id, 'exercise')}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
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
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContent('exercise', item, idx, level);
                          }}
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Edit"
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
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContent(level.id, 'exercise', idx);
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
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'var(--color-accent-secondary-bg)',
                      color: 'var(--color-accent-secondary)'
                    }}>
                    <PlayIcon className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-accent-secondary)' }}>
                    No exercises yet
                  </h4>
                  <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Create your first exercise for this level
                  </p>
                  <button
                    onClick={() => onAddContent('exercise', level)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                    <PlusIcon className="h-4 w-4" />
                    Add Exercise
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LevelCard;
