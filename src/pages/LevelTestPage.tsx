import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { CheckCircledIcon, ClockIcon, ReaderIcon } from '@radix-ui/react-icons';
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

const TEST_DURATION = 10 * 60; // 10 minutes in seconds

const LevelTestPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [qIdx: number]: boolean[] }>({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      
      // Initialize answers for all questions
      if (levelData && levelData.test) {
        console.log('LevelTestPage: Test data:', levelData.test);
        console.log('LevelTestPage: Test data length:', levelData.test.length);
        
        const initialAnswers = Object.fromEntries(
          levelData.test.map((testItem: any, i: number) => {
            const optionsLength = testItem.options ? testItem.options.length : 0;
            console.log(`LevelTestPage: Question ${i} has ${optionsLength} options:`, testItem);
            console.log(`LevelTestPage: Question ${i} options:`, testItem.options);
            console.log(`LevelTestPage: Question ${i} answer:`, testItem.answer);
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

  useEffect(() => {
    if (levelId) {
      fetchLevel();
    }
  }, [levelId, fetchLevel]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" />
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
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" />
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

  const validQuestions = level.test ? level.test.filter(q => q && q.question && q.options && q.options.length > 0) : [];
  
  if (!level.test || level.test.length === 0 || validQuestions.length === 0) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" />
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
    <div className="flex h-screen bg-offblack overflow-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack">
        <div className="max-w-5xl mx-auto">
          {/* Test Header */}
          <div className="bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-trueturquoise text-offblack p-3 rounded-lg">
                  <ReaderIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {level.order}: {level.title} - Test</h1>
                  <p className="text-teallight text-lg">Test your knowledge with {validQuestions.length} questions</p>
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

          {/* Test Questions */}
          <form onSubmit={handleSubmit} className="space-y-6">
          {validQuestions.map((question, qIdx) => (
            <div key={qIdx} className="bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-paperwhite mb-4">
                Question {qIdx + 1}: {question.question}
              </h3>
              
              <div className="space-y-4">
                {question.options.map((option, optIdx) => (
                  <label 
                    key={optIdx} 
                    className="flex items-center p-4 border border-paperwhite/20 rounded-lg cursor-pointer hover:bg-paperwhite/5 focus-within:ring-2 focus-within:ring-trueturquoise outline-none transition-colors"
                    tabIndex={0}
                    role="checkbox"
                    aria-checked={answers[qIdx]?.[optIdx] || false}
                    aria-label={option}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleCheck(qIdx, optIdx)}
                  >
                    <input
                      type="checkbox"
                      checked={answers[qIdx]?.[optIdx] || false}
                      onChange={() => handleCheck(qIdx, optIdx)}
                      disabled={submitted}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-colors duration-200 ${
                      answers[qIdx]?.[optIdx]
                        ? 'bg-trueturquoise border-trueturquoise'
                        : 'border-paperwhite/20'
                    }`}>
                      {answers[qIdx]?.[optIdx] && (
                        <CheckCircledIcon className="h-4 w-4 text-offblack" aria-hidden="true" />
                      )}
                    </div>
                    <span className="text-paperwhite text-lg">{option}</span>
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-trueturquoise/10 to-teallight/10 border border-trueturquoise/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-paperwhite">Correct Answer:</span>
                    <span className="text-sm text-trueturquoise font-bold">{question.answer}</span>
                  </div>
                  <div className="text-teallight">
                    Your answer: {answers[qIdx]?.findIndex(a => a) !== -1 ? 
                      question.options[answers[qIdx]?.findIndex(a => a) || 0] : 'Not answered'}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          {!submitted && (
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-trueturquoise/90 transition-colors"
              >
                Submit Test
              </button>
            </div>
          )}

          {/* Results */}
          {submitted && (
            <div className="w-full max-w-5xl bg-gradient-to-r from-trueturquoise/10 to-teallight/10 rounded-xl border border-trueturquoise/30 shadow-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-paperwhite mb-4">Test Completed!</h2>
              <p className="text-teallight mb-6 text-lg">You've completed the test for this level.</p>
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
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default LevelTestPage; 