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
  ClockIcon
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
      exit={{ opacity: 0, y: -20 }}
      className="group relative rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Level Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Level Number Badge */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                color: 'var(--color-text-inverse)'
              }}
            >
              <span className="text-2xl font-bold">{level.order}</span>
            </div>
            
            <div className="flex-1">
              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {level.title}
              </h3>
              <p 
                className="text-base leading-relaxed mb-3"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {level.description}
              </p>
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span 
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: getDifficultyColor(level.difficulty),
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
                </span>
                
                <span 
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: getTrackColor(level.careerTrack),
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  {getTrackLabel(level.careerTrack)}
                </span>
                
                <span 
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: level.isActive ? 'var(--color-success)' : 'var(--color-error)',
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  {level.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Level Reorder Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div 
                className="px-3 py-1 rounded-lg text-sm font-medium text-center min-w-[60px]"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
              >
                #{level.order}
              </div>
              <div 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--color-tertiary-bg)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                of {trackLevels.length}
              </div>
            </div>
            
            <button
              onClick={() => onMoveLevelUp(level.careerTrack, level.order, level.order - 1)}
              disabled={isReordering || level.order === 1}
              className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isReordering && level.order !== 1) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = 'var(--color-text-inverse)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isReordering && level.order !== 1) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                  e.currentTarget.style.color = 'var(--color-accent-primary)';
                }
              }}
            >
                                        <ChevronUpIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onMoveLevelDown(level.careerTrack, level.order, level.order + 1)}
              disabled={isReordering || level.order >= maxOrder}
              className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isReordering && level.order < maxOrder) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = 'var(--color-text-inverse)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isReordering && level.order < maxOrder) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                  e.currentTarget.style.color = 'var(--color-accent-primary)';
                }
              }}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Skills Section */}
        {level.skills && level.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {level.skills.slice(0, 8).map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--color-accent-tertiary)',
                    color: 'var(--color-accent-primary)'
                  }}
                >
                  {skill}
                </span>
              ))}
              {level.skills.length > 8 && (
                <span 
                  className="px-3 py-1 rounded text-xs font-medium"
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
        
        {/* Content Summary Cards */}
        <div className="grid gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                  {level.learn?.length || 0}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Learning Resources</div>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2">
                <ClipboardIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                  {level.test?.length || 0}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Test Questions</div>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2">
                <PlayIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                  {level.exercise?.length || 0}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Exercises</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onEditLevel(level)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
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
                <EditIcon className="h-4 w-4" />
                Edit Level
              </button>
              
              <button
                onClick={() => onDeleteLevel(level.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
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
                Delete Level
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onAddContent('learn', level)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = 'var(--color-text-inverse)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                  e.currentTarget.style.color = 'var(--color-accent-primary)';
                }}
              >
                <PlusIcon className="h-3 w-3" />
                Add Learn
              </button>
              
              <button
                onClick={() => onAddContent('test', level)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = 'var(--color-text-inverse)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                  e.currentTarget.style.color = 'var(--color-accent-primary)';
                }}
              >
                <PlusIcon className="h-3 w-3" />
                Add Test
              </button>
              
              <button
                onClick={() => onAddContent('exercise', level)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-accent-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = 'var(--color-text-inverse)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                  e.currentTarget.style.color = 'var(--color-accent-primary)';
                }}
              >
                <PlusIcon className="h-3 w-3" />
                Add Exercise
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LevelCard;
