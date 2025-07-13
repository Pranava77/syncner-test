import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@radix-ui/react-icons';

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
      <div className="w-16 flex flex-col items-center justify-start pt-8 bg-offblack border-r border-paperwhite/20">
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
    <aside className="w-64 bg-offblack p-6 border-r border-paperwhite/20 flex flex-col h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-paperwhite">Levels</h2>
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
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-medium text-base text-left
                ${currentLevel === levelNum ? 'bg-trueturquoise/10 text-trueturquoise' : 'text-paperwhite hover:bg-paperwhite/10'}`}
            >
              Level {levelNum}
            </button>
            {currentLevel === levelNum && (
              <div className="ml-4 mt-2 flex flex-col space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 rounded font-medium text-xs transition-colors
                    ${currentSection === 'learn' ? 'bg-trueturquoise text-offblack' : 'bg-paperwhite/10 text-trueturquoise hover:bg-paperwhite/20'}`}
                  onClick={() => navigate(`/student/training/${levelNum}/learn`)}
                >
                  Learn
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded font-medium text-xs transition-colors
                    ${currentSection === 'test' ? 'bg-trueturquoise text-offblack' : 'bg-paperwhite/10 text-trueturquoise hover:bg-paperwhite/20'}`}
                  onClick={() => navigate(`/student/training/${levelNum}/test`)}
                >
                  Test
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded font-medium text-xs transition-colors
                    ${currentSection === 'exercise' ? 'bg-trueturquoise text-offblack' : 'bg-paperwhite/10 text-trueturquoise hover:bg-paperwhite/20'}`}
                  onClick={() => navigate(`/student/training/${levelNum}/exercise`)}
                >
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