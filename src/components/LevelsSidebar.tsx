import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { ChevronRightIcon, ChevronDownIcon, ReaderIcon, ClipboardIcon, Pencil2Icon, LayersIcon, LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import apiService from '../services/api';

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
  completedSections?: string[];
}

interface LevelsSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  currentLevel?: string;
  currentSection?: string;
  refreshTrigger?: number; // Add this to trigger refresh from parent
  onRefresh?: () => void; // Callback to notify parent of refresh
}

const LevelsSidebar: React.FC<LevelsSidebarProps> = ({
  sidebarOpen = true,
  setSidebarOpen,
  currentLevel,
  currentSection,
  refreshTrigger,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user's career track
      const userCareerTrack = user?.careerTrack;
      
      if (!userCareerTrack) {
        setLevels([]);
        setLoading(false);
        return;
      }
      
      const response = await apiService.getLevels(userCareerTrack);
      
      let levelsData: Level[] = [];
      if (response && response.data) {
        levelsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levelsData = response;
      }
      

      
      // Ensure we have unique levels by order and career track
      const uniqueLevels = levelsData.filter((level: Level, index: number, self: Level[]) => 
        index === self.findIndex((l: Level) => 
          l.order === level.order && l.careerTrack === level.careerTrack
        )
      );
      
      // Sort by order and filter active levels
      levelsData = uniqueLevels
        .filter((level: Level) => level.isActive)
        .sort((a: Level, b: Level) => a.order - b.order);
      
      // Fetch level status to determine locked/unlocked state
      try {
        const statusResponse = await apiService.getLevelsStatus();
        
        if (statusResponse && statusResponse.data && statusResponse.data.levels) {
          const statusData = statusResponse.data.levels;
          
          levelsData = levelsData.map((level: Level) => {
            const levelStatus = statusData.find((status: any) => status.id === level.id);
            
            // Level 1 is always unlocked, others need proper unlock status
            let isUnlocked = false;
            if (level.order === 1) {
              isUnlocked = true;
            } else if (levelStatus) {
              isUnlocked = levelStatus.isUnlocked === true;
            } else {
              // If no status found, check if previous level exists and is fully completed
              const previousLevel = levelsData.find((l: Level) => l.order === level.order - 1);
              if (previousLevel) {
                const previousStatus = statusData.find((status: any) => status.id === previousLevel.id);
                // Check if previous level has all sections completed (learn, test, exercise)
                const previousCompletedSections = previousStatus?.completedSections || {};
                const isPreviousFullyCompleted = previousCompletedSections.learn === true && 
                                               previousCompletedSections.test === true && 
                                               previousCompletedSections.exercise === true;
                isUnlocked = isPreviousFullyCompleted;
              }
            }

            
            return {
              ...level,
              isUnlocked: isUnlocked,
              isCompleted: levelStatus?.isCompleted ?? false,
              completedSections: levelStatus?.completedSections ?? []
            };
          });
        } else {
          // If no status data, set first level as unlocked and others as locked
          levelsData = levelsData.map((level: Level) => {
            const isUnlocked = level.order === 1; // Only Level 1 unlocked by default
            return {
              ...level,
              isUnlocked: isUnlocked,
              isCompleted: false,
              completedSections: []
            };
          });
        }
      } catch (statusError) {
        console.error('Error fetching level status:', statusError);
        // If status fetch fails, set first level as unlocked and others as locked
        levelsData = levelsData.map((level: Level) => {
          const isUnlocked = level.order === 1; // Only Level 1 unlocked by default
          return {
            ...level,
            isUnlocked: isUnlocked,
            isCompleted: false,
            completedSections: []
          };
        });
      }
      
      setLevels(levelsData);
      
      // Notify parent component that refresh is complete
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error fetching levels for sidebar:', error);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  // Auto-expand current level
  useEffect(() => {
    if (currentLevel && !expandedLevels.has(currentLevel)) {
      setExpandedLevels(prev => new Set([...prev, currentLevel]));
    }
  }, [currentLevel, expandedLevels]);

  // Refresh levels when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchLevels();
    }
  }, [refreshTrigger, fetchLevels]);

  // Auto-refresh levels every 30 seconds to catch completion updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && levels.length > 0) {
        fetchLevels();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchLevels, loading, levels.length]);

  const toggleLevelExpansion = (levelId: string) => {
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
              {loading ? 'Loading...' : `Levels (${levels.length})`}
            </h2>
            <button
              onClick={fetchLevels}
              disabled={loading}
              className="p-1 rounded-lg bg-paperwhite/10 hover:bg-paperwhite/20 transition-colors disabled:opacity-50"
              title="Refresh levels"
            >
              <svg className="w-4 h-4 text-trueturquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Closed Sidebar Modern Design */}
        {!sidebarOpen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Vertical Level Indicators */}
            <div className="flex flex-col items-center space-y-3">
              {levels.slice(0, 6).map((level, index) => (
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
              {levels.length > 6 && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-paperwhite/10 text-teallight/50 border border-paperwhite/20">
                  +{levels.length - 6}
                </div>
              )}
            </div>
            
            {/* Progress Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-16 bg-paperwhite/10 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-t from-trueturquoise to-teallight transition-all duration-500"
                  style={{ 
                    height: `${Math.min((levels.filter(l => l.isUnlocked).length / levels.length) * 100, 100)}%` 
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-trueturquoise mx-auto mb-2"></div>
              <p className="text-xs text-teallight">Loading levels...</p>
            </div>
          ) : levels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-teallight">
                {user?.careerTrack ? 
                  `No levels for ${user.careerTrack} track` :
                  'No levels available'
                }
              </p>
            </div>
          ) : (
                        levels.map((level) => (
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
                    className={`flex-1 flex items-center py-2 transition-colors text-sm font-${currentLevel === level.id ? 'semibold' : 'normal'} text-left
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
                  </button>
                  {level.isUnlocked && (
                    <button
                      onClick={() => toggleLevelExpansion(level.id)}
                      className="p-2 hover:bg-paperwhite/10 transition-colors"
                    >
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-teallight transition-transform duration-200 ${
                          isLevelExpanded(level.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  )}
                </div>
                {sidebarOpen && level.isUnlocked && isLevelExpanded(level.id) && (
                <div className="ml-2 mt-2 flex flex-col space-y-1 border-l border-paperwhite/10 pl-2">
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'learn' ? 'semibold' : 'normal'}
                      ${currentSection === 'learn' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => navigate(`/student/training/${level.id}/learn`)}
                  >
                    <ReaderIcon className={`h-4 w-4 ${currentSection === 'learn' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Learn ({level.learn?.length || 0})
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'test' ? 'semibold' : 'normal'}
                      ${currentSection === 'test' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => navigate(`/student/training/${level.id}/test`)}
                  >
                    <ClipboardIcon className={`h-4 w-4 ${currentSection === 'test' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Test ({level.test?.length || 0})
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'exercise' ? 'semibold' : 'normal'}
                      ${currentSection === 'exercise' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => navigate(`/student/training/${level.id}/exercise`)}
                  >
                    <Pencil2Icon className={`h-4 w-4 ${currentSection === 'exercise' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
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