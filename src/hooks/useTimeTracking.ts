import { useState, useCallback } from 'react';
import api from '../services/api';

interface TimeTrackingState {
  isTracking: boolean;
  startTime: Date | null;
  currentSection: 'learn' | 'test' | 'exercise' | null;
  currentLevelId: string | null;
}

export const useTimeTracking = () => {
  const [trackingState, setTrackingState] = useState<TimeTrackingState>({
    isTracking: false,
    startTime: null,
    currentSection: null,
    currentLevelId: null,
  });

  const startTracking = useCallback(async (
    levelId: string, 
    section: 'learn' | 'test' | 'exercise'
  ) => {
    try {
      const response = await api.startTimeTracking(levelId, section);
      
      if (response.success) {
        setTrackingState({
          isTracking: true,
          startTime: new Date(),
          currentSection: section,
          currentLevelId: levelId,
        });
        
        return { success: true, startTime: new Date() };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to start time tracking' };
    }
  }, []);

  const stopTracking = useCallback(async () => {
    if (!trackingState.isTracking || !trackingState.currentLevelId || !trackingState.currentSection) {
      return { success: false, error: 'No active tracking session' };
    }

    try {
      const response = await api.stopTimeTracking(
        trackingState.currentLevelId, 
        trackingState.currentSection
      );
      
      if (response.success) {
        const endTime = new Date();
        const timeSpent = trackingState.startTime 
          ? Math.floor((endTime.getTime() - trackingState.startTime.getTime()) / 1000)
          : 0;

        setTrackingState({
          isTracking: false,
          startTime: null,
          currentSection: null,
          currentLevelId: null,
        });
        
        return { 
          success: true, 
          endTime, 
          timeSpent,
          section: trackingState.currentSection 
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to stop time tracking' };
    }
  }, [trackingState]);

  const pauseTracking = useCallback(async () => {
    if (!trackingState.isTracking || !trackingState.currentLevelId || !trackingState.currentSection) {
      return { success: false, error: 'No active tracking session' };
    }

    try {
      const response = await api.pauseTimeTracking(
        trackingState.currentLevelId, 
        trackingState.currentSection
      );
      
      if (response.success) {
        setTrackingState(prev => ({
          ...prev,
          isTracking: false,
        }));
        
        return { success: true, message: 'Time tracking paused' };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to pause time tracking' };
    }
  }, [trackingState]);

  const getCurrentSessionDuration = useCallback(() => {
    if (!trackingState.isTracking || !trackingState.startTime) {
      return 0;
    }
    
    return Math.floor((Date.now() - trackingState.startTime.getTime()) / 1000);
  }, [trackingState]);

  return {
    ...trackingState,
    startTracking,
    stopTracking,
    pauseTracking,
    getCurrentSessionDuration,
  };
};
