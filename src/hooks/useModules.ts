import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  lessons: any[];
  order: number;
  isActive: boolean;
  estimatedHours: number;
  progress?: number;
  status?: string;
}

export const useModules = (trackId?: string) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, [trackId, fetchModules]);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getModules(trackId);
      if (response.success) {
        // Handle both array and object with data property
        const modulesData = Array.isArray(response.data) ? response.data : response.data.modules || response.data;
        setModules(modulesData || []);
      } else {
        setError(response.message || 'Failed to fetch modules');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  return {
    modules,
    loading,
    error,
    refetch: fetchModules
  };
};