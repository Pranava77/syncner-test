import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

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
}

export const useLevels = (trackId?: string) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getLevels(trackId);
      if (response.success) {
        // Handle both array and object with data property
        const levelsData = Array.isArray(response.data) ? response.data : response.data.levels || response.data;
        setLevels(levelsData || []);
      } else {
        setError(response.message || 'Failed to fetch levels');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    fetchLevels();
  }, [trackId, fetchLevels]);

  return {
    levels,
    loading,
    error,
    refetch: fetchLevels
  };
}; 