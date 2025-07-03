import { useState, useEffect } from 'react';
import apiService from '../services/api';

export interface Analytics {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  attendanceData: Array<{ day: string; students: number }>;
  submissionsByStatus: Array<{ status: string; count: number }>;
  trackDistribution: Array<{ track: string; count: number }>;
  averageTaskScore: number;
  averageTimePerModule: number;
  studentRetention: number;
  engagementData: Array<{ date: string; activeUsers: number; sessions: number; avgDuration: number }>;
  careerTrackData: Array<{ track: string; students: number; avgProgress: number; completionRate: number }>;
  modulePerformance: Array<{ module: string; completions: number; avgScore: number; avgTime: number }>;
}

export const useAdminAnalytics = (dateRange?: string) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalytics(dateRange);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}; 