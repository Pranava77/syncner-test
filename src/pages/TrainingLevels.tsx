import React, { useState } from 'react';
import LevelsSidebar from '../components/LevelsSidebar';

const TrainingLevels: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-offblack w-full">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 p-6 lg:p-12 flex items-center justify-center">
        <div className="text-paperwhite text-center text-2xl font-bold">Welcome to your training module</div>
      </main>
    </div>
  );
};

export default TrainingLevels; 