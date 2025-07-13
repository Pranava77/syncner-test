import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: any[];
  test: any[];
  exercise: any[];
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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch levels');
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