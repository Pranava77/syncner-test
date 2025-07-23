import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchLevel = useCallback(async () => {
    try {
      setLoading(true);
      console.log('LevelExercisePage: Fetching level with ID:', levelId);
      const response = await apiService.getLevel(levelId!);
      console.log('LevelExercisePage: Level data response:', response);
      
      let levelData = null;
      if (response && response.data) {
        levelData = response.data;
      } else if (response) {
        levelData = response;
      }
      
      setLevel(levelData);
    } catch (error) {
      console.error('LevelExercisePage: Error fetching level:', error);
      setError(`Failed to load exercise content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
    }
  }, [levelId, fetchLevel]);

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
            <h2 className="text-xl font-bold text-paperwhite mb-2">No Exercise Available</h2>
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
        {/* Exercise Header */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {level.order}: {level.title} - Exercise</h1>
              <p className="text-teallight">Practice what you've learned with hands-on exercises</p>
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

        {/* Exercise Content */}
        <div className="w-full max-w-5xl space-y-6">
          {level.exercise.map((exercise, index) => (
            <div key={index} className="bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500">
                  <span className="text-white text-lg">💪</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-paperwhite">{exercise.title}</h3>
                  <span className="text-xs text-teallight">Exercise {index + 1}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-paperwhite text-sm leading-relaxed">{exercise.description}</p>
              </div>

              {exercise.resources && exercise.resources.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-paperwhite mb-3">Resources:</h4>
                  <div className="space-y-2">
                    {exercise.resources.map((resource, resIndex) => (
                      <div key={resIndex} className="flex items-center gap-2 text-sm">
                        <span className="text-trueturquoise">•</span>
                        <span className="text-paperwhite">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg font-semibold hover:bg-teallight transition-colors">
                    Start Exercise
                  </button>
                  <button className="bg-paperwhite/10 text-paperwhite px-4 py-2 rounded-lg font-semibold hover:bg-paperwhite/20 transition-colors">
                    View Instructions
                  </button>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor('Not Started')}`}>
                  Not Started
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-8">
          <button 
            onClick={() => navigate(`/student/training/${levelId}/learn`)}
            className="w-full sm:w-auto bg-paperwhite text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-trueturquoise hover:text-offblack transition-colors mb-2 sm:mb-0"
          >
            Back to Learning
          </button>
          <button 
            onClick={() => navigate(`/student/training/${levelId}/test`)}
            className="w-full sm:w-auto bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors"
          >
            Take Test
          </button>
        </div>
      </main>
    </div>
  );
};

export default LevelExercisePage; 