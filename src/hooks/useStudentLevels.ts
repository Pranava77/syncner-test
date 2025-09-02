import { useState, useEffect, useMemo } from 'react';
import apiService from '../services/api';

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  careerTrack: string;
  order: number;
  isActive: boolean;
  learn: any[];
  test: any[];
  exercise: any[];
  isUnlocked: boolean;
  isCompleted: boolean;
  completedSections: {
    learn: boolean;
    exercise: boolean;
    test: boolean;
  };
}

export interface LevelsResponse {
  levels: Level[];
  currentLevel: number;
  totalPoints: number;
}

export const useStudentLevels = (careerTrack?: string) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevels = async () => {
      if (!careerTrack) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get curriculum levels with status
        const response = await apiService.get('/progress/levels-status');
        
        if (response.success && response.data) {
          // Handle both direct array response and nested levels response
          const levelsData = Array.isArray(response.data) ? response.data : response.data.levels || [];
          console.log('Levels data received:', levelsData);
          setLevels(levelsData);
          setCurrentLevel(response.data.currentLevel || 1);
          setTotalPoints(response.data.totalPoints || 0);
        } else {
          throw new Error(response.message || 'Failed to fetch levels');
        }
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch levels');
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [careerTrack]);

  // Filter and sort levels for the specific track
  const filteredLevels = useMemo(() => {
    if (!careerTrack) return [];
    return levels
      .filter(level => level.careerTrack === careerTrack && level.isActive)
      .sort((a, b) => a.order - b.order);
  }, [levels, careerTrack]);

  return {
    levels: filteredLevels,
    currentLevel,
    totalPoints,
    loading,
    error
  };
};
