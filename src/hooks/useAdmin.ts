import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  department?: string;
  college?: string;
  careerTrack?: string;
  progress?: number;
  tasksCompleted?: number;
  lastActive?: string;
  status?: string;
  joinDate?: string;
  gpa?: string;
  profileComplete?: boolean;
}

interface Analytics {
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

export const useStudents = (filters?: Record<string, any>) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents(filters);
      if (response.success) {
        setStudents(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [filters, fetchStudents]);

  const updateStudent = async (studentId: string, studentData: Partial<Student>) => {
    try {
      const response = await apiService.updateStudent(studentId, studentData);
      if (response.success) {
        await fetchStudents(); // Refresh the list
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const response = await apiService.deleteStudent(studentId);
      if (response.success) {
        await fetchStudents(); // Refresh the list
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addStudent = async (studentData: Partial<Student>) => {
    try {
      const response = await apiService.addStudent(studentData);
      if (response.success) {
        await fetchStudents(); // Refresh the list
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    updateStudent,
    deleteStudent,
    addStudent
  };
};

export const useAnalytics = (dateRange?: string) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}; 