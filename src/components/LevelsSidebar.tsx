import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { ChevronRightIcon, ReaderIcon, ClipboardIcon, Pencil2Icon, LayersIcon } from '@radix-ui/react-icons';
import apiService from '../services/api';

interface Level {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
  careerTrack: string;
}

interface LevelsSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  currentLevel?: string;
  currentSection?: string;
}

const LevelsSidebar: React.FC<LevelsSidebarProps> = ({
  sidebarOpen = true,
  setSidebarOpen,
  currentLevel,
  currentSection
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/training/levels');
      
      let levelsData = [];
      if (response && response.data) {
        levelsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levelsData = response;
      }
      
      // Filter levels by user's career track
      const userCareerTrack = user?.careerTrack;
      if (userCareerTrack) {
        // Handle both frontend and backend career track formats
        const normalizedUserTrack = userCareerTrack === 'fullstack' ? 'full-stack' : userCareerTrack;
        levelsData = levelsData.filter((level: Level) => {
          const normalizedLevelTrack = level.careerTrack === 'fullstack' ? 'full-stack' : level.careerTrack;
          return normalizedLevelTrack === normalizedUserTrack;
        });
        console.log(`Sidebar: Filtered levels for career track: ${userCareerTrack}`, levelsData);
      }
      
      // Sort by order and filter active levels
      levelsData = levelsData
        .filter((level: Level) => level.isActive)
        .sort((a: Level, b: Level) => a.order - b.order);
      
      setLevels(levelsData);
    } catch (error) {
      console.error('Error fetching levels for sidebar:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('LevelsSidebar: User data changed:', user);
    fetchLevels();
  }, [fetchLevels]);

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
      <div className={`flex-1 flex flex-col py-24 pl-2 pr-2 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}`}
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
                  onClick={() => navigate(`/student/training/${level.id}/learn`)}
                  className={`w-full flex items-center py-2 transition-colors text-sm font-${currentLevel === level.id ? 'semibold' : 'normal'} text-left
                    ${currentLevel === level.id ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'} ${!sidebarOpen ? 'justify-center' : ''}`}
                style={{ borderRadius: 0 }}
                disabled={!sidebarOpen}
              >
                  <LayersIcon className={`h-5 w-5 mr-2 ${currentLevel === level.id ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                  {sidebarOpen && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">Level {level.order}</div>
                      <div className="text-xs text-teallight truncate">{level.title}</div>
                    </div>
                  )}
              </button>
                {sidebarOpen && currentLevel === level.id && (
                <div className="ml-2 mt-2 flex flex-col space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'learn' ? 'semibold' : 'normal'}
                      ${currentSection === 'learn' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => navigate(`/student/training/${level.id}/learn`)}
                  >
                    <ReaderIcon className={`h-4 w-4 ${currentSection === 'learn' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Learn
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'test' ? 'semibold' : 'normal'}
                      ${currentSection === 'test' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => navigate(`/student/training/${level.id}/test`)}
                  >
                    <ClipboardIcon className={`h-4 w-4 ${currentSection === 'test' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Test
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'exercise' ? 'semibold' : 'normal'}
                      ${currentSection === 'exercise' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                      onClick={() => navigate(`/student/training/${level.id}/exercise`)}
                  >
                    <Pencil2Icon className={`h-4 w-4 ${currentSection === 'exercise' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Exercise
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