import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../redux/store';
import { clearCache } from '../redux/slices/curriculumSlice';
import apiService from '../services/api';

interface ReadFirst {
  brief?: string;
  whyLearn?: string;
  whereUsed?: string;
  customExample?: string;
}

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  learn: any[];
  test: any[];
  exercise: any[];
  order: number;
  isActive: boolean;
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
  readFirst?: ReadFirst;
  learnExpanded?: boolean;
  testExpanded?: boolean;
  exerciseExpanded?: boolean;
}

interface LevelForm {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  careerTrack: string;
  skills: string[];
  prerequisites: string[];
  estimatedHours: number;
  isActive: boolean;
  order?: number;
  readFirst?: ReadFirst;
}

const defaultLevelForm: LevelForm = {
  title: '',
  description: '',
  difficulty: 'beginner',
  duration: '',
  careerTrack: 'full-stack',
  skills: [],
  prerequisites: [],
  estimatedHours: 1,
  isActive: true,
  readFirst: {
    brief: '',
    whyLearn: '',
    whereUsed: '',
    customExample: ''
  }
};

export const useCurriculumManagement = () => {
  const dispatch = useAppDispatch();
  
  // State
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [showTrackSelection, setShowTrackSelection] = useState(true);
  const [trackCounts, setTrackCounts] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [refetchMessage, setRefetchMessage] = useState<string | null>(null);

  // Available career tracks
  const tracks = ['full-stack', 'ai-ml', 'ui-ux', 'data-science'];

  // Normalize track ids coming from UI to API format
  const normalizeTrack = useCallback((track?: string | null) => {
    if (!track) return '';
    const map: Record<string, string> = {
      'fullstack': 'full-stack',
      'full-stack': 'full-stack',
      'Full Stack': 'full-stack',
      'aiml': 'ai-ml',
      'ai-ml': 'ai-ml',
      'AI/ML': 'ai-ml',
      'uiux': 'ui-ux',
      'ui-ux': 'ui-ux',
      'UI/UX': 'ui-ux',
      'datascience': 'data-science',
      'data-science': 'data-science',
      'Data Science': 'data-science'
    };
    return map[track] || track;
  }, []);

  // Fetch track counts
  const fetchCounts = useCallback(async () => {
    try {
      const res = await apiService.get('/curriculum?grouped=true');
      if (res.success && Array.isArray(res.data)) {
        const counts: Record<string, number> = {};
        res.data.forEach((lvl: any) => {
          const key = normalizeTrack(lvl.careerTrack);
          counts[key] = (counts[key] || 0) + 1;
        });
        setTrackCounts(counts);
      }
    } catch (e) {
      console.warn('Failed to fetch track counts', e);
    }
  }, [normalizeTrack]);

  // Fetch levels for a specific track
  const fetchLevels = useCallback(async (track?: string) => {
    try {
      setLoading(true);
      const chosenTrackRaw = track ?? selectedTrack ?? '';
      const chosenTrack = normalizeTrack(chosenTrackRaw);
      
      // If no track selected, don't fetch to avoid initial flash of other tracks
      if (!chosenTrack) {
        setLevels([]);
        setLoading(false);
        return;
      }
      
      const url = `/curriculum?grouped=true${chosenTrack ? `&careerTrack=${chosenTrack}` : ''}`;
      const response = await apiService.get(url);
      
      if (response.success) {
        // The backend now returns grouped levels structure, same as training endpoint
        let levelsData = response.data || [];
        
        // Extra safety: filter client-side if backend ignores careerTrack
        if (chosenTrack) {
          levelsData = (levelsData || []).filter((lvl: any) => lvl.careerTrack === chosenTrack);
        }
        
        // Transform the data to match our frontend structure
        const transformedLevels = levelsData.map((level: any) => ({
          ...level,
          learnExpanded: false,
          testExpanded: false,
          exerciseExpanded: false
        }));
        
        setLevels(transformedLevels);
        setActiveTrack(chosenTrack);
        setShowTrackSelection(false);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch levels');
        setLevels([]);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      setError(`Failed to load levels: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTrack, normalizeTrack]);

  // Handle track selection
  const handleTrackSelect = useCallback((track: string) => {
    setSelectedTrack(track);
    fetchLevels(track);
  }, [fetchLevels]);

  // Handle back to tracks
  const handleBackToTracks = useCallback(() => {
    setShowTrackSelection(true);
    setSelectedTrack(null);
    setActiveTrack(null);
    setLevels([]);
    setError(null);
  }, []);

  // Show success message
  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    // State
    levels,
    loading,
    error,
    successMessage,
    selectedTrack,
    activeTrack,
    showTrackSelection,
    trackCounts,
    lastUpdated,
    isRefetching,
    refetchMessage,
    tracks,
    
    // Actions
    fetchLevels,
    handleTrackSelect,
    handleBackToTracks,
    showSuccessMessage,
    clearError,
    setLevels,
    setLoading,
    setError,
    setSuccessMessage,
    setIsRefetching,
    setRefetchMessage,
    setSelectedTrack,
    
    // Utilities
    normalizeTrack
  };
};

export default useCurriculumManagement;
