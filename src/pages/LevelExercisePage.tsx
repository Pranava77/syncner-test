import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

interface Level {
  id: string;
  title: string;
  description: string;
  exercise: any[];
}

const LevelExercisePage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevel = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getLevel(levelId || '');
        if (response.success) {
          setLevel(response.data);
        } else {
          setError(response.message || 'Failed to fetch level');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch level');
      } finally {
        setLoading(false);
      }
    };
    fetchLevel();
  }, [levelId]);

  if (loading) return <LoadingScreen message="Loading exercise content..." />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!level) return <div className="text-teallight p-8">Level not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-paperwhite mb-2">{level.title} - Exercise</h1>
        <p className="text-teallight mb-2">{level.description}</p>
      </div>
      <div className="space-y-4">
        {level.exercise.length === 0 && <div className="text-teallight">No exercises for this level.</div>}
        {level.exercise.map((ex, idx) => (
          <div key={idx} className="bg-paperwhite/10 rounded-lg p-4">
            <div className="font-semibold text-paperwhite mb-1">{ex.title}</div>
            {ex.description && <div className="text-teallight text-sm mb-2">{ex.description}</div>}
            {ex.resources && ex.resources.length > 0 && (
              <div className="text-xs text-trueturquoise">Resources: {ex.resources.join(', ')}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelExercisePage; 