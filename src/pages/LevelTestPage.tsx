import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';

const questions = [
  {
    question: 'What does MERN stand for?',
    options: ['MongoDB, Express, React, Node', 'MySQL, Express, React, Node', 'MongoDB, Ember, React, Node', 'MongoDB, Express, Redux, Node'],
  },
  {
    question: 'Which hook is used for state in React?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
  },
  {
    question: 'Which HTTP method is used to update data?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    question: 'What is the default port for Node.js?',
    options: ['3000', '8080', '5000', '80'],
  },
  {
    question: 'Which of these is a NoSQL database?',
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
  },
  {
    question: 'Which CSS framework is utility-first?',
    options: ['Bootstrap', 'Tailwind CSS', 'Material UI', 'Bulma'],
  },
  {
    question: 'What is used to manage routes in React?',
    options: ['React Router', 'Redux', 'Axios', 'Jest'],
  },
  {
    question: 'Which is a state management library?',
    options: ['Redux', 'React Router', 'Axios', 'Framer Motion'],
  },
  {
    question: 'Which is used for backend in MERN?',
    options: ['Express', 'React', 'Redux', 'Tailwind'],
  },
  {
    question: 'Which is a JavaScript testing framework?',
    options: ['Jest', 'Mocha', 'Chai', 'All of the above'],
  },
];

const TEST_DURATION = 10 * 60; // 10 minutes in seconds

const LevelTestPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const levelNum = Number(levelId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [answers, setAnswers] = useState<{ [qIdx: number]: boolean[] }>(
    () => Object.fromEntries(questions.map((_, i) => [i, [false, false, false, false]]))
  );
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft === 0) {
      setSubmitted(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => timerRef.current && clearTimeout(timerRef.current);
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

  return (
    <div className="flex h-full min-h-screen w-full bg-offblack">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelNum} currentSection="test" />
      <main className="flex-1 p-6 lg:p-12 bg-offblack">
        <div className="mb-8 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {levelId} - Test</h1>
              <p className="text-teallight">Answer the following questions:</p>
            </div>
            <div className="flex items-center gap-4 absolute right-0 top-0">
              <div className="bg-paperwhite/10 text-trueturquoise font-bold px-4 py-2 rounded-lg text-lg tracking-widest">
                {formatTime(timeLeft)}
              </div>
              <button
                className="bg-trueturquoise text-offblack px-6 py-2 rounded-lg font-bold shadow hover:bg-teallight transition-colors"
                onClick={handleSubmit}
                disabled={submitted}
              >
                Submit
              </button>
            </div>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-paperwhite/10 rounded-xl p-6 shadow space-y-4">
                <div className="font-semibold text-paperwhite mb-2">{qIdx + 1}. {q.question}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-3 cursor-pointer text-paperwhite/90">
                      <input
                        type="checkbox"
                        checked={answers[qIdx][optIdx]}
                        onChange={() => handleCheck(qIdx, optIdx)}
                        className="form-checkbox h-5 w-5 text-trueturquoise bg-offblack border-paperwhite/20 rounded focus:ring-trueturquoise"
                        disabled={submitted}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {submitted && (
              <div className="text-trueturquoise font-bold text-center text-lg mt-8">Test submitted! Thank you.</div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default LevelTestPage; 