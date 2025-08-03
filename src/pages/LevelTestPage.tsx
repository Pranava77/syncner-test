import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { CheckCircledIcon, ClockIcon, ReaderIcon, LockClosedIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import apiService from '../services/api';

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

  const fetchLevel = useCallback(async () => {
    try {
      setLoading(true);
      console.log('LevelTestPage: Fetching level with ID:', levelId);
      const response = await apiService.getLevel(levelId!);
      console.log('LevelTestPage: Level data response:', response);
      
      let levelData = null;
      if (response && response.data) {
        levelData = response.data;
      } else if (response) {
        levelData = response;
      }
      
      setLevel(levelData);
      
      // Randomize questions if test data exists
      if (levelData && levelData.test && levelData.test.length > 0) {
        console.log('LevelTestPage: Test data:', levelData.test);
        console.log('LevelTestPage: Test data length:', levelData.test.length);
        
        // Randomize the order of questions
        const shuffled = [...levelData.test].sort(() => Math.random() - 0.5);
        setRandomizedQuestions(shuffled);
        
        // Initialize answers for all questions
        const initialAnswers = Object.fromEntries(
          shuffled.map((testItem: any, i: number) => {
            const optionsLength = testItem.options ? testItem.options.length : 0;
            console.log(`LevelTestPage: Question ${i} parsed data:`, {
              question: testItem.question,
              options: testItem.options,
              answer: testItem.answer,
              answerType: typeof testItem.answer
            });
            return [i, new Array(optionsLength).fill(false)];
          })
        );
        setAnswers(initialAnswers);
      } else {
        console.log('LevelTestPage: No test data found in level:', levelData);
      }
    } catch (error) {
      console.error('LevelTestPage: Error fetching level:', error);
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
        
        setIsTestUnlocked(test.isUnlocked);
        setTestProgress(test.progress || { attempts: [], isCompleted: false });
        setCurrentAttempt(test.progress?.attempts?.length || 0);
        setCanRetake(test.progress ? (test.progress.attempts.length < 3) : true);
        
        // Calculate retake timer if needed
        if (test.progress && test.progress.lastAttemptAt) {
          const lastAttempt = new Date(test.progress.lastAttemptAt);
          const minutesSinceLastAttempt = (Date.now() - lastAttempt.getTime()) / (1000 * 60);
          if (minutesSinceLastAttempt < 1) {
            const remainingMinutes = 1 - minutesSinceLastAttempt;
            setRetakeTimer(Math.ceil(remainingMinutes * 60)); // Convert to seconds
          }
        }
      }
    } catch (error) {
      console.error('Error fetching test progress:', error);
    }
  }, [levelId]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
      fetchTestProgress();
    }
  }, [levelId, fetchLevel, fetchTestProgress]);

  // Timer effect for retake countdown
  useEffect(() => {
    if (retakeTimer === null || retakeTimer <= 0) return;

    const interval = setInterval(() => {
      setRetakeTimer(prev => {
        if (prev === null || prev <= 1) {
          setCanRetake(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retakeTimer]);

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
      [qIdx]: prev[qIdx].map((checked, i) => (i === optIdx ? !checked : checked)),
    }));
  };

  const calculateScore = (): number => {
    let correctAnswers = 0;
    let totalQuestions = randomizedQuestions.length;

    randomizedQuestions.forEach((question, qIdx) => {
      const userAnswer = answers[qIdx]?.findIndex(a => a);
      
      // Convert answer letter (A, B, C, D) to index (0, 1, 2, 3)
      const answerLetter = question.answer.trim().toUpperCase();
      const correctAnswerIndex = answerLetter === 'A' ? 0 : 
                                answerLetter === 'B' ? 1 : 
                                answerLetter === 'C' ? 2 : 
                                answerLetter === 'D' ? 3 : -1;
      
      console.log(`Question ${qIdx}: User selected index ${userAnswer}, Correct answer is ${answerLetter} (index ${correctAnswerIndex})`);
      
      if (userAnswer === correctAnswerIndex) {
        correctAnswers++;
        console.log(`Question ${qIdx}: CORRECT!`);
      } else {
        console.log(`Question ${qIdx}: INCORRECT!`);
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    console.log(`Final score: ${correctAnswers}/${totalQuestions} = ${score}%`);
    return score;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!levelId) return;
    
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
        setCurrentAttempt(response.data.attempts);
        setCanRetake(response.data.canRetake);
        
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
          if (response.data.attempts >= 3) {
            setShowRetakePopup(true);
          }
        }
      } else {
        // Handle API errors
        console.error('Test submission failed:', response.message);
        setTestScore(score);
        setTestPassed(passed);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting test attempt:', error);
      // Still show results even if submission fails
      setTestScore(score);
      setTestPassed(passed);
      setSubmitted(true);
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
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto mb-4"></div>
            <p className="text-paperwhite text-lg">Loading test content...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
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
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div className="text-paperwhite/30 text-6xl mb-4">
              <LockClosedIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-paperwhite mb-2">Test Locked</h2>
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

  // Check if test is already completed
  if (testProgress.isCompleted) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-gradient-to-r from-green-500/10 to-teallight/10 rounded-xl border border-green-500/30 shadow-lg p-6 text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-paperwhite mb-2">Test Already Completed!</h2>
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

  // Check if max attempts reached or cooldown active (only before taking test)
  if (!submitted && (currentAttempt >= 3 || (currentAttempt > 0 && !canRetake))) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30 shadow-lg p-6 text-center">
            <div className="text-orange-400 text-6xl mb-4">
              <ExclamationTriangleIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-paperwhite mb-2">
              {currentAttempt >= 3 ? 'Maximum Attempts Reached' : 'Test Cooldown Active'}
            </h2>
            <p className="text-teallight mb-6 text-lg">
              {currentAttempt >= 3 
                ? 'You have used all 3 attempts for this test. Please wait 1 minute before retaking.'
                : 'Please wait before retaking the test.'
              }
            </p>
            {retakeTimer && (
              <div className="bg-paperwhite/5 rounded-lg p-4 mb-6">
                <div className="text-trueturquoise font-semibold mb-2">Time until you can retake:</div>
                <div className="text-2xl font-bold text-paperwhite">{formatRetakeTime(retakeTimer)}</div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate(`/student/training/${levelId}/learn`)}
                className="bg-paperwhite text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise hover:text-offblack transition-colors text-lg shadow-sm"
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
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div className="text-paperwhite/30 text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-heading text-paperwhite mb-2">No Test Available</h2>
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
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" refreshTrigger={refreshTrigger} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center" ref={scrollContainerRef}>
          {/* Test Header */}
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-trueturquoise text-offblack p-3 rounded-lg">
                  <ReaderIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-paperwhite mb-2">
                    Level {level.order}: {level.title} - Test
                    <span className="text-lg font-normal text-teallight ml-3">(Attempt {currentAttempt + 1}/3)</span>
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
                  <div className="text-2xl font-bold text-paperwhite mb-2">{validQuestions.length}</div>
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
                      <h3 className="text-lg font-semibold text-paperwhite mb-4">
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
                            <span className={`text-lg ${
                              answers[qIdx]?.[optIdx] ? 'text-trueturquoise font-semibold' : 'text-paperwhite'
                            }`}>
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
                <h2 className="text-2xl font-bold text-paperwhite mb-4">
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
                  <div className="bg-paperwhite/5 rounded-lg p-4 mb-6">
                    {currentAttempt < 3 ? (
                      <>
                        <div className="text-orange-400 font-semibold mb-2">Attempts Remaining</div>
                        <div className="text-2xl font-bold text-paperwhite">{3 - currentAttempt}</div>
                        <div className="text-sm text-teallight mt-1">You can retry after 1 minute</div>
                      </>
                    ) : (
                      <>
                        <div className="text-red-400 font-semibold mb-2">Maximum Attempts Reached</div>
                        <div className="text-2xl font-bold text-paperwhite">0</div>
                        <div className="text-sm text-teallight mt-1">Please wait 1 minute before retaking</div>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate(`/student/training/${levelId}/learn`)}
                    className="bg-paperwhite text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise hover:text-offblack transition-colors text-lg shadow-sm"
                  >
                    Back to Learning
                  </button>
                  {testPassed && (
                    <button 
                      onClick={() => navigate(`/student/training/${levelId}/exercise`)}
                      className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
                    >
                      Go to Exercise
                    </button>
                  )}
                </div>
              </div>

              {/* Answers Review Section */}
              <div className="bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6">
                <h3 className="text-xl font-bold text-paperwhite mb-6 text-center">Review Your Answers</h3>
                <div className="space-y-6">
                  {validQuestions.map((question, qIdx) => {
                    const userAnswerIndex = answers[qIdx]?.findIndex(a => a);
                    const correctAnswerIndex = question.options.findIndex(option => 
                      option.trim().toLowerCase() === question.answer.trim().toLowerCase()
                    );
                    const isCorrect = userAnswerIndex === correctAnswerIndex;
                    
                    return (
                      <div key={qIdx} className="bg-paperwhite/5 rounded-lg border border-paperwhite/10 p-4">
                        <h4 className="text-lg font-semibold text-paperwhite mb-3">
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
                              <span className={`text-sm ${
                                optIdx === userAnswerIndex 
                                  ? isCorrect 
                                    ? 'text-green-400 font-semibold' 
                                    : 'text-red-400 font-semibold'
                                  : optIdx === correctAnswerIndex
                                    ? 'text-green-400 font-semibold'
                                    : 'text-paperwhite'
                              }`}>
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
                            <span className="text-sm font-semibold text-paperwhite">
                              {isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                            {isCorrect ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-red-400">✗</span>
                            )}
                          </div>
                          <div className="text-xs text-teallight">
                            Your answer: {userAnswerIndex !== -1 ? question.options[userAnswerIndex] : 'Not answered'}
                          </div>
                          {!isCorrect && (
                            <div className="text-xs text-green-400 mt-1">
                              Correct answer: {question.answer}
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-paperwhite/95 rounded-xl border border-paperwhite/20 shadow-lg p-6 max-w-md w-full">
                <div className="text-center">
                  <div className="text-orange-400 text-6xl mb-4">
                    <ExclamationTriangleIcon className="h-16 w-16 mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold text-paperwhite mb-2">
                    {currentAttempt >= 3 ? 'Maximum Attempts Reached' : 'Test Cooldown Active'}
                  </h2>
                  <p className="text-teallight mb-6 text-lg">
                    {currentAttempt >= 3 
                      ? 'You have used all 3 attempts for this test. Please wait 24 hours before retaking.'
                      : 'Please wait before retaking the test.'
                    }
                  </p>
                  {retakeTimer && (
                    <div className="bg-paperwhite/5 rounded-lg p-4 mb-6">
                      <div className="text-trueturquoise font-semibold mb-2">Time until you can retake:</div>
                      <div className="text-2xl font-bold text-paperwhite">{formatRetakeTime(retakeTimer)}</div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setShowRetakePopup(false)}
                      className="bg-trueturquoise text-offblack px-6 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => navigate(`/student/training/${levelId}/learn`)}
                      className="bg-paperwhite text-offblack px-6 py-3 rounded-lg font-bold hover:bg-trueturquoise hover:text-offblack transition-colors"
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