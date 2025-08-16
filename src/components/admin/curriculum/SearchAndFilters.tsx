import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon 
} from '@radix-ui/react-icons';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterTrack: string;
  onFilterTrackChange: (value: string) => void;
  filterDifficulty: string;
  onFilterDifficultyChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  onClearFilters: () => void;
  tracks: string[];
  difficulties: string[];
  statuses: string[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterTrack,
  onFilterTrackChange,
  filterDifficulty,
  onFilterDifficultyChange,
  filterStatus,
  onFilterStatusChange,
  onClearFilters,
  tracks,
  difficulties,
  statuses
}) => {
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
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'all': return 'All Statuses';
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  return (
    <div className="mb-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="relative group">
          <div 
            className="absolute inset-0 rounded-2xl border-2 shadow-sm transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
          />
          <div 
            className="relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
          >
            <MagnifyingGlassIcon 
              className="h-5 w-5 transition-colors duration-200"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search levels..."
              className="flex-1 bg-transparent outline-none text-sm transition-colors duration-200"
              style={{ color: 'var(--color-text-primary)' }}
              onFocus={(e) => {
                e.currentTarget.parentElement!.style.borderColor = 'var(--color-accent-primary)';
                e.currentTarget.parentElement!.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                e.currentTarget.parentElement!.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.currentTarget.parentElement!.style.borderColor = 'var(--color-border)';
                e.currentTarget.parentElement!.style.boxShadow = 'none';
                e.currentTarget.parentElement!.style.transform = 'translateY(0)';
              }}
            />
          </div>
        </div>

        {/* Track Filter */}
        <div className="relative group">
          <div 
            className="absolute inset-0 rounded-2xl border-2 shadow-sm transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
          />
          <div 
            className="relative flex items-center justify-between px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span 
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {filterTrack === 'all' ? 'All Tracks' : getTrackLabel(filterTrack)}
            </span>
            <ChevronDownIcon 
              className="h-4 w-4 transition-colors duration-200"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <select
              value={filterTrack}
              onChange={(e) => onFilterTrackChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="all">All Tracks</option>
              {tracks.map((track) => (
                <option key={track} value={track}>
                  {getTrackLabel(track)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="relative group">
          <div 
            className="absolute inset-0 rounded-2xl border-2 shadow-sm transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
          />
          <div 
            className="relative flex items-center justify-between px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span 
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {filterDifficulty === 'all' ? 'All Difficulties' : getDifficultyLabel(filterDifficulty)}
            </span>
            <ChevronDownIcon 
              className="h-4 w-4 transition-colors duration-200"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <select
              value={filterDifficulty}
              onChange={(e) => onFilterDifficultyChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {getDifficultyLabel(difficulty)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <div 
            className="absolute inset-0 rounded-2xl border-2 shadow-sm transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
          />
          <div 
            className="relative flex items-center justify-between px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span 
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {getStatusLabel(filterStatus)}
            </span>
            <ChevronDownIcon 
              className="h-4 w-4 transition-colors duration-200"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(searchTerm || filterTrack !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all') && (
        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-accent-tertiary)',
              color: 'var(--color-accent-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              e.currentTarget.style.color = 'var(--color-text-inverse)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
              e.currentTarget.style.color = 'var(--color-accent-primary)';
            }}
          >
            Clear Filters
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
