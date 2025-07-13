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
            {levels.map((level: Level) => (
              <button
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors font-medium text-sm
                  ${selectedLevelId === level.id ? 'bg-trueturquoise/10 border border-trueturquoise text-trueturquoise' : 'hover:bg-paperwhite/10 text-paperwhite'}`}
              >
                <div className="flex items-center justify-between">
                  <span>{level.title}</span>
                  {/* Removed difficulty badge */}
                </div>
              </button>
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
      <main className="flex-1 p-6 lg:p-12">
        {selectedLevelId ? (
          <TrainingLevelDetail levelId={selectedLevelId} />
        ) : (
          <div className="text-paperwhite text-center mt-24 text-xl">Select a level to begin learning!</div>
        )}
      </main>
    </div>
  );
};

export default TrainingLevels; 