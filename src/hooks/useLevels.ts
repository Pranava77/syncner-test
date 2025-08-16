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
    exercise?: boolean;
    test?: boolean;
  };
}

export const useLevels = (trackId?: string) => {
  const dispatch = useAppDispatch();
  const { levelsWithStatus, loading, error, lastFetched, cacheExpiry } = useAppSelector((state) => state.curriculum);
  
  // Normalize track ids to avoid legacy/value mismatches
  const normalizeTrack = useCallback((track?: string) => {
    if (!track) return '';
    const map: Record<string, string> = {
      'fullstack': 'full-stack',
      'full-stack': 'full-stack',
      'aiml': 'ai-ml',
      'ai-ml': 'ai-ml',
      'uiux': 'ui-ux',
      'ui-ux': 'ui-ux',
      'datascience': 'data-science',
      'data-science': 'data-science'
    };
    return map[track] || track;
  }, []);
  
  // Check if cache is still valid - optimized cache validation
  const isCacheValid = useMemo(() => {
    if (!lastFetched || !trackId) return false;
    // If cacheExpiry is 0, it means cache was forcefully cleared
    if (cacheExpiry === 0) return false;
    // Check if we have data and cache is still fresh
    return levelsWithStatus.length > 0 && Date.now() - lastFetched < cacheExpiry;
  }, [lastFetched, cacheExpiry, levelsWithStatus.length, trackId]);

  // Optimized loading state - only show loading when actually fetching, not when using cache
  const isActuallyLoading = useMemo(() => {
    // If we have valid cached data, don't show loading
    if (isCacheValid && levelsWithStatus.length > 0) {
      return false;
    }
    // Only show loading when we're actually fetching and have no data
    return loading && levelsWithStatus.length === 0;
  }, [loading, isCacheValid, levelsWithStatus.length]);

  const fetchLevels = useCallback(async () => {
    if (!trackId) return;
    
    // Only fetch if cache is invalid or no data exists
    if (!isCacheValid) {
      try {
        console.log('useLevels: Fetching levels due to cache invalidation or empty data');
        await dispatch(fetchLevelsWithStatus({ trackId })).unwrap();
      } catch (err) {
        console.error('Failed to fetch levels:', err);
      }
    }
  }, [trackId, dispatch, isCacheValid]);

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
    // Only fetch on mount if we don't have valid cached data
    if (!isCacheValid) {
      fetchLevels();
    }
    
    // Remove the 30-second interval - it's unnecessary and causes performance issues
    // Data will be refreshed when needed through events or manual refresh
  }, [fetchLevels, isCacheValid]);

  // Filter levels for the specific track - simplified memoization
  const filteredLevels = useMemo(() => {
    if (!trackId || levelsWithStatus.length === 0) return [];
    const normalizedTrackId = normalizeTrack(trackId);
    return levelsWithStatus
      .filter((level: Level) => normalizeTrack(level.careerTrack) === normalizedTrackId && level.isActive)
      .sort((a: Level, b: Level) => a.order - b.order);
  }, [levelsWithStatus, trackId, normalizeTrack]);

  return {
    levels: filteredLevels,
    loading: isActuallyLoading, // Return optimized loading state
    error,
    refetch,
    forceRefresh,
    updateLevelSectionStatus,
    isCacheValid
  };
}; 