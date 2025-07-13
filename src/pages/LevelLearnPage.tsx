import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';

const LevelLearnPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const levelNum = Number(levelId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-screen bg-offblack overflow-x-hidden">
      <div className="flex-shrink-0 min-h-screen">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelNum} currentSection="learn" />
      </div>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {levelId} - Learn</h1>
          <p className="text-teallight mb-2">This is the Learn section for Level {levelId}. Add your static or demo content here.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-paperwhite/10 rounded-lg p-4 text-paperwhite">Sample learning content for Level {levelId}.</div>
        </div>
      </main>
    </div>
  );
};

export default LevelLearnPage; 