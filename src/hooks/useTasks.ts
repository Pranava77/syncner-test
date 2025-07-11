import { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  estimatedTime: string;
  careerTrack: string;
  requirements: string[];
  deliverables: string[];
  skills: string[];
  resources: string[];
  prerequisites: string[];
  isActive: boolean;
  order: number;
  dueDate?: string;
  status?: string;
}

export const useTasks = (trackId?: string, filters?: Record<string, any>) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [trackId, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTasks(trackId, filters);
      if (response.success) {
        // Handle both array and object with data property
        const tasksData = Array.isArray(response.data) ? response.data : response.data.tasks || response.data;
        setTasks(tasksData || []);
      } else {
        setError(response.message || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (taskId: string, submissionData: any) => {
    try {
      const response = await apiService.submitTask(taskId, submissionData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit task');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to submit task');
    }
  };

  return {
    tasks,
    loading,
    error,
    submitTask,
    refetch: fetchTasks
  };
};

export const useUpcomingTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingTasks();
  }, []);

  const fetchUpcomingTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUpcomingTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Failed to fetch upcoming tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch upcoming tasks');
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, refetch: fetchUpcomingTasks };
};

export const useAllStudentTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStudentTasks();
  }, []);

  const fetchAllStudentTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllStudentTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Failed to fetch all tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch all tasks');
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, refetch: fetchAllStudentTasks };
};

export const useStudentSubmissions = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubmissions();
      if (response.success) {
        // Accept both { submissions: [] } and []
        const data = response.data?.submissions || response.data || [];
        setSubmissions(Array.isArray(data) ? data : []);
      } else {
        setError(response.message || 'Failed to fetch submissions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  return { submissions, loading, error, refetch: fetchSubmissions };
};