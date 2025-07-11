import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAppSelector } from '../redux/store';

interface Progress {
  user: string;
  careerTrack: string;
  overallProgress: number;
  totalPoints: number;
  streakDays: number;
  lastActiveDate: string;
  moduleProgress: Array<{ moduleId: string; progress: number; status: string }>;
  taskProgress: Array<{ taskId: string; progress: number; status: string }>;
  achievements: Array<{ achievementId: string; dateAchieved: string }>;
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
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role !== 'student') {
      setLoading(false);
      setProgress(null);
      return;
    }
    fetchProgress();
  }, [user]);

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