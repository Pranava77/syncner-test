import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchCurriculum } from '../redux/slices/curriculumSlice';
import LevelsSidebar from '../components/LevelsSidebar';
import { motion } from 'framer-motion';
import { StarIcon, ClockIcon, CheckCircledIcon, Cross1Icon } from '@radix-ui/react-icons';

const TrainingLevels: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: levels, loading, error } = useAppSelector((state) => state.curriculum);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.careerTrack) {
      dispatch(fetchCurriculum(user.careerTrack));
    }
  }, [dispatch, user?.careerTrack]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'fullstack': return 'bg-blue-500';
      case 'ai-ml': return 'bg-purple-500';
      case 'ui-ux': return 'bg-pink-500';
      case 'data-science': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackLabel = (track: string) => {
    switch (track) {
      case 'fullstack': return 'Full Stack';
      case 'ai-ml': return 'AI/ML';
      case 'ui-ux': return 'UI/UX';
      case 'data-science': return 'Data Science';
      default: return track;
    }
  };

  const handleLevelClick = (level: any) => {
    navigate(`/student/training/${level.id}/learn`);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack w-full">
        <LevelsSidebar />
        <main className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto mb-4"></div>
            <p className="text-paperwhite text-lg">Loading training levels...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-offblack w-full">
        <LevelsSidebar />
        <main className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => dispatch(fetchCurriculum(user?.careerTrack))}
              className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-offblack w-full">
      <LevelsSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
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

          {levels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-paperwhite/30 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-heading text-paperwhite mb-2">
                {user?.careerTrack ? 
                  `No levels available for ${getTrackLabel(user.careerTrack)} track` :
                  'No levels available'
                }
              </h3>
              <p className="text-teallight">
                {user?.careerTrack ? 
                  'Check back later for new training content in your track' :
                  'Check back later for new training content'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {levels.map((level, index) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleLevelClick(level)}
                  className="bg-offblack border border-paperwhite/20 rounded-lg p-6 cursor-pointer hover:border-trueturquoise/50 hover:bg-paperwhite/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${getDifficultyColor(level.difficulty)}`}>
                      <StarIcon className="h-5 w-5" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTrackColor(level.careerTrack)} text-white`}>
                      {getTrackLabel(level.careerTrack)}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading text-paperwhite mb-2">{level.title}</h3>
                  <p className="text-teallight text-sm mb-4 line-clamp-2">{level.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-teallight">
                      <ClockIcon className="h-3 w-3" />
                      <span>{level.estimatedHours}h estimated</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-teallight">
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(level.difficulty)} text-white`}>
                        {level.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-teallight">
                      <span>📖 {level.learn.length} learn</span>
                      <span>📝 {level.test.length} test</span>
                      <span>💪 {level.exercise.length} exercise</span>
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