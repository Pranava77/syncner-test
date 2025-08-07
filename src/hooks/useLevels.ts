import {  useEffect, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchLevelsWithStatus, updateLevelStatus } from '../redux/slices/curriculumSlice';

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
    return Date.now() - lastFetched < cacheExpiry;
  }, [lastFetched, cacheExpiry]);

  const fetchLevels = useCallback(async () => {
    if (!trackId) return;
    
    // Only fetch if cache is invalid or no data exists
    if (!isCacheValid || levelsWithStatus.length === 0) {
      try {
        await dispatch(fetchLevelsWithStatus({ trackId })).unwrap();
      } catch (err) {
        console.error('Failed to fetch levels:', err);
      }
    }
  }, [trackId, dispatch, isCacheValid, levelsWithStatus.length]);

  const refetch = useCallback(async () => {
    if (!trackId) return;
    try {
      await dispatch(fetchLevelsWithStatus({ trackId })).unwrap();
    } catch (err) {
      console.error('Failed to refetch levels:', err);
    }
  }, [trackId, dispatch]);

  const updateLevelSectionStatus = useCallback((levelId: string, section: string, completed: boolean) => {
    dispatch(updateLevelStatus({ levelId, section, completed }));
  }, [dispatch]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

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
    updateLevelSectionStatus,
    isCacheValid
  };
}; 