import { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Progress {
  user: string;
  careerTrack: string;
  overallProgress: number;
  totalPoints: number;
  streakDays: number;
  lastActiveDate: string;
  moduleProgress: any[];
  taskProgress: any[];
  achievements: any[];
  weeklyGoal: {
    target: number;
    current: number;
    weekStart: string;
  };
  completedModulesCount: number;
  completedTasksCount: number;
}

export const useProgress = () => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProgress();
      if (response.success) {
        setProgress(response.data.progress);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress
  };
};