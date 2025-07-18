import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { PersonIcon } from '@radix-ui/react-icons';

const mustWatchLinks = [
  { label: 'YT Link', url: '#' },
  { label: 'Can be any link', url: '#' },
];
const optionalLinks = [
  { label: 'YT Link', url: '#' },
  { label: 'Can be any link', url: '#' },
];

const topicPoints = [
  'Variables & Data Types',
  'Simple: Think of variables as labeled boxes where you store different kinds of stuff (text, numbers, true/false, etc).',
  'Technical: JS has var, let, and const. Data types: string, number, boolean, object, array, null, undefined.',
  'Startup Example: As startup like Dukaan lets merchants create stores. You’d store: js CopyEdit const storeName = "Mani’s Mart"; let productCount = 18; let isActive = true;',
  'This is literally how you define and control business state in the frontend.',
  'Functions',
  'Simple: Reusable machines that take input, do something, and give you a result.',
  'Technical: JS functions can be declared (function greet() {}) or as expressions (const greet = () => {}).',
  'Startup Example: In a scheduling startup like Calendly, a function could calculate availability: js ame), your score is ${creditScore}`);',
];

const LevelLearnPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const levelNum = Number(levelId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelNum} currentSection="learn" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
        {/* Read this first! */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <h1 className="text-xl font-bold text-paperwhite mr-3">Read this first!</h1>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-trueturquoise text-offblack font-bold text-lg shadow-md">
              <PersonIcon className="w-5 h-5" />
            </span>
          </div>
          <ul className="list-disc pl-6 text-paperwhite space-y-1 text-sm">
            {topicPoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Learning Materials */}
        <div className="w-full max-w-5xl bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-paperwhite mb-4">Learning Materials</h2>
          {/* Must watch */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-lg font-semibold text-paperwhite mr-2">Must watch</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-trueturquoise text-offblack font-bold text-md shadow-md">
                <PersonIcon className="w-4 h-4" />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {mustWatchLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-paperwhite/30 text-offblack font-semibold rounded-lg px-4 py-3 text-center hover:bg-trueturquoise/80 transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <hr className="my-6 border-paperwhite/20" />
          {/* Optional */}
          <div>
            <div className="flex items-center mb-2">
              <span className="text-lg font-semibold text-paperwhite mr-2">Optional</span>
            </div>
            <div className="flex flex-col gap-2">
              {optionalLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-paperwhite/30 text-offblack font-semibold rounded-lg px-4 py-3 text-center hover:bg-trueturquoise/80 transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 mb-8">
          <button className="w-full sm:w-auto bg-paperwhite text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-trueturquoise hover:text-offblack transition-colors mb-2 sm:mb-0">
            Mark as Completed ▼
          </button>
          <button className="w-full sm:w-auto bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors">
            Take Test ►
          </button>
        </div>
      </main>
    </div>
  );
};

export default LevelLearnPage; 