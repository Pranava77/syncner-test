import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { CheckCircledIcon, ClockIcon, ReaderIcon, LockClosedIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
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
  test: TestItem[];
  exercise: any[];
  order: number;
  isActive: boolean;
}

interface TestItem {
  question: string;
  options: string[];
  answer: string;
  order: number;
}

interface TestProgress {
  attempts: any[];
  isCompleted: boolean;
}

const TEST_DURATION = 10 * 60; // 10 minutes in seconds

const LevelTestPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [answers, setAnswers] = useState<{ [qIdx: number]: boolean[] }>({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // New state for test progress tracking
  const [isTestUnlocked, setIsTestUnlocked] = useState(false);
  const [testProgress, setTestProgress] = useState<TestProgress>({
    attempts: [],
    isCompleted: false
  });
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [canRetake, setCanRetake] = useState(true);
  const [retakeTimer, setRetakeTimer] = useState<number | null>(null);
  const [randomizedQuestions, setRandomizedQuestions] = useState<TestItem[]>([]);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [showRetakePopup, setShowRetakePopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLevel = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getLevel(levelId!);
      
      let levelData = null;
      if (response && response.data) {
        levelData = response.data;
      } else if (response) {
        levelData = response;
      }
      
      setLevel(levelData);
      
      // Randomize questions if test data exists
      if (levelData && levelData.test && levelData.test.length > 0) {
        
        // Randomize the order of questions
        const shuffled = [...levelData.test].sort(() => Math.random() - 0.5);
        setRandomizedQuestions(shuffled);
        
        // Initialize answers for all questions
        const initialAnswers = Object.fromEntries(
          shuffled.map((testItem: any, i: number) => {
            const optionsLength = testItem.options ? testItem.options.length : 0;
            return [i, new Array(optionsLength).fill(false)];
          })
        );
        setAnswers(initialAnswers);
      }
    } catch (error) {
      setError(`Failed to load test content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  // Fetch test unlock status and progress
  const fetchTestProgress = useCallback(async () => {
    if (!levelId) return;
    
    try {
      const response = await apiService.getLevelSectionStatus(levelId);
      if (response.success) {
        const { test } = response.data;
        
        console.log('Test progress data:', test);
        console.log('Test attempts array:', test.progress?.attempts);
        console.log('Attempts length:', test.progress?.attempts?.length);
        setIsTestUnlocked(test.isUnlocked);
        setTestProgress(test.progress || { attempts: [], isCompleted: false });
        
        // Check if user can retake test based on attempts and cooldown
        const attempts = test.progress?.attempts?.length || 0;
        let canRetake = attempts < 3;
        
        // If 3 attempts reached, check 5-hour cooldown
        if (attempts >= 3 && test.progress?.lastAttemptAt) {
          const lastAttempt = new Date(test.progress.lastAttemptAt);
          const hoursSinceLastAttempt = (Date.now() - lastAttempt.getTime()) / (1000 * 60 * 60);
          canRetake = hoursSinceLastAttempt >= 5; // 5-hour cooldown
          
          // Set retake timer if still in cooldown
          if (!canRetake) {
            const remainingHours = 5 - hoursSinceLastAttempt;
            const remainingSeconds = Math.ceil(remainingHours * 60 * 60);
            setRetakeTimer(remainingSeconds);
            // If still in cooldown, show current attempts
            setCurrentAttempt(attempts);
          } else {
            // Cooldown expired, reset attempts to 0 for fresh start
            setCurrentAttempt(0);
            setRetakeTimer(null);
          }
        } else {
          // Less than 3 attempts, show current attempts
          setCurrentAttempt(attempts);
        }
        
        setCanRetake(canRetake);
      }
    } catch (error) {
      // Handle error silently
    }
  }, [levelId]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
      fetchTestProgress();
    }
  }, [levelId, fetchLevel, fetchTestProgress]);

  // Timer effect for retake countdown (5-hour cooldown)
  useEffect(() => {
    if (retakeTimer === null || retakeTimer <= 0) return;

    const interval = setInterval(() => {
      setRetakeTimer(prev => {
        if (prev === null || prev <= 1) {
          setCanRetake(true);
          // Reset attempts to 0 when cooldown expires for fresh start
          setCurrentAttempt(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retakeTimer]);

  // Refresh test progress when cooldown expires
  useEffect(() => {
    if (canRetake && currentAttempt >= 3) {
      // Cooldown has expired, refresh the test progress to get updated state
      fetchTestProgress();
    }
  }, [canRetake, currentAttempt, fetchTestProgress]);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft === 0) {
      setSubmitted(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, submitted]);

  const handleCheck = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [qIdx]: prev[qIdx].map((checked, i) => (i === optIdx ? true : false)), // Set selected option to true, others to false
    }));
  };

  const calculateScore = (): number => {
    let correctAnswers = 0;
    let totalQuestions = randomizedQuestions.length;

    randomizedQuestions.forEach((question, qIdx) => {
      const userAnswer = answers[qIdx]?.findIndex(a => a);
      

      
      // Convert answer letter (A, B, C, D) to index (0, 1, 2, 3)
      const answerLetter = question.answer?.trim().toUpperCase();
      const correctAnswerIndex = answerLetter === 'A' ? 0 : 
                                answerLetter === 'B' ? 1 : 
                                answerLetter === 'C' ? 2 : 
                                answerLetter === 'D' ? 3 : -1;
      
      if (userAnswer === correctAnswerIndex) {
        correctAnswers++;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    return score;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!levelId) return;
    
    setIsSubmitting(true);
    
    const score = calculateScore();
    const passed = score >= 60;
    
    // Prepare answers for submission
    const answersForSubmission = randomizedQuestions.map((question, qIdx) => ({
      questionIndex: qIdx,
      selectedOption: answers[qIdx]?.findIndex(a => a) || -1
    }));
    
    try {
      const response = await apiService.submitTestAttempt(levelId, score, answersForSubmission);
      
      if (response.success) {
        setTestScore(score);
        setTestPassed(passed);
        // Update current attempt count - this should be the total attempts after this submission
        const totalAttempts = response.data.attempts || 0;
        
        // If this is a fresh start after cooldown (currentAttempt was 0), start counting from 1
        if (currentAttempt === 0 && canRetake) {
          setCurrentAttempt(1);
        } else {
          setCurrentAttempt(totalAttempts);
        }
        
        setCanRetake(response.data.canRetake);
        
        // If test is passed, mark the test section as completed
        if (passed && level) {
          try {
            const completionResult = await apiService.markLevelCompleted(level.id, level.order, 'test');
            
            // Trigger sidebar refresh to update unlock status
            setRefreshTrigger(prev => prev + 1);
            
            // Trigger dashboard progress update
            window.dispatchEvent(new CustomEvent('progress-updated'));
            localStorage.setItem('level-progress-updated', Date.now().toString());
          } catch (completionError) {
            console.error('Error marking test section as completed:', completionError);
          }
        }
        
        // Refresh test progress data to get updated attempts
        await fetchTestProgress();
        
        // Show results
        setSubmitted(true);
        
        // Always show results first, then handle navigation based on score
        if (passed) {
          // Test passed - user can proceed to exercise
          // The "Go to Exercise" button will be shown in the results
        } else {
          // Test failed - show attempts remaining and cooldown info
          // The retry information is shown in the results
          // Only show retake popup if all attempts are exhausted
          if (response.data.attempts >= 3 && !canRetake) {
            setShowRetakePopup(true);
          }
        }
      } else {
        // Handle API errors
        setTestScore(score);
        setTestPassed(passed);
      setSubmitted(true);
      }
    } catch (error) {
      // Still show results even if submission fails
      setTestScore(score);
      setTestPassed(passed);
    setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to top when test is submitted
  useEffect(() => {
    if (submitted && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [submitted]);

  // Retake timer countdown
  useEffect(() => {
    if (retakeTimer && retakeTimer > 0) {
      const interval = setInterval(() => {
        setRetakeTimer(prev => {
          if (prev && prev > 0) {
            return prev - 1;
          } else {
            setCanRetake(true);
            return null;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [retakeTimer]);

  // Handle completed test results display
  useEffect(() => {
    if (testProgress.isCompleted && !submitted && randomizedQuestions.length > 0) {
      // Get the last attempt to show results
      const lastAttempt = testProgress.attempts && testProgress.attempts.length > 0 
        ? testProgress.attempts[testProgress.attempts.length - 1] 
        : null;
      
      if (lastAttempt) {
        setTestScore(lastAttempt.score);
        setTestPassed(lastAttempt.passed);
        setSubmitted(true);
        
        // Set the answers from the last attempt
        if (lastAttempt.answers) {
          const previousAnswers: { [qIdx: number]: boolean[] } = {};
          lastAttempt.answers.forEach((answer: any) => {
            const questionIndex = answer.questionIndex;
            if (questionIndex >= 0 && questionIndex < randomizedQuestions.length) {
              const optionsLength = randomizedQuestions[questionIndex].options.length;
              const answerArray = new Array(optionsLength).fill(false);
              if (answer.selectedOption >= 0 && answer.selectedOption < optionsLength) {
                answerArray[answer.selectedOption] = true;
              }
              previousAnswers[questionIndex] = answerArray;
            }
          });
          setAnswers(previousAnswers);
        }
      }
    }
  }, [testProgress.isCompleted, testProgress.attempts, submitted, randomizedQuestions.length]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatRetakeTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
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
              Loading test content...
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
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="text-center">
            <p className="text-rust text-lg mb-4">{error || 'Level not found'}</p>
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

  // Check if test is unlocked
  if (!isTestUnlocked) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
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
              Test Locked
            </h2>
            <p className="text-teallight mb-6 text-lg">Complete the learning section first to unlock this test.</p>
            <button 
              onClick={() => navigate(`/student/training/${levelId}/learn`)}
              className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
            >
              Go to Learning
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Check if test is already completed - show results instead of just completion message
  if (testProgress.isCompleted && !submitted) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="w-full max-w-5xl bg-gradient-to-r from-green-500/10 to-teallight/10 rounded-xl border border-green-500/30 shadow-lg p-6 text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Test Already Completed!
            </h2>
            <p className="text-teallight mb-6 text-lg">You have successfully passed this test. You can now proceed to the exercise.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate(`/student/training/${levelId}/learn`)}
                className="bg-paperwhite text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise hover:text-offblack transition-colors text-lg shadow-sm"
              >
                Back to Learning
              </button>
              <button 
                onClick={() => navigate(`/student/training/${levelId}/exercise`)}
                className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
              >
                Go to Exercise
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state during submission
  if (isSubmitting) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
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
                  Submitting your test...
                </p>
          </div>
        </main>
      </div>
    );
  }

  // Check if max attempts reached or cooldown active (only before taking test and not after passing)
  if (!submitted && !testPassed && (currentAttempt >= 3 && !canRetake)) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/30 shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="h-10 w-10 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-paperwhite mb-3">
              Maximum Attempts Reached
            </h2>
            <p className="text-teallight mb-6 text-lg leading-relaxed">
              You have used all 3 attempts for this test. Please wait 5 hours before retaking.
            </p>
            {retakeTimer && (
              <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-xl p-6 mb-6 border border-paperwhite/20">
                <div className="text-trueturquoise font-semibold mb-2 text-sm">Time until you can retake:</div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {formatRetakeTime(retakeTimer)}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate(`/student/training/${levelId}/learn`)}
                className="bg-trueturquoise text-offblack px-8 py-3 rounded-xl font-semibold hover:bg-trueturquoise/90 transition-colors text-lg shadow-lg"
              >
                Back to Learning
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const validQuestions = randomizedQuestions.filter(q => q && q.question && q.options && q.options.length > 0);
  
  if (!level.test || level.test.length === 0 || validQuestions.length === 0) {
    return (
      <div 
        className="flex h-screen overflow-x-hidden"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div 
              className="text-6xl mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >📝</div>
            <h2 
              className="text-2xl font-heading mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Test Available
            </h2>
            <p className="text-teallight mb-6 text-lg">This level doesn't have any test questions yet.</p>
            <button 
              onClick={() => navigate(`/student/training/${levelId}/learn`)}
              className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
            >
              Back to Learning
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
        ref={scrollContainerRef}
      >
        {/* Test Header */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-trueturquoise text-offblack p-3 rounded-lg">
                  <ReaderIcon className="h-8 w-8" />
                </div>
            <div>
                  <h1 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Level {level.order}: {level.title} - Test
                    <span className="text-lg font-normal text-teallight ml-3">(Attempt {currentAttempt === 0 && canRetake ? 1 : currentAttempt}/3)</span>
                  </h1>
                  <p className="text-teallight text-lg">Test your knowledge with {validQuestions.length} questions</p>
                  <p className="text-orange-400 text-sm mt-1">Passing score: 60% or higher</p>
            </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-trueturquoise" />
                    <div className="text-2xl font-bold text-trueturquoise">{formatTime(timeLeft)}</div>
                  </div>
                  <div className="text-xs text-teallight font-label">Time Remaining</div>
                </div>
                <div className="text-center bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10">
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {validQuestions.length}
                  </div>
                  <div className="text-xs text-teallight font-label">Questions</div>
              </div>
            </div>
          </div>
        </div>

          {!submitted ? (
            <>
        {/* Test Questions */}
              <div className="w-full max-w-5xl space-y-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
          {validQuestions.map((question, qIdx) => (
            <div key={qIdx} className="bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Question {qIdx + 1}: {question.question}
              </h3>
              
                      <div className="space-y-4">
                {question.options.map((option, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-paperwhite/5 transition-colors ${
                              answers[qIdx]?.[optIdx] 
                                ? 'bg-trueturquoise/20 border-trueturquoise/30' 
                                : 'bg-paperwhite/5 border-paperwhite/10'
                            }`}
                            onClick={() => handleCheck(qIdx, optIdx)}
                          >
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-colors duration-200 ${
                              answers[qIdx]?.[optIdx]
                                ? 'bg-trueturquoise border-trueturquoise'
                                : 'border-paperwhite/20'
                            }`}>
                              {answers[qIdx]?.[optIdx] && (
                                <CheckCircledIcon className="h-4 w-4 text-offblack" aria-hidden="true" />
                              )}
                            </div>
                            <span 
                              className={`text-lg ${
                                answers[qIdx]?.[optIdx] ? 'text-trueturquoise font-semibold' : ''
                              }`}
                              style={{ 
                                color: answers[qIdx]?.[optIdx] ? undefined : 'var(--color-text-primary)'
                              }}
                            >
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </form>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-trueturquoise/90 transition-colors"
                  >
                    Submit Test
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="w-full max-w-5xl space-y-6 pb-8">
              {/* Results Header */}
              <div className={`rounded-xl border shadow-lg p-6 text-center ${
                testPassed 
                  ? 'bg-gradient-to-r from-green-500/10 to-teallight/10 border-green-500/30' 
                  : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'
              }`}>
                <h2 
                  className="text-2xl font-bold mb-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {testPassed ? 'Test Passed! 🎉' : 'Test Failed'}
                </h2>
                <div className="text-4xl font-bold mb-4">
                  <span className={testPassed ? 'text-green-400' : 'text-red-400'}>
                    {testScore}%
                  </span>
                </div>
                <p className="text-teallight mb-6 text-lg">
                  {testPassed 
                    ? 'Congratulations! You can now proceed to the exercise.'
                    : `You need 60% to pass. You scored ${testScore}%.`
                  }
                </p>
                
                {!testPassed && (
                  <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-xl p-6 mb-6 border border-paperwhite/20">
                    {(currentAttempt < 3 || (currentAttempt === 0 && canRetake)) ? (
                      <>
                        <div className="text-trueturquoise font-semibold mb-2 text-sm">Attempts Remaining</div>
                        <div 
                    className="text-3xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {currentAttempt === 0 && canRetake ? 3 : 3 - currentAttempt}
                  </div>
                        <div className="text-sm text-teallight mt-1">You can retry immediately</div>
                      </>
                    ) : (
                      <>
                        <div className="text-red-400 font-semibold mb-2 text-sm">Maximum Attempts Reached</div>
                        <div 
                    className="text-3xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    0
                  </div>
                        <div className="text-sm text-teallight mt-1">
                          {retakeTimer && retakeTimer > 0 ? (
                            <>Please wait {formatRetakeTime(retakeTimer)} before retaking</>
                          ) : (
                            <>Please wait 5 hours before retaking</>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate(`/student/training/${levelId}/learn`)}
                    className="bg-paperwhite/10 px-8 py-3 rounded-xl font-semibold hover:bg-paperwhite/20 transition-colors text-lg shadow-lg border border-paperwhite/20"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Back to Learning
                  </button>
                  {testPassed && (
                    <button 
                      onClick={() => navigate(`/student/training/${levelId}/exercise`)}
                      className="bg-trueturquoise text-offblack px-8 py-3 rounded-xl font-semibold hover:bg-trueturquoise/90 transition-colors text-lg shadow-lg"
                    >
                      Go to Exercise
                    </button>
                  )}
                </div>
              </div>

              {/* Answers Review Section */}
              <div className="bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6">
                <h3 
                className="text-xl font-bold mb-6 text-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Review Your Answers
              </h3>
                <div className="space-y-6">
                  {validQuestions.map((question, qIdx) => {
                    const userAnswerIndex = answers[qIdx]?.findIndex(a => a);
                    
                    // Convert answer letter (A, B, C, D) to index (0, 1, 2, 3) - same logic as calculateScore
                    const answerLetter = question.answer?.trim().toUpperCase();
                    const correctAnswerIndex = answerLetter === 'A' ? 0 : 
                                            answerLetter === 'B' ? 1 : 
                                            answerLetter === 'C' ? 2 : 
                                            answerLetter === 'D' ? 3 : -1;
                    
                    const isCorrect = userAnswerIndex === correctAnswerIndex;
                    const hasAnswered = userAnswerIndex !== undefined && userAnswerIndex !== -1;
                    

                    
                    return (
                      <div key={qIdx} className="bg-paperwhite/5 rounded-lg border border-paperwhite/10 p-4">
                                              <h4 
                        className="text-lg font-semibold mb-3"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Question {qIdx + 1}: {question.question}
                      </h4>
                        
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optIdx) => (
                            <div 
                              key={optIdx} 
                              className={`flex items-center p-3 rounded-lg border ${
                                optIdx === userAnswerIndex 
                                  ? isCorrect 
                                    ? 'bg-green-500/20 border-green-500/30' 
                                    : 'bg-red-500/20 border-red-500/30'
                                  : optIdx === correctAnswerIndex
                                    ? 'bg-green-500/20 border-green-500/30'
                                    : 'bg-paperwhite/5 border-paperwhite/10'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                                optIdx === userAnswerIndex
                                  ? isCorrect
                                    ? 'bg-green-500 border-green-500'
                                    : 'bg-red-500 border-red-500'
                                  : optIdx === correctAnswerIndex
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-paperwhite/20'
                              }`}>
                                {optIdx === userAnswerIndex && (
                                  <CheckCircledIcon className="h-3 w-3 text-white" aria-hidden="true" />
                                )}
                                {optIdx === correctAnswerIndex && optIdx !== userAnswerIndex && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                              <span 
                                className={`text-sm ${
                                  optIdx === userAnswerIndex 
                                    ? isCorrect 
                                      ? 'text-green-400 font-semibold' 
                                      : 'text-red-400 font-semibold'
                                    : optIdx === correctAnswerIndex
                                      ? 'text-green-400 font-semibold'
                                      : ''
                                }`}
                                style={{ 
                                  color: (optIdx === userAnswerIndex || optIdx === correctAnswerIndex) ? undefined : 'var(--color-text-primary)'
                                }}
                              >
                                {option}
                              </span>
            </div>
          ))}
                        </div>

                        <div className={`rounded-lg p-3 border ${
                          isCorrect 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : 'bg-red-500/10 border-red-500/20'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="text-sm font-semibold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                            {isCorrect ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-red-400">✗</span>
                            )}
                          </div>
                          <div className="text-xs text-teallight">
                            Your answer: {hasAnswered ? question.options[userAnswerIndex] : 'Not answered'}
                          </div>
                          {!isCorrect && hasAnswered && (
                            <div className="text-xs text-green-400 mt-1">
                              Correct answer: {correctAnswerIndex !== -1 ? question.options[correctAnswerIndex] : question.answer}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Retake Popup */}
          {showRetakePopup && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div 
                className="rounded-2xl shadow-2xl p-8 max-w-md w-full border border-paperwhite/20"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ExclamationTriangleIcon className="h-8 w-8 text-orange-400" />
                  </div>
                                <h2 
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Maximum Attempts Reached
              </h2>
                  <p className="text-teallight mb-6 text-base leading-relaxed">
                    You have used all 3 attempts for this test. Please wait 5 hours before retaking.
                  </p>
                  {retakeTimer && (
                    <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-xl p-6 mb-6 border border-paperwhite/20">
                      <div className="text-trueturquoise font-semibold mb-2 text-sm">Time until you can retake:</div>
                      <div 
                        className="text-3xl font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {formatRetakeTime(retakeTimer)}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setShowRetakePopup(false)}
                      className="bg-trueturquoise text-offblack px-6 py-3 rounded-xl font-semibold hover:bg-trueturquoise/90 transition-colors shadow-lg"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => navigate(`/student/training/${levelId}/learn`)}
                      className="bg-paperwhite/10 px-6 py-3 rounded-xl font-semibold hover:bg-paperwhite/20 transition-colors border border-paperwhite/20"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Back to Learning
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
};

export default LevelTestPage; 