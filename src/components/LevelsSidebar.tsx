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

  if (!sidebarOpen) {
    return (
      <div className="w-16 flex flex-col items-center justify-start pt-8 bg-offblack border-r border-paperwhite/20 h-full">
        <button
          onClick={() => setSidebarOpen && setSidebarOpen(true)}
          className="p-1.5 rounded-lg bg-offblack border border-paperwhite/30 shadow-lg hover:bg-trueturquoise/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise"
          aria-label="Open sidebar"
        >
          <ChevronRightIcon className="h-4 w-4 text-trueturquoise" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-offblack pl-2 border-r border-paperwhite/20 flex flex-col h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-paperwhite flex items-center gap-2"><LayersIcon className="h-5 w-5 text-trueturquoise" /> Levels</h2>
        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-2 p-1 rounded hover:bg-trueturquoise/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise"
            aria-label="Close sidebar"
          >
            <ChevronRightIcon className="h-5 w-5 text-trueturquoise rotate-180" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((levelNum) => (
          <div key={levelNum}>
            <button
              onClick={() => navigate(`/student/training/${levelNum}/learn`)}
              className={`w-full flex items-center py-2 transition-colors text-sm font-${currentLevel === levelNum ? 'semibold' : 'normal'} text-left
                ${currentLevel === levelNum ? 'bg-trueturquoise/10 text-trueturquoise border-r-2 border-trueturquoise' : 'text-paperwhite hover:bg-trueturquoise/20 hover:text-trueturquoise'}`}
              style={{ borderRadius: 0 }}
            >
              <LayersIcon className={`h-5 w-5 mr-2 ${currentLevel === levelNum ? 'text-trueturquoise' : 'text-paperwhite'}`} />
              Level {levelNum}
            </button>
            {currentLevel === levelNum && (
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
    </aside>
  );
};

export default LevelsSidebar; 