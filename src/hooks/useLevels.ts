import {  useEffect, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchLevelsWithStatus, updateLevelStatus, clearCache } from '../redux/slices/curriculumSlice';

interface LearnItem {
  type: 'video' | 'reading' | 'slide' | 'other';
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

interface TestItem {
  question: string;
  options: string[];
  answer: string;
  order: number;
}

interface ExerciseItem {
  title: string;
  description: string;
  resources: string[];
  order: number;
}

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: LearnItem[];
  test: TestItem[];
  exercise: ExerciseItem[];
  order: number;
  isActive: boolean;
  estimatedHours: number;
  progress?: number;
  status?: string;
  isUnlocked?: boolean;
  isCompleted?: boolean;
  completedSections?: {
    learn?: boolean;
    test?: boolean;
    exercise?: boolean;
  };
}

export const useLevels = (trackId?: string) => {
  const dispatch = useAppDispatch();
  const { levelsWithStatus, loading, error, lastFetched, cacheExpiry } = useAppSelector((state) => state.curriculum);
  
  // Check if cache is still valid
  const isCacheValid = useMemo(() => {
    if (!lastFetched) return false;
    // If cacheExpiry is 0, it means cache was forcefully cleared
    if (cacheExpiry === 0) return false;
    return Date.now() - lastFetched < cacheExpiry;
  }, [lastFetched, cacheExpiry]);

  const fetchLevels = useCallback(async () => {
    if (!trackId) return;
    
    // Always fetch if cache is invalid, no data exists, or cache was forcefully cleared
    if (!isCacheValid || levelsWithStatus.length === 0 || cacheExpiry === 0) {
      try {
        console.log('useLevels: Fetching levels due to cache invalidation or empty data');
        await dispatch(fetchLevelsWithStatus({ trackId })).unwrap();
      } catch (err) {
        console.error('Failed to fetch levels:', err);
      }
    }
  }, [trackId, dispatch, isCacheValid, levelsWithStatus.length, cacheExpiry]);

  const refetch = useCallback(async () => {
    if (!trackId) return;
    try {
      console.log('useLevels: Force refetching levels');
      await dispatch(fetchLevelsWithStatus({ trackId })).unwrap();
    } catch (err) {
      console.error('Failed to refetch levels:', err);
    }
  }, [trackId, dispatch]);

  const forceRefresh = useCallback(async () => {
    if (!trackId) return;
    try {
      console.log('useLevels: Force refreshing levels (bypassing cache)');
      // Clear cache first, then fetch
      dispatch(clearCache());
      await dispatch(fetchLevelsWithStatus({ trackId })).unwrap();
    } catch (err) {
      console.error('Failed to force refresh levels:', err);
    }
  }, [trackId, dispatch]);

  const updateLevelSectionStatus = useCallback((levelId: string, section: string, completed: boolean) => {
    dispatch(updateLevelStatus({ levelId, section, completed }));
  }, [dispatch]);

  useEffect(() => {
    fetchLevels();
    
    // Set up periodic refresh every 30 seconds to ensure data is always current
    const intervalId = setInterval(() => {
      if (trackId && !loading) {
        console.log('useLevels: Periodic refresh check');
        // Only refresh if cache is old or if we have no data
        if (!isCacheValid || levelsWithStatus.length === 0) {
          console.log('useLevels: Periodic refresh triggered');
          refetch();
        }
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchLevels, trackId, loading, isCacheValid, levelsWithStatus.length, refetch]);

  // Filter levels for the specific track
  const filteredLevels = useMemo(() => {
    if (!trackId) return [];
    return levelsWithStatus
      .filter((level: Level) => level.careerTrack === trackId && level.isActive)
      .sort((a: Level, b: Level) => a.order - b.order);
  }, [levelsWithStatus, trackId]);

  return {
    levels: filteredLevels,
    loading,
    error,
    refetch,
    forceRefresh,
    updateLevelSectionStatus,
    isCacheValid
  };
}; 