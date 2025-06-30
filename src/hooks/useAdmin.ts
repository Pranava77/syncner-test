import { useState, useEffect } from 'react';
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

interface Submission {
  _id: string;
  taskId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  notes?: string;
  files?: string[];
  score?: number;
  feedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
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

export const useStudents = (filters?: any) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
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
  };

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

export const useSubmissions = (taskId?: string) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [taskId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubmissions(taskId);
      if (response.success) {
        setSubmissions(response.data.submissions);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (submissionId: string, reviewData: { score: number; feedback: string; status: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.reviewSubmission(submissionId, reviewData);
      if (response.success) {
        setSubmissions(prev => prev.map(sub =>
          sub._id === submissionId
            ? { ...sub, ...reviewData, status: reviewData.status as Submission['status'] }
            : sub
        ));
      } else {
        setError(response.message || 'Failed to review submission');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to review submission');
    } finally {
      setLoading(false);
    }
  };

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions,
    reviewSubmission
  };
};

export const useAnalytics = (dateRange?: string) => {
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