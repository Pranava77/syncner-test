import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchStudents, 
  fetchStudentDetails,
  fetchStaffAnalytics,
  setFilters,
  setPagination,
  clearError,
  clearSelectedStudent,
  resetFilters
} from '../redux/slices/staffSlice';
import { StudentFilters, PaginationState } from '../types/staff';

export const useStaff = () => {
  const dispatch = useAppDispatch();
  const {
    students,
    selectedStudent,
    analytics,
    studentsLoading,
    studentDetailsLoading,
    analyticsLoading,
    filters,
    pagination,
    error
  } = useAppSelector(state => state.staff);

  // Fetch students with filters and pagination
  const getStudents = useCallback((filters?: StudentFilters, page?: number, limit?: number) => {
    dispatch(fetchStudents({ filters, page, limit }));
  }, [dispatch]);

  // Fetch single student details
  const getStudentDetails = useCallback((studentId: string) => {
    dispatch(fetchStudentDetails(studentId));
  }, [dispatch]);



  // Fetch staff analytics
  const getAnalytics = useCallback(() => {
    dispatch(fetchStaffAnalytics());
  }, [dispatch]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<StudentFilters>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Update pagination
  const updatePagination = useCallback((newPagination: Partial<PaginationState>) => {
    dispatch(setPagination(newPagination));
  }, [dispatch]);

  // Clear error
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear selected student
  const clearSelectedStudentState = useCallback(() => {
    dispatch(clearSelectedStudent());
  }, [dispatch]);



  // Reset all filters
  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Auto-refresh students when filters change
  useEffect(() => {
    getStudents(filters, pagination.currentPage);
  }, [filters, pagination.currentPage, getStudents]);

  // Auto-refresh analytics
  useEffect(() => {
    getAnalytics();
  }, [getAnalytics]);

  return {
    // Data
    students,
    selectedStudent,
    analytics,
    
    // Loading states
    studentsLoading,
    studentDetailsLoading,
    analyticsLoading,
    
    // State
    filters,
    pagination,
    error,
    
    // Actions
    getStudents,
    getStudentDetails,
    getAnalytics,
    updateFilters,
    updatePagination,
    clearError: clearErrorState,
    clearSelectedStudent: clearSelectedStudentState,
    resetFilters: resetAllFilters
  };
};
