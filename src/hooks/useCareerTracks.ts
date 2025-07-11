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
  modules: Module[];
  tasks: Task[];
  enrollmentCount?: number;
  completionRate?: number;
}

export const useCareerTrack = (trackId: string) => {
  const [track, setTrack] = useState<CareerTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackId) {
      fetchTrack();
    }
  }, [trackId, fetchTrack]);

  const fetchTrack = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCareerTrack(trackId);
      if (response.success) {
        setTrack(response.data.track);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    track,
    loading,
    error,
    refetch: fetchTrack
  };
};