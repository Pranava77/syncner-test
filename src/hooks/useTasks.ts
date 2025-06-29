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

export const useTasks = (trackId?: string, filters?: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [trackId, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasks(trackId, filters);
      if (response.success) {
        setTasks(response.data.tasks);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (taskId: string, submissionData: any) => {
    try {
      const response = await apiService.submitTask(taskId, submissionData);
      if (response.success) {
        await fetchTasks(); // Refresh tasks to update status
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      throw new Error(err.message);
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

export const useTask = (taskId: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTask(taskId);
      if (response.success) {
        setTask(response.data.task);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    task,
    loading,
    error,
    refetch: fetchTask
  };
};