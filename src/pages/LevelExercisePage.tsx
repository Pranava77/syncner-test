import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';

const LevelExercisePage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const levelNum = Number(levelId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-full min-h-screen bg-offblack w-full">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelNum} currentSection="exercise" />
      <main className="flex-1 p-6 lg:p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {levelId} - Exercise</h1>
          <p className="text-teallight mb-2">This is the Exercise section for Level {levelId}. Add your static or demo content here.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-paperwhite/10 rounded-lg p-4 text-paperwhite">Sample exercise content for Level {levelId}.</div>
        </div>
      </main>
    </div>
  );
};

export default LevelExercisePage; 