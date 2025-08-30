import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchStudentPortfolio } from '../redux/slices/studentSlice';

export const useStudent = () => {
  const dispatch = useAppDispatch();
  const {
    portfolioData,
    portfolioLoading,
    portfolioError
  } = useAppSelector(state => state.student);

  // Fetch student's own portfolio data
  const getPortfolioData = useCallback((studentId: string) => {
    dispatch(fetchStudentPortfolio(studentId));
  }, [dispatch]);

  return {
    // Data
    portfolioData,
    
    // Loading states
    portfolioLoading,
    
    // Error state
    portfolioError,
    
    // Actions
    getPortfolioData
  };
};
