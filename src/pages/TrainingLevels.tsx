import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import LevelsSidebar from '../components/LevelsSidebar';
import { useLevels } from '../hooks/useLevels';
import { motion } from 'framer-motion';
import {  ClockIcon, CheckCircledIcon, Cross1Icon, ReaderIcon, ClipboardIcon, PlayIcon, LockClosedIcon } from '@radix-ui/react-icons';

interface LearnItem {
  type: 'video' | 'reading' | 'slide' | 'other';
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

interface TestItem {
  question: string;
  options: string[];
  answer: string;
  order: number;
}

interface ExerciseItem {
  title: string;
  description: string;
  resources: string[];
  order: number;
}

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: LearnItem[];
  test: TestItem[];
  exercise: ExerciseItem[];
  order: number;
  isActive: boolean;
  estimatedHours: number;
  progress?: number;
  status?: string;
  isUnlocked?: boolean;
  isCompleted?: boolean;
  completedSections?: {
    learn?: boolean;
    exercise?: boolean;
    test?: boolean;
  };
}

const TrainingLevels: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Use the optimized hook
  const { levels, loading, error, refetch } = useLevels(user?.careerTrack);

  // Memoized level completion map for efficient lookups
  const levelCompletionMap = useMemo(() => {
    const map = new Map();
    levels.forEach((level: Level) => {
      map.set(level.order, {
        id: level.id,
        completedSections: level.completedSections || {},
        isCompleted: level.isCompleted || false,
        isUnlocked: level.isUnlocked || false
      });
    });
    return map;
  }, [levels]);

  // Memoized levels with unlock logic
  const levelsWithUnlockLogic = useMemo(() => {
    return levels.map((level: Level) => {
      // Level 1 is always unlocked
      if (level.order === 1) {
        return {
          ...level,
          isUnlocked: true
        };
      }

      // Check if previous level is fully completed
      const previousLevel = levelCompletionMap.get(level.order - 1);
      const previousCompletedSections = previousLevel?.completedSections || {};
      
      const isPreviousFullyCompleted = 
        previousCompletedSections.learn === true && 
        previousCompletedSections.test === true && 
        previousCompletedSections.exercise === true;

      return {
        ...level,
        isUnlocked: isPreviousFullyCompleted
      };
    });
  }, [levels, levelCompletionMap]);

  // Handle progress updates
  const handleProgressUpdate = () => {
    refetch();
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'level-progress-updated') {
      handleProgressUpdate();
    }
  };

  useEffect(() => {
    window.addEventListener('progress-updated', handleProgressUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleProgressUpdate, handleStorageChange]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'full-stack': return 'bg-blue-500';
      case 'ai-ml': return 'bg-purple-500';
      case 'ui-ux': return 'bg-pink-500';
      case 'data-science': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackLabel = (track: string) => {
    switch (track) {
      case 'full-stack': return 'Full Stack';
      case 'ai-ml': return 'AI/ML';
      case 'ui-ux': return 'UI/UX';
      case 'data-science': return 'Data Science';
      default: return track;
    }
  };

  const handleLevelClick = (level: Level) => {
    if (level.isUnlocked) {
      navigate(`/student/training/${level.id}/learn`);
    } else {
      // Show message that level is locked
      alert('This level is locked. Complete the previous level\'s exercises to unlock it.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack">
        <LevelsSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          refreshTrigger={0}
        />
        <main className="flex-1 overflow-y-auto scroll-smooth p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-paperwhite mb-4">Training Levels</h1>
              <p className="text-teallight text-lg">Master your skills through structured learning paths</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-paperwhite/5 rounded-xl p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-paperwhite/10 rounded"></div>
                    <div className="h-4 bg-paperwhite/5 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-paperwhite/5 rounded"></div>
                      <div className="h-3 bg-paperwhite/5 rounded w-2/3"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-paperwhite/10 rounded w-16"></div>
                      <div className="h-8 bg-paperwhite/10 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-offblack w-full">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-heading text-paperwhite mb-2">Unable to Load Training Levels</h3>
            <p className="text-teallight text-sm mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={refetch}
                className="w-full bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium"
              >
                Try Again
              </button>
              <p className="text-xs text-teallight">
                If the problem persists, please check your connection or contact support.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-offblack w-full">
      <LevelsSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        refreshTrigger={0} // No longer needed as refetch is handled by useLevels
      />
      <main className="flex-1 overflow-y-auto scroll-smooth p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-paperwhite mb-2">Training Levels</h1>
            <p className="text-teallight">
              {user?.careerTrack ? 
                `${getTrackLabel(user.careerTrack)} Track - Complete these levels to advance your skills` :
                'Complete these levels to advance your skills'
              }
            </p>
          </div>

          {levelsWithUnlockLogic.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-paperwhite/30 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-heading text-paperwhite mb-2">
                {user?.careerTrack ? 
                  `No levels available for ${getTrackLabel(user.careerTrack)} track` :
                  'No levels available'
                }
              </h3>
              <p className="text-teallight mb-6">
                {user?.careerTrack ? 
                  'Check back later for new training content in your track' :
                  'Check back later for new training content'
                }
              </p>
              <div className="space-y-2 text-sm text-teallight">
                <p>Debug Info:</p>
                <p>User Career Track: {user?.careerTrack || 'Not set'}</p>
                <p>Total Levels Found: {levelsWithUnlockLogic.length}</p>
                <button 
                  onClick={refetch}
                  className="mt-4 bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors text-sm"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {levelsWithUnlockLogic.map((level, index) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleLevelClick(level)}
                  className={`bg-offblack border rounded-lg p-6 transition-all duration-300 relative ${
                    level.isUnlocked 
                      ? 'border-paperwhite/20 cursor-pointer hover:border-trueturquoise/50 hover:bg-paperwhite/5' 
                      : 'border-paperwhite/10 cursor-not-allowed opacity-60'
                  }`}
                >
                  {/* Level Order Indicator */}
                  <div className="absolute top-2 right-2 bg-paperwhite/10 text-paperwhite/60 text-xs px-2 py-1 rounded-full">
                    #{level.order}
                  </div>
                  
                  {/* Lock Icon for locked levels */}
                  {!level.isUnlocked && (
                    <div className="absolute top-2 left-2 bg-red-500/20 text-red-400 p-2 rounded-full">
                      <LockClosedIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Level Number Badge */}
                      <div className="bg-trueturquoise text-offblack px-3 py-1 rounded-lg font-bold text-sm">
                        Level {level.order}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(level.difficulty)} text-white`}>
                        {level.difficulty}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTrackColor(level.careerTrack)} text-white`}>
                      {getTrackLabel(level.careerTrack)}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading text-paperwhite mb-2">
                    Level {level.order}: {level.title}
                  </h3>
                  <p className="text-teallight text-sm mb-4 line-clamp-2">{level.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-teallight">
                      <ClockIcon className="h-3 w-3" />
                      <span>{level.estimatedHours}h estimated</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-teallight">
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(level.difficulty)} text-white`}>
                        {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4 text-xs text-teallight">
                    <span className="flex items-center gap-1">
                      <ReaderIcon className="h-3 w-3" />
                      {level.learn.length} learn
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardIcon className="h-3 w-3" />
                      {level.test.length} test
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayIcon className="h-3 w-3" />
                      {level.exercise.length} exercise
                    </span>
                  </div>
                    <div className="flex items-center gap-1 text-xs">
                      {level.isActive ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircledIcon className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <Cross1Icon className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {level.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {level.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-trueturquoise/20 text-trueturquoise text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {level.skills.length > 3 && (
                          <span className="px-2 py-1 bg-paperwhite/20 text-paperwhite text-xs rounded">
                            +{level.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingLevels; 