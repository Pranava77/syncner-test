import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import apiService from '../services/api';

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  careerTrack: string;
  learn: any[];
  test: any[];
  exercise: ExerciseItem[];
  order: number;
  isActive: boolean;
}

interface ExerciseItem {
  title: string;
  description: string;
  resources: string[];
  order: number;
}

const LevelExercisePage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
    }
  }, [levelId]);

  const fetchLevel = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/training/levels/${levelId}`);
      console.log('Level exercise data response:', response);
      
      let levelData = null;
      if (response && response.data) {
        levelData = response.data;
      } else if (response) {
        levelData = response;
      }
      
      setLevel(levelData);
    } catch (error) {
      console.error('Error fetching level:', error);
      setError('Failed to load exercise content');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) =>
    status === 'Completed' ? 'bg-trueturquoise/20 text-trueturquoise' : 'bg-paperwhite/10 text-teallight';

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto mb-4"></div>
            <p className="text-paperwhite text-lg">Loading exercise content...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error || 'Level not found'}</p>
            <button 
              onClick={fetchLevel}
              className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (level.exercise.length === 0) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div className="text-paperwhite/30 text-6xl mb-4">💪</div>
            <h2 className="text-xl font-bold text-paperwhite mb-2">No Exercises Available</h2>
            <p className="text-teallight mb-6">This level doesn't have any exercises yet.</p>
            <button 
              onClick={() => navigate(`/student/training/${levelId}/learn`)}
              className="bg-trueturquoise text-offblack px-6 py-3 rounded-lg font-bold hover:bg-teallight transition-colors"
            >
              Back to Learning
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
        {/* Level Header */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {level.order}: {level.title} - Exercises</h1>
              <p className="text-teallight">{level.description}</p>
            </div>
                      <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-sm">
                {level.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-sm">
                {level.careerTrack}
              </span>
                      </div>
          </div>
        </div>

        <div className="w-full max-w-5xl bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <h1 className="text-xl font-bold text-paperwhite mb-6">Exercises</h1>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-teallight uppercase border-b border-paperwhite/10">
                  <th className="py-2 px-3 font-semibold">S.No</th>
                  <th className="py-2 px-3 font-semibold">Exercise Title</th>
                  <th className="py-2 px-3 font-semibold">Description</th>
                  <th className="py-2 px-3 font-semibold">Resources</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {level.exercise.map((exercise, idx) => (
                  <tr key={idx} className="border-b border-paperwhite/10 last:border-b-0 hover:bg-paperwhite/10 transition">
                    <td className="py-3 px-3 text-paperwhite/90">{idx + 1}</td>
                    <td className="py-3 px-3 text-paperwhite font-semibold">{exercise.title}</td>
                    <td className="py-3 px-3 text-teallight max-w-xs">
                      <p className="text-sm leading-relaxed">{exercise.description}</p>
                    </td>
                    <td className="py-3 px-3">
                      {exercise.resources && exercise.resources.length > 0 ? (
                        <div className="space-y-1">
                          {exercise.resources.map((resource, resourceIdx) => (
                            <a
                              key={resourceIdx}
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-trueturquoise hover:text-teallight transition-colors truncate"
                            >
                              Resource {resourceIdx + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-teallight">No resources</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${statusColor('Pending')}`}>
                          Pending
                        </span>
                        <button className="bg-paperwhite text-offblack px-4 py-1 rounded font-bold text-sm shadow hover:bg-trueturquoise hover:text-offblack transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <button className="mt-4 bg-trueturquoise text-offblack px-10 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors">
          Submit All Exercises
        </button>
      </main>
    </div>
  );
};

export default LevelExercisePage; 