import React from 'react';
import { useParams } from 'react-router-dom';

const LevelTestPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {levelId} - Test</h1>
        <p className="text-teallight mb-2">This is the Test section for Level {levelId}. Add your static or demo content here.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-paperwhite/10 rounded-lg p-4 text-paperwhite">Sample test content for Level {levelId}.</div>
      </div>
    </div>
  );
};

export default LevelTestPage; 