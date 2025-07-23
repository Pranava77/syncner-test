import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { PlayIcon, ReaderIcon, FileTextIcon } from '@radix-ui/react-icons';
import apiService from '../services/api';

interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  careerTrack: string;
  learn: LearnItem[];
  test: any[];
  exercise: any[];
  order: number;
  isActive: boolean;
}

interface LearnItem {
  type: 'video' | 'reading' | 'slide' | 'other';
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

const LevelLearnPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
    }
  }, [levelId, fetchLevel]);

  const fetchLevel = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/training/levels/${levelId}`);
      console.log('Level data response:', response);
      
      let levelData = null;
      if (response && response.data) {
        levelData = response.data;
      } else if (response) {
        levelData = response;
      }
      
      setLevel(levelData);
    } catch (error) {
      console.error('Error fetching level:', error);
      setError('Failed to load level content');
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="h-4 w-4" />;
      case 'reading': return <ReaderIcon className="h-4 w-4" />;
      case 'slide': return <FileTextIcon className="h-4 w-4" />;
      default: return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'reading': return 'bg-blue-500';
      case 'slide': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTakeTest = () => {
    navigate(`/student/training/${levelId}/test`);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trueturquoise mx-auto mb-4"></div>
            <p className="text-paperwhite text-lg">Loading level content...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error || 'Level not found'}</p>
            <button 
              onClick={fetchLevel}
              className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
        {/* Level Header */}
        <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-paperwhite mb-2">Level {level.order}: {level.title}</h1>
              <p className="text-teallight">{level.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-sm">
                {level.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-sm">
                {level.careerTrack}
            </span>
            </div>
          </div>
        </div>

        {/* Learning Materials */}
        <div className="w-full max-w-5xl bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-paperwhite mb-6">Learning Materials</h2>
          
          {level.learn.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-paperwhite/30 text-4xl mb-4">📚</div>
              <p className="text-teallight">No learning materials available for this level</p>
            </div>
          ) : (
            <div className="space-y-4">
              {level.learn.map((item, index) => (
                <div key={index} className="bg-paperwhite/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${getContentColor(item.type)}`}>
                      {getContentIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-paperwhite">{item.title}</h3>
                      <span className="text-xs text-teallight capitalize">{item.type}</span>
            </div>
          </div>
                  
                  <div className="mb-4">
                    <p className="text-paperwhite text-sm leading-relaxed">{item.content}</p>
            </div>
                  
                  {item.type === 'video' && item.videoUrl && (
                    <div className="mb-4">
                <a
                        href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                        <PlayIcon className="h-4 w-4" />
                        Watch Video
                </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 mb-8">
          <button className="w-full sm:w-auto bg-paperwhite text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-trueturquoise hover:text-offblack transition-colors mb-2 sm:mb-0">
            Mark as Completed ▼
          </button>
          <button 
            onClick={handleTakeTest}
            disabled={level.test.length === 0}
            className="w-full sm:w-auto bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Take Test ► {level.test.length > 0 && `(${level.test.length} questions)`}
          </button>
        </div>
      </main>
    </div>
  );
};

export default LevelLearnPage; 