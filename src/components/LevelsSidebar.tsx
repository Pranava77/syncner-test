import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { ChevronRightIcon, ChevronDownIcon, ReaderIcon, ClipboardIcon, Pencil2Icon, LayersIcon, LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import { useLevels } from '../hooks/useLevels';
import { motion } from 'framer-motion';
import syncnerLogo from '../assets/syncner-logo.png';

interface Level {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
  careerTrack: string;
  learn: any[];
  test: any[];
  exercise: any[];
  isUnlocked?: boolean;
  isCompleted?: boolean;
  completedSections?: {
    learn?: boolean;
    test?: boolean;
    exercise?: boolean;
  };
}

interface LevelsSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  currentLevel?: string;
  currentSection?: string;
  refreshTrigger?: number;
  onRefresh?: () => void;
}

const LevelsSidebar: React.FC<LevelsSidebarProps> = ({
  sidebarOpen = true,
  setSidebarOpen,
  currentLevel,
  currentSection,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  
  // Use the optimized hook
  const { levels, loading, error, refetch, updateLevelSectionStatus } = useLevels(user?.careerTrack);

  // Memoized level completion map for efficient lookups (only for current user's track)
  const levelCompletionMap = useMemo(() => {
    const map = new Map();
    levels.forEach((level: Level) => {
      // Only include levels from the current user's career track
      if (level.careerTrack === user?.careerTrack) {
        map.set(level.order, {
          id: level.id,
          completedSections: level.completedSections || {},
          isCompleted: level.isCompleted || false,
          isUnlocked: level.isUnlocked || false
        });
      }
    });
    return map;
  }, [levels, user?.careerTrack]);

  // Memoized levels with unlock logic
  const levelsWithUnlockLogic = useMemo(() => {
    // Filter levels for current user's track only
    const currentTrackLevels = levels.filter((level: Level) => level.careerTrack === user?.careerTrack);
    
    // Only process levels for the current user's track
    return currentTrackLevels.map((level: Level) => {
      // Level 1 is always unlocked for the correct track
      if (level.order === 1) {
        return {
          ...level,
          isUnlocked: true
        };
      }

      // Check if previous level is fully completed (only for the same track)
      // Find the previous level within the same track
      const previousLevelInTrack = currentTrackLevels.find(l => l.order === level.order - 1);
      
      if (!previousLevelInTrack) {
        // If there's no previous level in this track, this level should be unlocked
        return {
          ...level,
          isUnlocked: true
        };
      }

      const previousCompletedSections = previousLevelInTrack.completedSections || {};
      
      const isPreviousFullyCompleted = 
        previousCompletedSections.learn === true && 
        previousCompletedSections.test === true && 
        previousCompletedSections.exercise === true;

      return {
        ...level,
        isUnlocked: isPreviousFullyCompleted
      };
    });
  }, [levels, user?.careerTrack]);

  // Handle progress updates from other components
  const handleProgressUpdate = useCallback(() => {
    refetch();
    if (onRefresh) onRefresh();
  }, [refetch, onRefresh]);

  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === 'level-progress-updated') {
      handleProgressUpdate();
    }
  }, [handleProgressUpdate]);

  useEffect(() => {
    window.addEventListener('progress-updated', handleProgressUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleProgressUpdate, handleStorageChange]);

  // Auto-expand current level
  useEffect(() => {
    if (currentLevel) {
      setExpandedLevels(prev => new Set([...prev, currentLevel]));
    }
  }, [currentLevel]);

  const toggleLevelExpansion = (levelId: string) => {
    // Find the level to check if it belongs to the current user's track
    const level = levelsWithUnlockLogic.find(l => l.id === levelId);
    if (!level) {
      console.error('Level not found or not from current track:', levelId);
      return;
    }

    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const isLevelExpanded = (levelId: string) => expandedLevels.has(levelId);

  const handleLevelClick = (level: Level, section: string) => {
    if (!level.isUnlocked) {
      console.log('Level is locked:', level.order);
      return;
    }

    // Since we're only processing levels from the current track, this check is redundant but kept for safety
    if (level.careerTrack !== user?.careerTrack) {
      console.error('Level track mismatch:', { levelTrack: level.careerTrack, userTrack: user?.careerTrack });
      return;
    }
    
    console.log('Navigating to:', `/student/training/${level.id}/${section}`, { levelTrack: level.careerTrack, userTrack: user?.careerTrack });
    navigate(`/student/training/${level.id}/${section}`);
    if (setSidebarOpen) setSidebarOpen(false);
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'learn': return <ReaderIcon className="h-4 w-4" />;
      case 'test': return <ClipboardIcon className="h-4 w-4" />;
      case 'exercise': return <Pencil2Icon className="h-4 w-4" />;
      default: return <LayersIcon className="h-4 w-4" />;
    }
  };

  const getSectionStatus = (level: Level, section: string) => {
    const completedSections = level.completedSections || {};
    return completedSections[section as keyof typeof completedSections] === true;
  };

  if (loading) {
    return (
      <div className={`bg-offblack border-r border-paperwhite/10 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}>
        <div className={`flex-1 flex flex-col relative ${sidebarOpen ? 'py-24 pl-2' : 'py-2'}`}>
          {sidebarOpen && (
            <div className="flex items-center justify-between mb-4 transition-opacity duration-200">
              <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2">
                <LayersIcon className="h-5 w-5 text-trueturquoise" /> 
                Loading...
              </h2>
            </div>
          )}
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-paperwhite/10 rounded"></div>
                <div className="space-y-1 ml-4">
                  <div className="h-4 bg-paperwhite/5 rounded"></div>
                  <div className="h-4 bg-paperwhite/5 rounded"></div>
                  <div className="h-4 bg-paperwhite/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-offblack border-r border-paperwhite/10 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}>
        <div className={`flex-1 flex flex-col relative ${sidebarOpen ? 'py-24 pl-2' : 'py-2'}`}>
          {sidebarOpen && (
            <div className="flex items-center justify-between mb-4 transition-opacity duration-200">
              <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2">
                <LayersIcon className="h-5 w-5 text-trueturquoise" /> 
                Error
              </h2>
            </div>
          )}
          <div className="text-red-400 text-sm">Error loading levels: {error}</div>
          <button 
            onClick={refetch}
            className="mt-2 text-trueturquoise hover:text-teallight text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`relative h-full flex flex-col border-r border-paperwhite/20 bg-offblack transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-16'}`}
      style={{ minWidth: sidebarOpen ? '18rem' : '4rem' }}
    >
      {/* Toggle Button - vertical center, right edge */}
      {setSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 -right-4 z-20 bg-offblack border border-paperwhite/20 shadow-lg p-1 rounded-xl hover:bg-trueturquoise/10 transition`}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
        >
          <ChevronRightIcon className={`h-5 w-5 text-trueturquoise transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
      {/* Sidebar Content */}
      <div className={`flex-1 flex flex-col relative ${sidebarOpen ? 'py-24 pl-2' : 'py-2'}`}>
        {/* Header - Only visible when open */}
        {sidebarOpen && (
          <div className="flex items-center justify-between mb-4 transition-opacity duration-200">
            <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2">
              <LayersIcon className="h-5 w-5 text-trueturquoise" /> 
              {loading ? 'Loading...' : `Levels (${levelsWithUnlockLogic.length})`}
            </h2>
          </div>
        )}
        
        {/* Closed Sidebar Modern Design */}
        {!sidebarOpen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Vertical Level Indicators */}
            <div className="flex flex-col items-center space-y-3">
              {levelsWithUnlockLogic.slice(0, 6).map((level, index) => (
                <div
                  key={level.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentLevel === level.id
                      ? 'bg-trueturquoise text-offblack shadow-lg shadow-trueturquoise/30'
                      : level.isUnlocked
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-paperwhite/10 text-teallight/50 border border-paperwhite/20'
                  }`}
                  title={`Level ${level.order}: ${level.title}`}
                >
                  {level.order}
                </div>
              ))}
              {levelsWithUnlockLogic.length > 6 && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-paperwhite/10 text-teallight/50 border border-paperwhite/20">
                  +{levelsWithUnlockLogic.length - 6}
                </div>
              )}
            </div>
            
            {/* Progress Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-16 bg-paperwhite/10 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-t from-trueturquoise to-teallight transition-all duration-500"
                  style={{ 
                    height: `${Math.min((levelsWithUnlockLogic.filter(l => l.isUnlocked).length / levelsWithUnlockLogic.length) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Levels Navigation - Only visible when open */}
        {sidebarOpen && (
          <nav className="flex-1 space-y-4 overflow-y-auto scroll-smooth">
          {loading ? (
            <div className="text-center py-8">
              <motion.img
                src={syncnerLogo}
                alt="Syncner Logo"
                className="w-8 h-8 mx-auto mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              <p className="text-xs text-teallight">Loading levels...</p>
            </div>
          ) : levelsWithUnlockLogic.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-teallight">
                {user?.careerTrack ? 
                  `No levels for ${user.careerTrack} track` :
                  'No levels available'
                }
              </p>
            </div>
          ) : (
                        levelsWithUnlockLogic.map((level) => (
              <div key={level.id} className="border-b border-paperwhite/10 last:border-b-0">
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      if (level.isUnlocked) {
                        toggleLevelExpansion(level.id);
                      } else {
                        alert('This level is locked. Complete the previous level\'s exercise to unlock it.');
                      }
                    }}
                    className={`w-full flex items-center py-2 transition-colors text-sm font-${currentLevel === level.id ? 'semibold' : 'normal'} text-left
                      ${currentLevel === level.id ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 
                        level.isUnlocked ? 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise' : 
                        'text-teallight/50 cursor-not-allowed'}`}
                    style={{ borderRadius: 0 }}
                    disabled={!level.isUnlocked}
                  >
                    {level.isUnlocked ? (
                      <LockOpen1Icon className={`h-5 w-5 mr-2 ${currentLevel === level.id ? 'text-trueturquoise' : 'text-green-400'}`} />
                    ) : (
                      <LockClosedIcon className="h-5 w-5 mr-2 text-teallight/50" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">
                        Level {level.order}
                      </div>
                      <div className="text-xs text-teallight truncate">{level.title}</div>
                      <div className="text-xs text-teallight/60 flex items-center gap-2 mt-1">
                        <span>{level.learn?.length || 0} learn</span>
                        <span>{level.test?.length || 0} test</span>
                        <span>{level.exercise?.length || 0} exercise</span>
                      </div>
                    </div>
                    {level.isUnlocked && (
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-teallight transition-transform duration-200 mr-2 ${
                          isLevelExpanded(level.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                </div>
                {sidebarOpen && level.isUnlocked && isLevelExpanded(level.id) && (
                <div className="ml-2 mt-2 flex flex-col space-y-1 border-l border-paperwhite/10 pl-2">
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentLevel === level.id && currentSection === 'learn' ? 'semibold' : 'normal'}
                      ${currentLevel === level.id && currentSection === 'learn' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => handleLevelClick(level, 'learn')}
                  >
                    <ReaderIcon className={`h-4 w-4 ${currentLevel === level.id && currentSection === 'learn' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Learn ({level.learn?.length || 0})
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentLevel === level.id && currentSection === 'test' ? 'semibold' : 'normal'}
                      ${currentLevel === level.id && currentSection === 'test' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => handleLevelClick(level, 'test')}
                  >
                    <ClipboardIcon className={`h-4 w-4 ${currentLevel === level.id && currentSection === 'test' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Test ({level.test?.length || 0})
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentLevel === level.id && currentSection === 'exercise' ? 'semibold' : 'normal'}
                      ${currentLevel === level.id && currentSection === 'exercise' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => handleLevelClick(level, 'exercise')}
                  >
                    <Pencil2Icon className={`h-4 w-4 ${currentLevel === level.id && currentSection === 'exercise' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Exercise ({level.exercise?.length || 0})
                  </button>
                </div>
              )}
            </div>
            ))
          )}
        </nav>
        )}
      </div>
    </aside>
  );
};

export default LevelsSidebar; 