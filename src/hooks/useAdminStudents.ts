import { useState, useEffect } from 'react';
import apiService from '../services/api';

export interface Student {
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

export const useAdminStudents = (filters?: any) => {
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