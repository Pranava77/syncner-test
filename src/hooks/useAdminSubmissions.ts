import { useState, useEffect } from 'react';
import apiService from '../services/api';

export interface Submission {
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
  files?: any[];
  score?: number;
  feedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  taskTitle?: string;
  task?: { title: string };
}

export const useAdminSubmissions = (taskId?: string) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [taskId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubmissions(taskId, 'admin');
      if (response.success) {
        const mapped = (response.submissions || []).map((sub: any) => ({
          ...sub,
          _id: sub._id || sub.id,
          id: sub.id || sub._id
        }));
        setSubmissions(mapped);
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