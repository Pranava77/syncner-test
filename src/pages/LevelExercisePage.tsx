import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import LevelsSidebar from '../components/LevelsSidebar';
import TaskSubmissionModal from '../components/TaskSubmissionModal';
import { LockClosedIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import syncnerLogo from '../assets/syncner-logo.png';

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
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [unlockingLevel, setUnlockingLevel] = useState(false);
  const [levelsLoading, setLevelsLoading] = useState(true);
  
  // New state for exercise validation
  const [isExerciseUnlocked, setIsExerciseUnlocked] = useState(false);
  const [hasExerciseLinks, setHasExerciseLinks] = useState(false);
  const [exerciseSubmissions, setExerciseSubmissions] = useState<any[]>([]);

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

  // Fetch exercise unlock status and link validation
  const fetchExerciseStatus = useCallback(async () => {
    if (!levelId) return;
    
    try {
      // Get all section status for this level
      const response = await apiService.getLevelSectionStatus(levelId);
      
      if (response.success) {
        const { exercise, test } = response.data;
        
        console.log('Exercise status response:', response.data);
        console.log('Exercise data:', exercise);
        console.log('Test data:', test);
        
        // Check if test is completed (either through test.isCompleted or test.progress.isCompleted)
        const isTestCompleted = test?.isCompleted || test?.progress?.isCompleted || false;
        console.log('Is test completed:', isTestCompleted);
        
        // Exercise is unlocked if test is completed OR if exercise.isUnlocked is true
        const exerciseUnlocked = exercise?.isUnlocked || isTestCompleted;
        console.log('Exercise unlocked:', exerciseUnlocked);
        
        setIsExerciseUnlocked(exerciseUnlocked);
        
        // Dynamic exercise completion based on available exercises
        const totalExercises = level?.exercise?.length || 1; // At least 1 to avoid division by zero
        const submittedExercises = exercise.submissions?.length || 0;
        setHasExerciseLinks(submittedExercises >= 1); // Complete with at least 1 exercise
        setExerciseSubmissions(exercise.submissions || []);
      } else {
        console.error('Failed to fetch exercise status:', response);
      }
    } catch (error) {
      console.error('Error fetching exercise status:', error);
    }
  }, [levelId, level?.exercise?.length]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
      fetchExerciseStatus();
    }
  }, [levelId, fetchLevel, fetchExerciseStatus]);

  // Refresh exercise status when refreshTrigger changes (e.g., after test completion)
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchExerciseStatus();
    }
  }, [refreshTrigger, fetchExerciseStatus]);

  const fetchAllLevels = useCallback(async () => {
    try {
      setLevelsLoading(true);
      if (!user?.careerTrack) {
        console.error('No career track found for user');
        return;
      }
      
      const response = await apiService.getLevels(user.careerTrack);
      if (response && response.data) {
        const levelsData = Array.isArray(response.data) ? response.data : [response.data];
        // Filter levels to only include the current user's track
        const currentTrackLevels = levelsData.filter((level: Level) => level.careerTrack === user.careerTrack);
        setAllLevels(currentTrackLevels);
      }
    } catch (error) {
      console.error('Error fetching all levels:', error);
    } finally {
      setLevelsLoading(false);
    }
  }, [user?.careerTrack]);

  useEffect(() => {
    fetchAllLevels();
  }, [fetchAllLevels]);

  const statusColor = (status: string) =>
    status === 'Completed' ? 'bg-trueturquoise/20 text-trueturquoise' : 'bg-paperwhite/10 text-teallight';

  const handleViewExercise = (exercise: ExerciseItem) => {
    // Find existing submission for this exercise
    const existingSubmission = exerciseSubmissions.find(sub => sub.exerciseTitle === exercise.title);
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
    // Trigger sidebar refresh when modal is closed (exercise might have been completed)
    setRefreshTrigger(prev => prev + 1);
    // Refresh exercise status after modal closes
    fetchExerciseStatus();
  };

  const handleUnlockNextLevel = async () => {
    if (!hasExerciseLinks) {
      return; // Don't proceed if no links are submitted
    }
    
    try {
      setUnlockingLevel(true);
      
      // Mark the current level as completed (exercise section)
      if (level && level.id && level.order) {
        console.log('Marking level as completed:', { levelId: level.id, levelOrder: level.order, section: 'exercise' });
        const result = await apiService.markLevelCompleted(level.id, level.order, 'exercise');
        console.log('Level completion result:', result);
      }
      
      // Trigger sidebar refresh to update unlock status
      setRefreshTrigger(prev => prev + 1);
      
      // Trigger dashboard progress update
      window.dispatchEvent(new CustomEvent('progress-updated'));
      window.dispatchEvent(new CustomEvent('exercise-completed'));
      window.dispatchEvent(new CustomEvent('level-completed'));
      localStorage.setItem('level-progress-updated', Date.now().toString());
      
      // Small delay to ensure sidebar refresh completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to next level (only within the same track)
      if (level && level.order && allLevels.length > 0) {
        // Find the next level by order within the same track
        const currentTrackLevels = allLevels.filter(l => l.careerTrack === user?.careerTrack);
        const nextLevel = currentTrackLevels.find(l => l.order === level.order + 1);
        
        if (nextLevel) {
          // There is a next level, navigate to it
          navigate(`/student/training/${nextLevel.id}/learn`);
        } else {
          // No next level found - this is the last level or no more levels
          console.log('No next level found - bootcamp completed or no more levels available');
          navigate('/student/training');
        }
      } else {
        // Fallback to training levels page
        console.log('No levels data available - navigating to training page');
        navigate('/student/training');
      }
    } catch (error) {
      console.error('Error marking level as completed:', error);
      // Still navigate even if marking as completed fails
      if (level && level.order && allLevels.length > 0) {
        const currentTrackLevels = allLevels.filter(l => l.careerTrack === user?.careerTrack);
        const nextLevel = currentTrackLevels.find(l => l.order === level.order + 1);
        if (nextLevel) {
          navigate(`/student/training/${nextLevel.id}/learn`);
        } else {
          navigate('/student/training');
        }
      } else {
        navigate('/student/training');
      }
    } finally {
      setUnlockingLevel(false);
    }
  };

  // Check if this is the last level (only within the current track)
  const isLastLevel = useMemo(() => {
    if (!level || !allLevels.length || !user?.careerTrack) return false;
    
    const currentTrackLevels = allLevels.filter(l => l.careerTrack === user.careerTrack);
    if (currentTrackLevels.length === 0) return true; // No levels in this track
    
    const maxOrder = Math.max(...currentTrackLevels.map(l => l.order));
    return level.order === maxOrder;
  }, [level, allLevels, user?.careerTrack]);

  // Check if there are any levels in the current track (only after loading and level data are available)
  const hasLevelsInTrack = useMemo(() => {
    // Only check if levels loading is complete and we have the necessary data
    if (levelsLoading || !allLevels.length || !user?.careerTrack) return true; // Return true during loading to avoid showing "No Levels"
    const currentTrackLevels = allLevels.filter(l => l.careerTrack === user.careerTrack);
    return currentTrackLevels.length > 0;
  }, [allLevels, user?.careerTrack, levelsLoading]);

  // Handle bootcamp completion
  const handleBootcampCompletion = async () => {
    if (!hasExerciseLinks) {
      return;
    }
    
    try {
      setUnlockingLevel(true);
      
      // Mark the current level as completed (exercise section)
      if (level && level.id && level.order) {
        console.log('Marking final level as completed:', { levelId: level.id, levelOrder: level.order, section: 'exercise' });
        const result = await apiService.markLevelCompleted(level.id, level.order, 'exercise');
        console.log('Final level completion result:', result);
      }
      
      // Trigger sidebar refresh to update unlock status
      setRefreshTrigger(prev => prev + 1);
      
      // Trigger dashboard progress update
      window.dispatchEvent(new CustomEvent('progress-updated'));
      window.dispatchEvent(new CustomEvent('exercise-completed'));
      window.dispatchEvent(new CustomEvent('level-completed'));
      localStorage.setItem('level-progress-updated', Date.now().toString());
      
      // Navigate to training levels page or dashboard
      console.log('Bootcamp completed - navigating to training page');
      navigate('/student/training');
    } catch (error) {
      console.error('Error marking final level as completed:', error);
      navigate('/student/training');
    } finally {
      setUnlockingLevel(false);
    }
  };

  if (loading || levelsLoading) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="text-center">
            <motion.img
              src={syncnerLogo}
              alt="Syncner Logo"
              className="w-16 h-16 mx-auto mb-4"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Loading exercise content...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
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

  // Check if there are any levels in the current track (only after all loading is complete)
  if (!levelsLoading && allLevels.length > 0 && !hasLevelsInTrack) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div 
              className="text-6xl mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              📚
            </div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Levels Available
            </h2>
            <p className="text-teallight mb-6">There are no levels available for your current career track ({user?.careerTrack || 'Unknown'}).</p>
            <button 
              onClick={() => navigate('/student/training')}
              className="bg-trueturquoise text-offblack px-6 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors"
            >
              Back to Training
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Check if exercise is unlocked (test must be passed)
  if (!isExerciseUnlocked) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div 
              className="text-6xl mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <LockClosedIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Exercise Locked
            </h2>
            <p className="text-teallight mb-6 text-lg">Pass the test first to unlock this exercise section.</p>
            <button 
              onClick={() => navigate(`/student/training/${levelId}/test`)}
              className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
            >
              Take Test First
            </button>
          </div>
        </main>
      </div>
    );
  }

  const validExercises = level.exercise ? level.exercise.filter(e => e && e.title && e.description) : [];
  
  if (!level.exercise || level.exercise.length === 0 || validExercises.length === 0) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div 
              className="text-6xl mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              💪
            </div>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Exercise Available
            </h2>
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
                  <h2 
              className="text-xl font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-paperwhite/20">
                              <th 
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  S.No
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Task name
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Brief
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Difficulty Level
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Credit Points
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Status
                </th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise, index) => {
              const isSubmitted = exerciseSubmissions.some(sub => sub.exerciseTitle === exercise.title);
              
              return (
                <tr key={index} className="border-b border-paperwhite/10 hover:bg-paperwhite/5">
                                  <td 
                  className="py-3 px-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {startIndex + index + 1}
                </td>
                <td 
                  className="py-3 px-4 font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {exercise.title}
                </td>
                <td 
                  className="py-3 px-4 text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {exercise.description}
                </td>
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
                  <td 
                  className="py-3 px-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {exercise.creditPoints}
                </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isSubmitted ? (
                        <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                          <CheckCircledIcon className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 bg-paperwhite/20 rounded"></div>
                      )}
                      <button 
                        onClick={() => handleViewExercise(exercise)}
                        className="bg-paperwhite/10 px-3 py-1 rounded text-sm hover:bg-paperwhite/20 transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
                      >
                        {isSubmitted ? 'Edit' : 'Submit'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div 
      className="flex h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="exercise" refreshTrigger={refreshTrigger} />
      <main 
        className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        {/* Exercise Header */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Level {level.order}: {level.title} - Exercise
            </h1>
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

        {/* Exercise Progress Status */}
        <div className="w-full max-w-5xl bg-gradient-to-r from-trueturquoise/10 to-teallight/10 rounded-xl border border-trueturquoise/30 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-trueturquoise text-offblack p-2 rounded-lg">
                <CheckCircledIcon className="h-6 w-6" />
              </div>
              <h2 
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Exercise Progress
            </h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-trueturquoise">{exerciseSubmissions.length}</div>
              <div className="text-xs text-teallight">Submissions</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-teallight mb-1">
              <span>Progress</span>
              <span>{Math.round((exerciseSubmissions.length / Math.max(validExercises.length, 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-paperwhite/20 rounded-full h-3">
              <div 
                className="bg-trueturquoise h-3 rounded-full transition-all duration-500"
                style={{ width: `${(exerciseSubmissions.length / Math.max(validExercises.length, 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {hasExerciseLinks ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-semibold">Exercise links submitted! You can now unlock the next level.</span>
              </div>
            </div>
          ) : (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-400">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="font-semibold">Submit exercise links to unlock the next level.</span>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Tables */}
        {mandatoryExercises.length > 0 && renderExerciseTable(mandatoryExercises, "Mandatory Task")}
        {optionalExercises.length > 0 && renderExerciseTable(optionalExercises, "Optional", mandatoryExercises.length)}

        {/* Action Buttons */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-8">
          {hasExerciseLinks ? (
            isLastLevel ? (
              // No button for last level - just show the celebration card
              null
            ) : (
              <button 
                onClick={handleUnlockNextLevel}
                disabled={unlockingLevel}
                className="w-full sm:w-auto bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {unlockingLevel ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-offblack"></div>
                    Unlocking...
                  </>
                ) : (
                  'Unlock Next Level'
                )}
              </button>
            )
          ) : (
            <button 
              disabled
                              className="w-full sm:w-auto bg-paperwhite/20 px-8 py-3 rounded-lg font-bold text-lg cursor-not-allowed flex items-center gap-2"
                style={{ color: 'var(--color-text-muted)' }}
            >
              <LockClosedIcon className="h-5 w-5" />
              Submit Exercise Links First
            </button>
          )}
        </div>

        {/* Bootcamp Completion Celebration */}
        {isLastLevel && hasExerciseLinks && (
          <div className="w-full max-w-5xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 shadow-lg p-8 mb-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">Congratulations!</h2>
            <p className="text-teallight text-lg mb-6">
              You've completed all levels in this bootcamp! You've successfully mastered the concepts and completed all exercises.
            </p>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="font-semibold text-lg">Bootcamp Completed Successfully!</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="bg-paperwhite/10 px-6 py-3 rounded-lg font-semibold hover:bg-paperwhite/20 transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate('/student/training')}
                className="bg-paperwhite/10 px-6 py-3 rounded-lg font-semibold hover:bg-paperwhite/20 transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                View All Levels
              </button>
            </div>
          </div>
        )}
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
          existingSubmission={exerciseSubmissions.find(sub => sub.exerciseTitle === selectedExercise.title)}
          onExerciseSubmitted={() => {
            // Trigger sidebar refresh when exercise is submitted
            setRefreshTrigger(prev => prev + 1);
            // Also refresh exercise status
            fetchExerciseStatus();
          }}
        />
      )}
    </div>
  );
};

export default LevelExercisePage; 