import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

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
}

const TrainingLevelDetail: React.FC = () => {
  const { levelId, section } = useParams<{ levelId: string; section: string }>();
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevel = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getLevel(levelId);
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

  if (loading) return <LoadingScreen message="Loading level..." />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!level) return <div className="text-teallight p-8">Level not found.</div>;

  let sectionContent = null;
  if (section === 'learn') {
    sectionContent = (
      <div className="space-y-4">
        {level.learn.length === 0 && <div className="text-teallight">No learning content for this level.</div>}
        {level.learn.map((item, idx) => (
          <div key={idx} className="bg-paperwhite/10 rounded-lg p-4">
            <div className="font-semibold text-paperwhite mb-1">{item.title}</div>
            {item.type === 'video' && item.videoUrl && (
              <div className="aspect-video mb-2">
                <iframe
                  src={item.videoUrl}
                  title={item.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            )}
            {item.content && <div className="text-teallight text-sm">{item.content}</div>}
          </div>
        ))}
      </div>
    );
  } else if (section === 'test') {
    sectionContent = (
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
    );
  } else if (section === 'exercise') {
    sectionContent = (
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
    );
  } else {
    sectionContent = <div className="text-teallight">Invalid section.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-paperwhite mb-2">{level.title}</h1>
        <p className="text-teallight mb-2">{level.description}</p>
        <div className="flex gap-4 text-sm text-teallight mb-2">
          <span className="bg-trueturquoise/20 text-trueturquoise px-2 py-0.5 rounded-full">{level.difficulty}</span>
          <span>{level.duration}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {level.skills.map((skill) => (
            <span key={skill} className="bg-trueturquoise/10 text-trueturquoise px-3 py-1 rounded-full text-xs">{skill}</span>
          ))}
        </div>
      </div>
      {sectionContent}
    </div>
  );
};

export default TrainingLevelDetail; 