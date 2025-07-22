import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface LevelStatusProps {
  onLevelsLoaded: (levels: any[]) => void;
}

const LevelStatus: React.FC<LevelStatusProps> = ({ onLevelsLoaded }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [levelCount, setLevelCount] = useState(0);

  const checkLevels = async () => {
    setStatus('loading');
    setMessage('Checking levels...');
    
    try {
      const response = await apiService.getLevels();
      console.log('Levels API Response:', response);
      
      let levels = [];
      if (response && response.data) {
        levels = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        levels = response;
      }
      
      setLevelCount(levels.length);
      setStatus('success');
      setMessage(`Found ${levels.length} levels`);
      onLevelsLoaded(levels);
      
    } catch (error) {
      console.error('Error checking levels:', error);
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkLevels();
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-offblack border border-paperwhite/20 rounded-lg p-3 z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'loading' ? 'bg-yellow-400 animate-pulse' :
          status === 'success' ? 'bg-green-400' : 
          status === 'error' ? 'bg-red-400' : 'bg-gray-400'
        }`} />
        <span className="text-xs text-paperwhite">
          Levels: {status === 'loading' ? 'Loading...' : 
                  status === 'success' ? `${levelCount} found` : 
                  status === 'error' ? 'Error' : 'Idle'}
        </span>
      </div>
      
      <p className="text-xs text-teallight mb-2">{message}</p>
      
      <button
        onClick={checkLevels}
        disabled={status === 'loading'}
        className="text-xs bg-trueturquoise text-offblack px-2 py-1 rounded hover:bg-trueturquoise/90 transition-colors disabled:opacity-50"
      >
        Refresh
      </button>
    </div>
  );
};

export default LevelStatus; 