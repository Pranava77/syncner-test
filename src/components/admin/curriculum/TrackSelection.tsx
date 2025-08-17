import React from 'react';
import { motion } from 'framer-motion';
import { 
  DesktopIcon, 
  RocketIcon, 
  ImageIcon, 
  BarChartIcon 
} from '@radix-ui/react-icons';

interface TrackSelectionProps {
  tracks: string[];
  trackCounts: Record<string, number>;
  onTrackSelect: (track: string) => void;
  successMessage?: string | null;
  error?: string | null;
}

const TrackSelection: React.FC<TrackSelectionProps> = ({
  tracks,
  trackCounts,
  onTrackSelect,
  successMessage,
  error
}) => {
  const getTrackIcon = (track: string) => {
    switch (track) {
      case 'full-stack': return <DesktopIcon className="h-8 w-8" />;
      case 'ai-ml': return <RocketIcon className="h-8 w-8" />;
      case 'ui-ux': return <ImageIcon className="h-8 w-8" />;
      case 'data-science': return <BarChartIcon className="h-8 w-8" />;
      default: return <DesktopIcon className="h-8 w-8" />;
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

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-heading mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Curriculum Management
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Select a career track to manage its training levels and content
            </p>
            {successMessage && (
              <div className="mt-3 p-3 rounded-lg text-sm font-medium" style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                color: 'var(--color-success)'
              }}>
                {successMessage}
              </div>
            )}
            {error && (
              <div className="mt-3 p-3 rounded-lg text-sm font-medium" style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track Selection Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tracks.map((track) => (
          <motion.div
            key={track}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              scale: 1.02,
              y: -4
            }}
            transition={{ duration: 0.2 }}
            className="group cursor-pointer"
            onClick={() => onTrackSelect(track)}
          >
            <div 
              className="relative h-full rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              {/* Background Pattern */}
              {/* Removed circular background pattern */}
              
              <div className="relative z-10 p-6 h-full flex flex-col items-center text-center">
                {/* Track Icon */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: getTrackColor(track),
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  {getTrackIcon(track)}
                </div>

                {/* Track Info */}
                <div className="flex-1 flex flex-col items-center">
                  <h3 
                    className="text-xl font-bold mb-3"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {getTrackLabel(track)}
                  </h3>
                  
                  <p 
                    className="text-sm mb-4 text-gray-600"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {trackCounts[track] || 0} levels available
                  </p>
                </div>

                {/* Level Count Badge */}
                <div 
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold w-full"
                  style={{
                    backgroundColor: getTrackColor(track),
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  {trackCounts[track] || 0} Levels
                </div>

                {/* Hover Indicator */}
                <div 
                  className="absolute bottom-0 left-0 w-full h-1 transition-all duration-300 group-hover:scaleX(1)"
                  style={{ 
                    backgroundColor: getTrackColor(track),
                    transform: 'scaleX(0)',
                    transformOrigin: 'left'
                  }}
                />
              </div>

              {/* Hover Effect */}
              <div 
                className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-5"
                style={{ backgroundColor: getTrackColor(track) }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default TrackSelection;
