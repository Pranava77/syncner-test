import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  Pencil1Icon as EditIcon, 
  TrashIcon, 
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  ReaderIcon as BookOpenIcon,
  ClipboardIcon,
  PlayIcon,
  ExternalLinkIcon
} from '@radix-ui/react-icons';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  externalLink?: string;
  options?: string[];
  answer?: string;
  description?: string;
  resources?: string[];
  order: number;
}

interface Level {
  id: string;
  title: string;
  learn: ContentItem[];
  test: ContentItem[];
  exercise: ContentItem[];
  learnExpanded?: boolean;
  testExpanded?: boolean;
  exerciseExpanded?: boolean;
}

interface ContentManagementProps {
  level: Level;
  onToggleContentExpansion: (levelId: string, type: 'learn' | 'test' | 'exercise') => void;
  onAddContent: (type: 'learn' | 'test' | 'exercise', level: Level) => void;
  onEditContent: (type: 'learn' | 'test' | 'exercise', item: ContentItem, index: number, level: Level) => void;
  onDeleteContent: (levelId: string, type: 'learn' | 'test' | 'exercise', index: number) => void;
  deletingContentId?: string | null;
}

const ContentManagement: React.FC<ContentManagementProps> = ({
  level,
  onToggleContentExpansion,
  onAddContent,
  onEditContent,
  onDeleteContent,
  deletingContentId
}) => {
  const getContentTypeIcon = (type: 'learn' | 'test' | 'exercise') => {
    switch (type) {
      case 'learn': return <BookOpenIcon className="h-5 w-5" />;
      case 'test': return <ClipboardIcon className="h-5 w-5" />;
      case 'exercise': return <PlayIcon className="h-5 w-5" />;
      default: return <FileTextIcon className="h-5 w-5" />;
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

  const getContentTypeLabel = (type: 'learn' | 'test' | 'exercise') => {
    switch (type) {
      case 'learn': return 'Learning Resources';
      case 'test': return 'Test Questions';
      case 'exercise': return 'Exercises';
      default: return 'Content';
    }
  };

  const renderContentItem = (item: ContentItem, index: number, type: 'learn' | 'test' | 'exercise') => {
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="group relative rounded-xl border p-4 transition-all duration-200 hover:shadow-md"
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
        {/* Content Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 
              className="font-semibold text-sm mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {item.title}
            </h4>
            
            {/* Content Preview */}
            {type === 'learn' && item.externalLink && (
              <div className="flex items-center gap-2 text-xs">
                <ExternalLinkIcon className="h-3 w-3" style={{ color: 'var(--color-accent-primary)' }} />
                <span 
                  className="truncate break-all"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title={item.externalLink}
                >
                  {item.externalLink}
                </span>
              </div>
            )}
            
            {type === 'test' && item.options && (
              <div className="grid grid-cols-2 gap-1 mt-2">
                {item.options.slice(0, 4).map((option: string, optIdx: number) => (
                  <div
                    key={optIdx}
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: optIdx === 0 ? 'var(--color-accent-primary)' :
                                        optIdx === 1 ? 'var(--color-accent-secondary)' :
                                        optIdx === 2 ? 'var(--color-warning)' :
                                        'var(--color-error)',
                        color: 'var(--color-text-inverse)'
                      }}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="truncate">{option}</span>
                  </div>
                ))}
              </div>
            )}
            
            {type === 'exercise' && item.description && (
              <p 
                className="text-xs mt-2 line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.description}
              </p>
            )}
          </div>
          
          {/* Order Badge */}
          <div 
            className="ml-3 px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: getContentTypeColor(type),
              color: 'var(--color-text-inverse)'
            }}
          >
            #{item.order}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <button
            onClick={() => onEditContent(type, item, index, level)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105"
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
            <EditIcon className="h-3 w-3" />
            Edit
          </button>
          
          <button
            onClick={() => onDeleteContent(level.id, type, index)}
            disabled={deletingContentId === item.id}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'var(--color-text-inverse)'
            }}
            onMouseEnter={(e) => {
              if (deletingContentId !== item.id) {
                e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (deletingContentId !== item.id) {
                e.currentTarget.style.backgroundColor = 'var(--color-error)';
              }
            }}
          >
            {deletingContentId === item.id ? (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <TrashIcon className="h-3 w-3" />
            )}
            {deletingContentId === item.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderContentSection = (type: 'learn' | 'test' | 'exercise') => {
    const content = level[type] || [];
    const isExpanded = level[`${type}Expanded`] || false;
    const typeColor = getContentTypeColor(type);
    const typeIcon = getContentTypeIcon(type);
    const typeLabel = getContentTypeLabel(type);

    return (
      <div className="mb-6">
        {/* Section Header */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
          onClick={() => onToggleContentExpansion(level.id, type)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = typeColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: typeColor,
                color: 'var(--color-text-inverse)'
              }}
            >
              {typeIcon}
            </div>
            
            <div>
              <h3 
                className="font-semibold text-lg"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {typeLabel}
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {content.length} {content.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddContent(type, level);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: typeColor,
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = typeColor;
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
            
            <div 
              className="w-6 h-6 rounded flex items-center justify-center transition-transform duration-200"
              style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                color: 'var(--color-accent-primary)'
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
        
        {/* Content Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-3"
            >
              {content.length === 0 ? (
                <div 
                  className="text-center py-8 rounded-xl border-2 border-dashed"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border-subtle)'
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    {typeIcon}
                  </div>
                  <h4 
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    No {type} content yet
                  </h4>
                  <p 
                    className="mb-4"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Create your first {type} item for this level
                  </p>
                  <button
                    onClick={() => onAddContent(type, level)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: typeColor,
                      color: 'var(--color-text-inverse)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = typeColor;
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add {type.charAt(0).toUpperCase() + type.slice(1)} Content
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {content.map((item, index) => renderContentItem(item, index, type))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContentSection('learn')}
      {renderContentSection('test')}
      {renderContentSection('exercise')}
    </div>
  );
};

export default ContentManagement;
