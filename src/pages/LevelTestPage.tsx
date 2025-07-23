import React, { useState, useEffect, useRef, useCallback } from 'react';
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
      const response = await apiService.get(`/training/levels/${levelId}`);
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
        const initialAnswers = Object.fromEntries(
          levelData.test.map((testItem: any, i: number) => {
            const optionsLength = testItem.options ? testItem.options.length : 0;
            console.log(`LevelTestPage: Question ${i} has ${optionsLength} options:`, testItem);
            return [i, new Array(optionsLength).fill(false)];
          })
        );
        setAnswers(initialAnswers);
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

  if (level.test.length === 0) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div className="text-paperwhite/30 text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-paperwhite mb-2">No Test Available</h2>
            <p className="text-teallight mb-6">This level doesn't have any test questions yet.</p>
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
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="test" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
        {/* Test Header */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {level.order}: {level.title} - Test</h1>
              <p className="text-teallight">Test your knowledge with {level.test.length} questions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-trueturquoise">{formatTime(timeLeft)}</div>
                <div className="text-xs text-teallight">Time Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-paperwhite">{level.test.length}</div>
                <div className="text-xs text-teallight">Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Questions */}
        <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-6">
          {level.test.map((question, qIdx) => (
            <div key={qIdx} className="bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-paperwhite mb-4">
                Question {qIdx + 1}: {question.question}
              </h3>
              
              <div className="space-y-3">
                {question.options.map((option, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answers[qIdx]?.[optIdx] || false}
                      onChange={() => handleCheck(qIdx, optIdx)}
                      disabled={submitted}
                      className="w-4 h-4 text-trueturquoise bg-paperwhite/10 border-paperwhite/20 rounded focus:ring-trueturquoise focus:ring-2"
                    />
                    <span className="text-paperwhite">{option}</span>
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="mt-4 p-4 rounded-lg bg-paperwhite/10 border border-paperwhite/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-paperwhite">Correct Answer:</span>
                    <span className="text-sm text-trueturquoise">{question.answer}</span>
                  </div>
                  <div className="text-xs text-teallight">
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
                className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors"
              >
                Submit Test
              </button>
            </div>
          )}

          {/* Results */}
          {submitted && (
            <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-paperwhite mb-4">Test Completed!</h2>
              <p className="text-teallight mb-6">You've completed the test for this level.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate(`/student/training/${levelId}/learn`)}
                  className="bg-paperwhite text-offblack px-6 py-3 rounded-lg font-bold hover:bg-trueturquoise hover:text-offblack transition-colors"
                >
                  Back to Learning
                </button>
                <button 
                  onClick={() => navigate(`/student/training/${levelId}/exercise`)}
                  className="bg-trueturquoise text-offblack px-6 py-3 rounded-lg font-bold hover:bg-teallight transition-colors"
                >
                  Go to Exercise
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default LevelTestPage; 