import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import TaskSubmissionModal from '../components/TaskSubmissionModal';
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
  difficulty?: string;
  creditPoints?: number;
  isMandatory?: boolean;
}

const LevelExercisePage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      
      // Debug exercise data
      if (levelData && levelData.exercise) {
        console.log('LevelExercisePage: Exercise data:', levelData.exercise);
        console.log('LevelExercisePage: Exercise data length:', levelData.exercise.length);
        levelData.exercise.forEach((exercise: any, index: number) => {
          console.log(`LevelExercisePage: Exercise ${index}:`, exercise);
          console.log(`LevelExercisePage: Exercise ${index} resources:`, exercise.resources);
        });
      } else {
        console.log('LevelExercisePage: No exercise data found in level:', levelData);
      }
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

  const fetchAllLevels = useCallback(async () => {
    try {
      const response = await apiService.getLevels();
      if (response && response.data) {
        setAllLevels(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error('Error fetching all levels:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllLevels();
  }, [fetchAllLevels]);

  const statusColor = (status: string) =>
    status === 'Completed' ? 'bg-trueturquoise/20 text-trueturquoise' : 'bg-paperwhite/10 text-teallight';

  const handleViewExercise = (exercise: ExerciseItem) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
    // Trigger sidebar refresh when modal is closed (exercise might have been completed)
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUnlockNextLevel = () => {
    if (level && level.order && allLevels.length > 0) {
      // Find the next level by order
      const nextLevel = allLevels.find(l => l.order === level.order + 1);
      if (nextLevel) {
        navigate(`/student/training/${nextLevel.id}/learn`);
      } else {
        // If no next level, go to training levels page
        navigate('/student/training');
      }
    } else {
      // Fallback to training levels page
      navigate('/student/training');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
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
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
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

  const validExercises = level.exercise ? level.exercise.filter(e => e && e.title && e.description) : [];
  
  if (!level.exercise || level.exercise.length === 0 || validExercises.length === 0) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
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

  // Process exercises to add default values and categorize them
  const processedExercises = validExercises.map((exercise, index) => ({
    ...exercise,
    difficulty: exercise.difficulty || ['Easy', 'Medium', 'Hard', 'Extreme'][index % 4],
    creditPoints: exercise.creditPoints || [5, 10, 15, 20][index % 4],
    isMandatory: exercise.isMandatory !== false // Default to mandatory
  }));

  const mandatoryExercises = processedExercises.filter(ex => ex.isMandatory);
  const optionalExercises = processedExercises.filter(ex => !ex.isMandatory);

  const renderExerciseTable = (exercises: any[], title: string, startIndex: number = 0) => (
    <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-paperwhite mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-paperwhite/20">
              <th className="text-left py-3 px-4 text-paperwhite font-semibold">S.No</th>
              <th className="text-left py-3 px-4 text-paperwhite font-semibold">Task name</th>
              <th className="text-left py-3 px-4 text-paperwhite font-semibold">Brief</th>
              <th className="text-left py-3 px-4 text-paperwhite font-semibold">Difficulty Level</th>
              <th className="text-left py-3 px-4 text-paperwhite font-semibold">Credit Points</th>
              <th className="text-left py-3 px-4 text-paperwhite font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise, index) => (
              <tr key={index} className="border-b border-paperwhite/10 hover:bg-paperwhite/5">
                <td className="py-3 px-4 text-paperwhite">{startIndex + index + 1}</td>
                <td className="py-3 px-4 text-paperwhite font-medium">{exercise.title}</td>
                <td className="py-3 px-4 text-paperwhite text-sm">{exercise.description}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    exercise.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    exercise.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    exercise.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 text-paperwhite">{exercise.creditPoints}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-paperwhite/20 rounded"></div>
                    <button 
                      onClick={() => handleViewExercise(exercise)}
                      className="bg-paperwhite/10 text-paperwhite px-3 py-1 rounded text-sm hover:bg-paperwhite/20 transition-colors"
                    >
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
  );

  return (
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
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

        {/* Exercise Tables */}
        {mandatoryExercises.length > 0 && renderExerciseTable(mandatoryExercises, "Mandatory Task")}
        {optionalExercises.length > 0 && renderExerciseTable(optionalExercises, "Optional", mandatoryExercises.length)}

        {/* Action Buttons */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-8">
          <button 
            onClick={handleUnlockNextLevel}
            className="w-full sm:w-auto bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors"
          >
            Unlock Next Level
          </button>
        </div>
      </main>

      {/* Task Submission Modal */}
      {selectedExercise && (
        <TaskSubmissionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          exercise={{
            ...selectedExercise,
            id: level?.id,
            order: level?.order
          }}
        />
      )}
    </div>
  );
};

export default LevelExercisePage; 