import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface CareerTrack {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  averageSalary: string;
  careerPaths: string[];
  skills: string[];
  prerequisites: string[];
  enrollmentCount?: number;
  completionRate?: number;
}

export const useCareerTrack = (trackId: string) => {
  const [track, setTrack] = useState<CareerTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCareerTrack(trackId);
      if (response.success) {
        setTrack(response.data.track);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    if (trackId) {
      fetchTrack();
    }
  }, [trackId, fetchTrack]);

  return {
    track,
    loading,
    error,
    refetch: fetchTrack
  };
};