import React, { useState } from 'react';
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
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  const handleDropdownToggle = (levelNum: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [levelNum]: !prev[levelNum] }));
  };

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
    <aside className="w-64 bg-offblack p-6 border-r border-paperwhite/20 flex flex-col transition-all duration-300">
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
      <div className="flex-1 space-y-2 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((levelNum) => (
          <div key={levelNum} className="mb-2">
            <button
              onClick={() => handleDropdownToggle(levelNum)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors font-medium text-sm bg-offblack text-paperwhite hover:bg-paperwhite/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise
                ${currentLevel === levelNum ? 'ring-2 ring-trueturquoise' : ''}`}
              aria-expanded={!!openDropdowns[levelNum]}
              aria-controls={`level-dropdown-${levelNum}`}
            >
              <span>Level {levelNum}</span>
              <span className={`transition-transform ${openDropdowns[levelNum] ? 'rotate-90' : ''}`}>
                <ChevronRightIcon className="h-4 w-4 text-trueturquoise" />
              </span>
            </button>
            {openDropdowns[levelNum] && (
              <div id={`level-dropdown-${levelNum}`} className="ml-4 mt-2 space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 rounded text-xs text-trueturquoise bg-trueturquoise/10 hover:bg-trueturquoise/20 transition-colors ${currentLevel === levelNum && currentSection === 'learn' ? 'bg-trueturquoise/30' : ''}`}
                  onClick={() => navigate(`/student/training/${levelNum}/learn`)}
                >
                  Learn
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded text-xs text-trueturquoise bg-trueturquoise/10 hover:bg-trueturquoise/20 transition-colors ${currentLevel === levelNum && currentSection === 'test' ? 'bg-trueturquoise/30' : ''}`}
                  onClick={() => navigate(`/student/training/${levelNum}/test`)}
                >
                  Test
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded text-xs text-trueturquoise bg-trueturquoise/10 hover:bg-trueturquoise/20 transition-colors ${currentLevel === levelNum && currentSection === 'exercise' ? 'bg-trueturquoise/30' : ''}`}
                  onClick={() => navigate(`/student/training/${levelNum}/exercise`)}
                >
                  Exercise
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default LevelsSidebar; 