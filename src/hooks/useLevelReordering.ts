import { useState, useCallback } from 'react';
import { useAppDispatch } from '../redux/store';
import { clearCache } from '../redux/slices/curriculumSlice';
import apiService from '../services/api';

export const useLevelReordering = () => {
  const dispatch = useAppDispatch();

  // State
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  // Move level up
  const moveLevelUp = useCallback(async (track: string, currentOrder: number, targetOrder: number) => {
    if (currentOrder <= 1) return { success: false, message: 'Level is already at the top' };

    try {
      setIsReordering(true);
      setReorderError(null);



      const response = await apiService.reorderLevelsByTrack(track, currentOrder, targetOrder);
      
      if (response.success) {
        dispatch(clearCache());
        window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'level-reordered' } }));
        window.dispatchEvent(new CustomEvent('levels-refresh-required'));
        
        return { 
          success: true, 
          message: `Level moved from position ${currentOrder} to ${targetOrder}` 
        };
      } else {
        const errorMessage = response.message || 'Failed to reorder level';
        setReorderError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      // Silent error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setReorderError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsReordering(false);
    }
  }, [dispatch]);

  // Move level down
  const moveLevelDown = useCallback(async (track: string, currentOrder: number, targetOrder: number) => {
    try {
      setIsReordering(true);
      setReorderError(null);



      const response = await apiService.reorderLevelsByTrack(track, currentOrder, targetOrder);
      
      if (response.success) {
        dispatch(clearCache());
        window.dispatchEvent(new CustomEvent('curriculum-changed', { detail: { type: 'level-reordered' } }));
        window.dispatchEvent(new CustomEvent('levels-refresh-required'));
        
        return { 
          success: true, 
          message: `Level moved from position ${currentOrder} to ${targetOrder}` 
        };
      } else {
        const errorMessage = response.message || 'Failed to reorder level';
        setReorderError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      // Silent error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setReorderError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsReordering(false);
    }
  }, [dispatch]);

  // Clear reorder error
  const clearReorderError = useCallback(() => {
    setReorderError(null);
  }, []);

  return {
    // State
    isReordering,
    reorderError,

    // Actions
    moveLevelUp,
    moveLevelDown,
    clearReorderError
  };
};

export default useLevelReordering;
