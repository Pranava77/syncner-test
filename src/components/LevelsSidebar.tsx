import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ReaderIcon, ClipboardIcon, Pencil2Icon, LayersIcon } from '@radix-ui/react-icons';

interface LevelsSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  currentLevel?: number;
  currentSection?: string;
}

const LevelsSidebar: React.FC<LevelsSidebarProps> = ({
  sidebarOpen = true,
  setSidebarOpen,
  currentLevel,
  currentSection
}) => {
  const navigate = useNavigate();

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
          <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2"><LayersIcon className="h-5 w-5 text-trueturquoise" /> Levels</h2>
        </div>
        {/* Levels Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((levelNum) => (
            <div key={levelNum}>
              <button
                onClick={() => navigate(`/student/training/${levelNum}/learn`)}
                className={`w-full flex items-center py-2 transition-colors text-sm font-${currentLevel === levelNum ? 'semibold' : 'normal'} text-left
                  ${currentLevel === levelNum ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'} ${!sidebarOpen ? 'justify-center' : ''}`}
                style={{ borderRadius: 0 }}
                disabled={!sidebarOpen}
              >
                <LayersIcon className={`h-5 w-5 mr-2 ${currentLevel === levelNum ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                {sidebarOpen && `Level ${levelNum}`}
              </button>
              {sidebarOpen && currentLevel === levelNum && (
                <div className="ml-2 mt-2 flex flex-col space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'learn' ? 'semibold' : 'normal'}
                      ${currentSection === 'learn' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                    onClick={() => navigate(`/student/training/${levelNum}/learn`)}
                  >
                    <ReaderIcon className={`h-4 w-4 ${currentSection === 'learn' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Learn
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'test' ? 'semibold' : 'normal'}
                      ${currentSection === 'test' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                    onClick={() => navigate(`/student/training/${levelNum}/test`)}
                  >
                    <ClipboardIcon className={`h-4 w-4 ${currentSection === 'test' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Test
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 text-left py-2 transition-colors text-xs font-${currentSection === 'exercise' ? 'semibold' : 'normal'}
                      ${currentSection === 'exercise' ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
                    style={{ borderRadius: 0 }}
                    onClick={() => navigate(`/student/training/${levelNum}/exercise`)}
                  >
                    <Pencil2Icon className={`h-4 w-4 ${currentSection === 'exercise' ? 'text-trueturquoise' : 'text-paperwhite'}`} />
                    Exercise
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default LevelsSidebar; 