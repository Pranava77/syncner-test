import React, { useState } from 'react';
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

const LevelTestPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const levelNum = Number(levelId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [answers, setAnswers] = useState<{ [qIdx: number]: boolean[] }>(
    () => Object.fromEntries(questions.map((_, i) => [i, [false, false, false, false]]))
  );

  const handleCheck = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qIdx]: prev[qIdx].map((checked, i) => (i === optIdx ? !checked : checked)),
    }));
  };

  return (
    <div className="flex h-full min-h-screen bg-offblack w-full">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelNum} currentSection="test" />
      <main className="flex-1 p-6 lg:p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {levelId} - Test</h1>
          <p className="text-teallight mb-6">Answer the following questions:</p>
          <form className="space-y-8">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-paperwhite/5 rounded-xl p-6 shadow space-y-4">
                <div className="font-semibold text-paperwhite mb-2">{qIdx + 1}. {q.question}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-3 cursor-pointer text-paperwhite/90">
                      <input
                        type="checkbox"
                        checked={answers[qIdx][optIdx]}
                        onChange={() => handleCheck(qIdx, optIdx)}
                        className="form-checkbox h-5 w-5 text-trueturquoise bg-offblack border-paperwhite/20 rounded focus:ring-trueturquoise"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </form>
        </div>
      </main>
    </div>
  );
};

export default LevelTestPage; 