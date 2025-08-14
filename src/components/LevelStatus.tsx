import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface LevelStatusProps {
  onLevelsLoaded: (levels: any[]) => void;
}

const LevelStatus: React.FC<LevelStatusProps> = ({ onLevelsLoaded }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [levelCount, setLevelCount] = useState(0);

  const checkLevels = useCallback(async () => {
    setStatus('loading');
    setMessage('Checking levels...');
    
    try {
      const response = await apiService.get('/training/levels');
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
  }, [onLevelsLoaded]);

  useEffect(() => {
    checkLevels();
  }, [checkLevels]);

  return (
    <div className="fixed bottom-4 left-4 rounded-lg p-3 z-50 border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-md)'
      }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'loading' ? 'bg-[var(--color-warning)] animate-pulse' :
          status === 'success' ? 'bg-[var(--color-success)]' : 
          status === 'error' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-text-muted)]'
        }`} />
                        <span 
                  className="text-xs"
                  style={{ color: 'var(--color-text-primary)' }}
                >
          Levels: {status === 'loading' ? 'Loading...' : 
                  status === 'success' ? `${levelCount} found` : 
                  status === 'error' ? 'Error' : 'Idle'}
        </span>
      </div>
      
      <p className="text-xs text-teallight mb-2">{message}</p>
      
      <button
        onClick={checkLevels}
        disabled={status === 'loading'}
                    className="text-xs bg-trueturquoise px-2 py-1 rounded hover:bg-trueturquoise/90 transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-text-inverse)' }}
      >
        Refresh
      </button>
    </div>
  );
};

export default LevelStatus; 