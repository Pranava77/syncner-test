import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { useCareerTrack } from '../hooks/useCareerTracks';
import { fetchModules } from '../redux/slices/modulesSlice';
import { fetchProgress } from '../redux/slices/progressSlice';
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircledIcon,
  ReaderIcon,
  ClockIcon,
  TargetIcon,
  StarFilledIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
import LoadingScreen from '../components/LoadingScreen';

// Add helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

const TrainingModule: React.FC = () => {
  const dispatch = useAppDispatch();
  const { moduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const modulesState = useAppSelector((state) => state.modules);
  const progressState = useAppSelector((state) => state.progress);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  // Get the career track and module data from API
  const userTrack = user?.careerTrack || '';
  const { track, loading: trackLoading } = useCareerTrack(userTrack);

  useEffect(() => {
    if ((!modulesState.data || modulesState.data.length === 0) || modulesState.lastFetched === null) {
      dispatch(fetchModules(user?.careerTrack));
    }
    if (!progressState.data || progressState.lastFetched === null) {
      dispatch(fetchProgress());
    }
  }, [dispatch, user?.careerTrack]);

  const modules = modulesState.data || [];
  const progress = progressState.data;
  const modulesLoading = modulesState.loading;
  const progressLoading = progressState.loading;

  const module = modules.find(m => m.id === moduleId) || modules[0];

  // Redirect logic
  useEffect(() => {
    if (!modulesLoading && !trackLoading) {
      // If on /student/training/current, redirect to first module
      if (location.pathname === '/student/training/current' && modules.length > 0) {
        const firstModule = modules[0];
        navigate(`/student/training/${firstModule.id}`, { replace: true });
      }
      // If on /student/training/:moduleId and module is not in user's track, redirect
      if (moduleId && modules.length > 0 && !modules.some(m => m.id === moduleId)) {
        navigate('/student/training/current', { replace: true });
      }
    }
  }, [modulesLoading, trackLoading, modules, moduleId, location.pathname, navigate]);

  const quiz = {
    question: 'What is the primary purpose of React Hooks?',
    options: [
      'To style React components',
      'To manage state and lifecycle in functional components',
      'To handle routing in React apps',
      'To optimize React performance'
    ],
    correct: 1
  };

  const currentContent = module?.lessons?.[currentLesson];

  const handleNext = () => {
    if (module?.lessons && currentLesson < module.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setShowQuiz(false);
    }
  };

  const handlePrevious = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      setShowQuiz(false);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === quiz.options[quiz.correct]) {
      setCompletedLessons(prev => new Set([...prev, currentContent.id]));
      alert('Correct! Moving to next lesson...');
      handleNext();
    } else {
      alert('Incorrect. Please try again.');
    }
  };

  const handleLessonComplete = () => {
    setCompletedLessons(prev => new Set([...prev, currentContent.id]));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (trackLoading || modulesLoading) {
    return <LoadingScreen message="Loading module..." />;
  }

  if (!module) {
    return (
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-offblack">
        <div className="text-center py-12">
          <ReaderIcon className="h-12 w-12 text-teallight mx-auto mb-4" />
          <h3 className="text-lg font-medium text-paperwhite mb-2">Module Not Found</h3>
          <p className="text-teallight">The requested module could not be found.</p>
          <Link
            to="/student/dashboard"
            className="mt-4 inline-flex items-center text-trueturquoise hover:text-teallight"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-offblack min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/student/dashboard"
          className="text-trueturquoise hover:text-teallight flex items-center mb-4"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 rounded-full text-sm bg-trueturquoise/20 text-trueturquoise font-label">{module.difficulty}</span>
                <span className="text-teallight">•</span>
                <span className="text-teallight">{track?.name}</span>
              </div>
              <h1 className="text-3xl text-paperwhite mb-2 font-heading">{module.title}</h1>
              <p className="text-teallight mb-4">{module.description}</p>
              <div className="flex items-center space-x-6 text-sm text-teallight">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {module.duration}
                </div>
                <div className="flex items-center">
                  <TargetIcon className="h-4 w-4 mr-1" />
                  {module.difficulty}
                </div>
                <div className="flex items-center">
                  <ReaderIcon className="h-4 w-4 mr-1" />
                  {completedLessons.size}/{module.lessons.length} completed
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-trueturquoise/10 text-trueturquoise px-3 py-1 rounded-full text-sm font-medium mb-2">
                {progress}% Complete
              </div>
              <div className="w-32 bg-paperwhite/20 rounded-full h-2">
                <div
                  className="bg-trueturquoise h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold text-paperwhite mb-3">Skills You'll Learn</h3>
            <div className="flex flex-wrap gap-2">
              {module.skills.map((skill: string) => (
                <span key={skill} className="bg-trueturquoise/10 text-trueturquoise px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Lesson List */}
        <div className="lg:col-span-1">
          <div className="bg-paperwhite/10 rounded-xl shadow-lg p-6 sticky top-8">
            <h3 className="font-semibold text-paperwhite mb-4">Lessons</h3>
            <div className="space-y-2">
              {module.lessons.map((lesson: any, index: number) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setCurrentLesson(index);
                    setShowQuiz(lesson.type === 'quiz');
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentLesson
                      ? 'bg-trueturquoise/10 border border-trueturquoise'
                      : 'hover:bg-paperwhite/10'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${
                      completedLessons.has(lesson.id)
                        ? 'text-trueturquoise'
                        : index === currentLesson
                        ? 'text-trueturquoise'
                        : 'text-teallight'
                    }`}>
                      {completedLessons.has(lesson.id) ? (
                        <CheckCircledIcon className="h-4 w-4" />
                      ) : lesson.type === 'quiz' ? (
                        <StarFilledIcon className="h-4 w-4 text-rust" />
                      ) : lesson.type === 'project' ? (
                        <TargetIcon className="h-4 w-4 text-teallight" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-label ${
                        index === currentLesson ? 'text-trueturquoise' : 'text-paperwhite'
                      }`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-teallight">{lesson.duration}</p>
                        <span className="text-xs text-teallight">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          lesson.type === 'video' ? 'bg-trueturquoise/10 text-trueturquoise' :
                          lesson.type === 'quiz' ? 'bg-rust/10 text-rust' :
                          lesson.type === 'project' ? 'bg-teallight/10 text-teallight' :
                          'bg-paperwhite/10 text-paperwhite'
                        }`}>
                          {lesson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Prerequisites */}
            {module.prerequisites && module.prerequisites.length > 0 && (
              <div className="mt-6 pt-6 border-t border-trueturquoise">
                <h4 className="font-medium text-paperwhite mb-3 font-heading">Prerequisites</h4>
                <div className="space-y-2">
                  {module.prerequisites.map((prereq: string) => (
                    <div key={prereq} className="flex items-center text-sm text-teallight">
                      <LockClosedIcon className="h-3 w-3 mr-2" />
                      {prereq.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-paperwhite/5 rounded-xl shadow-sm">
            {!showQuiz ? (
              /* Video/Reading Content */
              <div>
                {/* Video player for video lessons */}
                {currentContent.type === 'video' && currentContent.videoUrl ? (
                  <div className="aspect-video bg-offblack rounded-t-xl flex items-center justify-center">
                    {extractYouTubeId(currentContent.videoUrl) ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(currentContent.videoUrl)}`}
                        title={currentContent.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-t-xl"
                      />
                    ) : (
                      <div className="text-paperwhite text-center p-8">Invalid or missing YouTube URL</div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-offblack rounded-t-xl relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-paperwhite/20 hover:bg-paperwhite/30 rounded-full p-4 transition-colors"
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-8 w-8 text-paperwhite" />
                        ) : (
                          <PlayIcon className="h-8 w-8 text-paperwhite ml-1" />
                        )}
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 text-paperwhite">
                      <p className="text-lg font-semibold">{currentContent.title}</p>
                      <p className="text-sm text-teallight">{currentContent.duration}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded text-xs font-label ${
                        currentContent.type === 'video' ? 'bg-trueturquoise text-offblack' :
                        currentContent.type === 'reading' ? 'bg-teallight text-offblack' :
                        'bg-rust text-paperwhite'
                      }`}>
                        {currentContent.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-8">
                  <h2 className="text-2xl text-paperwhite mb-4 font-heading">
                    {currentContent.title}
                  </h2>
                  <p className="text-teallight mb-6 leading-relaxed">
                    {currentContent.content}
                  </p>

                  <div className="bg-trueturquoise/10 rounded-lg p-4 mb-6">
                    <h3 className="text-trueturquoise mb-2 font-heading">Key Learning Points:</h3>
                    <ul className="space-y-1 text-trueturquoise text-sm">
                      <li>• Understand core concepts and terminology</li>
                      <li>• Learn practical implementation techniques</li>
                      <li>• Master best practices and common patterns</li>
                      <li>• Apply knowledge through hands-on examples</li>
                    </ul>
                  </div>

                  {/* Resources */}
                  {currentContent.resources && (
                    <div className="bg-paperwhite/10 rounded-lg p-4">
                      <h3 className="text-paperwhite mb-2 font-heading">Additional Resources:</h3>
                      <ul className="space-y-1">
                        {currentContent.resources.map((resource: string, index: number) => (
                          <li key={index} className="text-sm text-teallight">
                            • {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mark as Complete */}
                  {!completedLessons.has(currentContent.id) && (
                    <div className="mt-6">
                      <button
                        onClick={handleLessonComplete}
                        className="bg-trueturquoise text-offblack px-6 py-2 rounded-lg hover:bg-teallight hover:text-offblack transition-colors font-medium flex items-center"
                      >
                        <CheckCircledIcon className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Content */
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="bg-rust/10 p-3 rounded-full w-fit mx-auto mb-4">
                    <StarFilledIcon className="h-8 w-8 text-rust" />
                  </div>
                  <h2 className="text-2xl font-bold text-paperwhite mb-2 font-heading">Knowledge Check</h2>
                  <p className="text-teallight">Test your understanding of the concepts covered</p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-paperwhite/10 rounded-lg p-6 mb-6">
                    <h3 className="text-lg text-paperwhite mb-4 font-heading">
                      {quiz.question}
                    </h3>
                    <div className="space-y-3">
                      {quiz.options.map((option: string, index: number) => (
                        <label
                          key={index}
                          className="flex items-center p-3 border border-paperwhite/20 rounded-lg cursor-pointer hover:bg-paperwhite/5 transition-colors font-label"
                        >
                          <input
                            type="radio"
                            name="quiz-answer"
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedAnswer === option
                              ? 'border-rust bg-rust'
                              : 'border-paperwhite/30'
                          }`}>
                            {selectedAnswer === option && (
                              <div className="w-1.5 h-1.5 bg-paperwhite rounded-full"></div>
                            )}
                          </div>
                          <span className="text-paperwhite">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleQuizSubmit}
                    disabled={!selectedAnswer}
                    className="w-full bg-rust text-paperwhite py-3 rounded-lg hover:bg-trueturquoise hover:text-offblack transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 border-t border-paperwhite/10">
              <button
                onClick={handlePrevious}
                disabled={currentLesson === 0}
                className="flex items-center px-4 py-2 text-teallight hover:text-trueturquoise disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-teallight">
                  {currentLesson + 1} of {module.lessons.length}
                </div>
                <div className="flex items-center text-trueturquoise">
                  <StarFilledIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.round((completedLessons.size / module.lessons.length) * 100)} XP
                  </span>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={currentLesson === module.lessons.length - 1}
                className="flex items-center px-4 py-2 bg-trueturquoise text-offblack rounded-lg hover:bg-teallight hover:text-offblack disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingModule;
