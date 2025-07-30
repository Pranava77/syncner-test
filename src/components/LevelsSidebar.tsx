import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { ChevronRightIcon, ReaderIcon, ClipboardIcon, Pencil2Icon, LayersIcon, LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
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
}

const LevelsSidebar: React.FC<LevelsSidebarProps> = ({
  sidebarOpen = true,
  setSidebarOpen,
  currentLevel,
  currentSection,
  refreshTrigger
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user's career track
      const userCareerTrack = user?.careerTrack;
      console.log('=== SIDEBAR DEBUG ===');
      console.log('User object:', user);
      console.log('User career track:', userCareerTrack);
      console.log('User career track type:', typeof userCareerTrack);
      
      if (!userCareerTrack) {
        console.log('No career track assigned to user');
        setLevels([]);
        setLoading(false);
        return;
      }
      
      console.log('Sidebar: Fetching levels for track:', userCareerTrack);
      const response = await apiService.getLevels(userCareerTrack);
      
      let levelsData = [];
      if (response && response.data) {
        levelsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levelsData = response;
      }
      
      console.log('Sidebar: Raw levels data:', levelsData);
      
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
        const statusResponse = await apiService.getLevelsStatus(levelsData);
        console.log('Sidebar: Status response:', statusResponse);
        
        if (statusResponse && statusResponse.data && statusResponse.data.levels) {
          const statusData = statusResponse.data.levels;
          console.log('Sidebar: Status data:', statusData);
          
          levelsData = levelsData.map((level: Level) => {
            const levelStatus = statusData.find((status: any) => status.id === level.id);
            console.log(`Sidebar: Level ${level.order} status:`, levelStatus);
            
            // Level 1 is always unlocked, others need proper unlock status
            const isUnlocked = level.order === 1 ? true : (levelStatus?.isUnlocked ?? false);
            console.log(`Sidebar: Level ${level.order} isUnlocked:`, isUnlocked);
            
            return {
              ...level,
              isUnlocked: isUnlocked,
              isCompleted: levelStatus?.isCompleted ?? false,
              completedSections: levelStatus?.completedSections ?? []
            };
          });
        } else {
          console.log('Sidebar: No status data found, using fallback');
          // If no status data, set first level as unlocked and others as locked
          levelsData = levelsData.map((level: Level) => {
            const isUnlocked = level.order === 1;
            console.log(`Sidebar: Fallback - Level ${level.order} isUnlocked:`, isUnlocked);
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
          const isUnlocked = level.order === 1;
          console.log(`Sidebar: Error fallback - Level ${level.order} isUnlocked:`, isUnlocked);
          return {
            ...level,
            isUnlocked: isUnlocked,
            isCompleted: false,
            completedSections: []
          };
        });
      }
      
      console.log('Sidebar: Final filtered unique levels with status:', levelsData);
      setLevels(levelsData);
    } catch (error) {
      console.error('Error fetching levels for sidebar:', error);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('LevelsSidebar: User data changed:', user);
    fetchLevels();
  }, [fetchLevels]);

  // Refresh levels when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      console.log('LevelsSidebar: Refresh triggered');
      fetchLevels();
    }
  }, [refreshTrigger, fetchLevels]);

  return (
    <aside
      className={`relative h-full flex flex-col border-r border-paperwhite/20 bg-offblack transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}
      style={{ minWidth: sidebarOpen ? '16rem' : '4rem' }}
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
      <div className={`flex-1 flex flex-col py-24 pl-2 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}`}
        style={{ transitionProperty: 'opacity' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between mb-4 ${!sidebarOpen ? 'invisible' : ''}`}>
          <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2">
            <LayersIcon className="h-5 w-5 text-trueturquoise" /> 
            {loading ? 'Loading...' : `Levels (${levels.length})`}
          </h2>
        </div>
        
        {/* Levels Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto">
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
              <div key={level.id}>
              <button
                  onClick={() => {
                    if (level.isUnlocked) {
                      navigate(`/student/training/${level.id}/learn`);
                    } else {
                      alert('This level is locked. Complete the previous level\'s exercise to unlock it.');
                    }
                  }}
                  className={`w-full flex items-center py-2 transition-colors text-sm font-${currentLevel === level.id ? 'semibold' : 'normal'} text-left
                    ${currentLevel === level.id ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 
                      level.isUnlocked ? 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise' : 
                      'text-teallight/50 cursor-not-allowed'} ${!sidebarOpen ? 'justify-center' : ''}`}
                style={{ borderRadius: 0 }}
                disabled={!sidebarOpen || !level.isUnlocked}
              >
                  {level.isUnlocked ? (
                    <LockOpen1Icon className={`h-5 w-5 mr-2 ${currentLevel === level.id ? 'text-trueturquoise' : 'text-green-400'}`} />
                  ) : (
                    <LockClosedIcon className="h-5 w-5 mr-2 text-teallight/50" />
                  )}
                  {sidebarOpen && (
                    <div className="flex-1 text-left">
                      <div className="font-medium flex items-center gap-2">
                        Level {level.order}
                        {level.isUnlocked ? (
                          <LockOpen1Icon className="h-3 w-3 text-green-400" />
                        ) : (
                          <LockClosedIcon className="h-3 w-3 text-teallight/50" />
                        )}
                      </div>
                      <div className="text-xs text-teallight truncate">{level.title}</div>
                      <div className="text-xs text-teallight/60 flex items-center gap-2 mt-1">
                        <span>{level.learn?.length || 0} learn</span>
                        <span>{level.test?.length || 0} test</span>
                        <span>{level.exercise?.length || 0} exercise</span>
                      </div>
                    </div>
                  )}
              </button>
                {sidebarOpen && currentLevel === level.id && level.isUnlocked && (
                <div className="ml-2 mt-2 flex flex-col space-y-1">
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
      </div>
    </aside>
  );
};

export default LevelsSidebar; 