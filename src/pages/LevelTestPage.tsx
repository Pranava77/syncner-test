import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

interface Level {
  id: string;
  title: string;
  description: string;
  test: any[];
}

const LevelTestPage: React.FC = () => {
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

  if (loading) return <LoadingScreen message="Loading test content..." />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!level) return <div className="text-teallight p-8">Level not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-paperwhite mb-2">{level.title} - Test</h1>
        <p className="text-teallight mb-2">{level.description}</p>
      </div>
      <div className="space-y-4">
        {level.test.length === 0 && <div className="text-teallight">No test content for this level.</div>}
        {level.test.map((q, idx) => (
          <div key={idx} className="bg-paperwhite/10 rounded-lg p-4">
            <div className="font-semibold text-paperwhite mb-1">Q{idx + 1}: {q.question}</div>
            {q.options && q.options.length > 0 && (
              <ul className="list-disc ml-6 text-teallight text-sm">
                {q.options.map((opt: string, i: number) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}
            {q.answer && <div className="text-xs text-trueturquoise mt-2">Answer: {q.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelTestPage; 