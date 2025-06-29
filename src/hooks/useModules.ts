import { useState, useEffect } from 'react';
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
  }, [trackId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await apiService.getModules(trackId);
      if (response.success) {
        setModules(response.data.modules);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    modules,
    loading,
    error,
    refetch: fetchModules
  };
};