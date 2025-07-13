import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../redux/store';
import { useLevels, Level } from '../hooks/useLevels';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import TrainingLevelDetail from './TrainingLevelDetail';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

const TrainingLevels: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { levels, loading, error } = useLevels(user?.careerTrack);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(levelId || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (levelId) setSelectedLevelId(levelId);
  }, [levelId]);

  if (loading) return <LoadingScreen message="Loading levels..." />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!levels.length) return <div className="text-teallight p-8">No levels found for your track.</div>;

  const handleLevelSelect = (id: string) => {
    setSelectedLevelId(id);
    navigate(`/student/training/${id}`);
  };

  const handleDropdownToggle = (levelIdx: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [levelIdx]: !prev[levelIdx] }));
  };

  return (
    <div className="flex h-full min-h-screen bg-offblack">
      {/* Levels Sidebar */}
      {sidebarOpen ? (
        <aside className="w-64 bg-offblack p-6 border-r border-paperwhite/20 flex flex-col transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-paperwhite">Levels</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-2 p-1 rounded hover:bg-trueturquoise/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise"
              aria-label="Close sidebar"
            >
              <ChevronLeftIcon className="h-5 w-5 text-trueturquoise" />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {[1, 2, 3, 4, 5].map((levelNum) => (
              <div key={levelNum} className="mb-2">
                <button
                  onClick={() => handleDropdownToggle(levelNum)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors font-medium text-sm bg-offblack text-paperwhite hover:bg-paperwhite/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise`}
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
                    <div className="px-3 py-2 rounded text-xs text-trueturquoise bg-trueturquoise/10">Learn</div>
                    <div className="px-3 py-2 rounded text-xs text-trueturquoise bg-trueturquoise/10">Test</div>
                    <div className="px-3 py-2 rounded text-xs text-trueturquoise bg-trueturquoise/10">Exercise</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      ) : (
        // Render the open button in the Training section of the main sidebar
        <div className="w-16 flex flex-col items-center justify-start pt-8 bg-offblack border-r border-paperwhite/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-offblack border border-paperwhite/30 shadow-lg hover:bg-trueturquoise/10 focus:outline-none focus:ring-2 focus:ring-trueturquoise"
            aria-label="Open sidebar"
          >
            <ChevronRightIcon className="h-4 w-4 text-trueturquoise" />
          </button>
        </div>
      )}
      {/* Level Detail */}
      <main className="flex-1 min-h-screen flex flex-col justify-start items-stretch p-0">
        {selectedLevelId ? (
          <TrainingLevelDetail levelId={selectedLevelId} />
        ) : (
          <div className="text-paperwhite text-center mt-24 text-xl w-full">Select a level to begin learning!</div>
        )}
      </main>
    </div>
  );
};

export default TrainingLevels; 