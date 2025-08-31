import React, { useState } from 'react';
import { useTimeTracking } from '../hooks/useTimeTracking';

const TimeTrackingDemo: React.FC = () => {
  const [currentLevelId, setCurrentLevelId] = useState('demo-level-1');
  const [currentSection, setCurrentSection] = useState<'learn' | 'test' | 'exercise'>('learn');
  const [timerUpdate, setTimerUpdate] = useState(0);
  
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    pauseTracking,
    getCurrentSessionDuration 
  } = useTimeTracking();

  // Real-time timer update
  React.useEffect(() => {
    if (!isTracking) return;
    
    const interval = setInterval(() => {
      setTimerUpdate(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStartTracking = async () => {
    const result = await startTracking(currentLevelId, currentSection);
    if (result.success) {
      console.log('Time tracking started successfully');
    } else {
      console.error('Failed to start tracking:', result.error);
    }
  };

  const handleStopTracking = async () => {
    const result = await stopTracking();
    if (result.success) {
      console.log('Time tracking stopped. Time spent:', result.timeSpent, 'seconds');
    } else {
      console.error('Failed to stop tracking:', result.error);
    }
  };

  const handlePauseTracking = async () => {
    const result = await pauseTracking();
    if (result.success) {
      console.log('Time tracking paused');
    } else {
      console.error('Failed to pause tracking:', result.error);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
          Time Tracking Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            <div className="rounded-xl border shadow-lg p-6" style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Control Panel
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Level ID
                  </label>
                  <input
                    type="text"
                    value={currentLevelId}
                    onChange={(e) => setCurrentLevelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Section
                  </label>
                  <select
                    value={currentSection}
                    onChange={(e) => setCurrentSection(e.target.value as 'learn' | 'test' | 'exercise')}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="learn">Learn</option>
                    <option value="test">Test</option>
                    <option value="exercise">Exercise</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleStartTracking}
                    disabled={isTracking}
                    className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: isTracking ? 'var(--color-accent-tertiary)' : 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    Start Tracking
                  </button>
                  
                  <button
                    onClick={handleStopTracking}
                    disabled={!isTracking}
                    className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: !isTracking ? 'var(--color-accent-tertiary)' : 'var(--color-accent-secondary)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    Stop Tracking
                  </button>
                  
                  <button
                    onClick={handlePauseTracking}
                    disabled={!isTracking}
                    className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: !isTracking ? 'var(--color-accent-tertiary)' : 'var(--color-accent-tertiary)',
                      color: 'var(--color-text-inverse)',
                      border: '1px solid var(--color-accent-primary)'
                    }}
                  >
                    Pause
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Display */}
          <div className="space-y-6">
            <div className="rounded-xl border shadow-lg p-6" style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Tracking Status:</span>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Current Level:</span>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {currentLevelId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Current Section:</span>
                  <span className="font-medium capitalize" style={{ color: 'var(--color-text-primary)' }}>
                    {currentSection}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Live Timer */}
            {isTracking && (
              <div className="rounded-xl border shadow-lg p-6" style={{
                backgroundColor: 'var(--color-accent-tertiary)',
                borderColor: 'var(--color-accent-primary)'
              }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-accent-primary)' }}>
                  Live Session Timer
                </h2>
                
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                    {Math.floor(getCurrentSessionDuration() / 60)}:{(getCurrentSessionDuration() % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {Math.floor(getCurrentSessionDuration() / 60)} minutes, {getCurrentSessionDuration() % 60} seconds
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 rounded-xl border shadow-lg p-6" style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            How to Use
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>1. Set a Level ID and select a Section (Learn, Test, or Exercise)</p>
            <p>2. Click "Start Tracking" to begin recording time</p>
            <p>3. The live timer will show your current session duration</p>
            <p>4. Click "Stop Tracking" to end the session and save the time</p>
            <p>5. Click "Pause" to temporarily pause tracking</p>
            <p>6. Check the browser console for API response details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingDemo;
