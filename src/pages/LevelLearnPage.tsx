import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { PlayIcon, ReaderIcon, FileTextIcon, ChevronUpIcon, ChevronDownIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
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
  careerTrack: string;
  learn: LearnItem[];
  test: any[];
  exercise: any[];
  order: number;
  isActive: boolean;
  readFirst?: ReadFirst;
}

interface LearnItem {
  type: 'video' | 'reading' | 'slide' | 'other' | 'learn';
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
  const [readFirstExpanded, setReadFirstExpanded] = useState(true);

  const fetchLevel = useCallback(async () => {
    try {
      setLoading(true);
      console.log('LevelLearnPage: Fetching level with ID:', levelId);
      const response = await apiService.getLevel(levelId!);
      console.log('LevelLearnPage: Level data response:', response);
      
      let levelData = null;
      if (response && response.data) {
        levelData = response.data;
      } else if (response) {
        levelData = response;
      }
      
      setLevel(levelData);
      
      // Debug learn data
      if (levelData && levelData.learn) {
        console.log('LevelLearnPage: Learn data:', levelData.learn);
        console.log('LevelLearnPage: Learn data length:', levelData.learn.length);
        levelData.learn.forEach((learn: any, index: number) => {
          console.log(`LevelLearnPage: Learn ${index}:`, learn);
        });
      } else {
        console.log('LevelLearnPage: No learn data found in level:', levelData);
      }
    } catch (error) {
      console.error('LevelLearnPage: Error fetching level:', error);
      setError(`Failed to load learning content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
    }
  }, [levelId, fetchLevel]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="h-4 w-4" />;
      case 'reading': return <ReaderIcon className="h-4 w-4" />;
      case 'slide': return <FileTextIcon className="h-4 w-4" />;
      case 'learn': return <ReaderIcon className="h-4 w-4" />;
      default: return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'reading': return 'bg-blue-500';
      case 'slide': return 'bg-green-500';
      case 'learn': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const generateYouTubeSearchUrl = (title: string, levelTitle: string) => {
    const searchQuery = encodeURIComponent(`${title} ${levelTitle} tutorial`);
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  };

  const handleLearningCardClick = (item: LearnItem) => {
    // If there's already a videoUrl, use that
    if (item.type === 'video' && item.videoUrl) {
      window.open(item.videoUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Otherwise, search YouTube for related content
      const youtubeUrl = generateYouTubeSearchUrl(item.title, level?.title || '');
      window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
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

        {/* Read This First! Section */}
        {level.readFirst && (level.readFirst.brief || level.readFirst.whyLearn || level.readFirst.whereUsed || level.readFirst.customExample) && (
          <div className="w-full max-w-5xl bg-gradient-to-r from-trueturquoise/10 to-teallight/10 rounded-xl border border-trueturquoise/30 shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-trueturquoise text-offblack p-2 rounded-lg">
                  <ReaderIcon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-paperwhite">Read This First!</h2>
              </div>
              <button
                onClick={() => setReadFirstExpanded(!readFirstExpanded)}
                className="flex items-center gap-2 text-trueturquoise hover:text-teallight transition-colors"
              >
                <span className="text-sm font-medium">
                  {readFirstExpanded ? 'Collapse' : 'Expand'}
                </span>
                {readFirstExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <AnimatePresence>
              {readFirstExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6 overflow-hidden"
                >
                  {level.readFirst.brief && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-trueturquoise mb-2 flex items-center gap-2">
                        <span>📖</span>
                        Brief - What is this?
                      </h3>
                      <p className="text-paperwhite leading-relaxed">{level.readFirst.brief}</p>
                    </motion.div>
                  )}
                  
                  {level.readFirst.whyLearn && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-trueturquoise mb-2 flex items-center gap-2">
                        <span>🎯</span>
                        Why you need to learn this
                      </h3>
                      <p className="text-paperwhite leading-relaxed">{level.readFirst.whyLearn}</p>
                    </motion.div>
                  )}
                  
                  {level.readFirst.whereUsed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-trueturquoise mb-2 flex items-center gap-2">
                        <span>🌍</span>
                        Where it is used
                      </h3>
                      <p className="text-paperwhite leading-relaxed">{level.readFirst.whereUsed}</p>
                    </motion.div>
                  )}
                  
                  {level.readFirst.customExample && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-paperwhite/5 rounded-lg p-4 border border-paperwhite/10 hover:bg-paperwhite/10 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-trueturquoise mb-2 flex items-center gap-2">
                        <span>💡</span>
                        Custom Example
                      </h3>
                      <p className="text-paperwhite leading-relaxed whitespace-pre-wrap">{level.readFirst.customExample}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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
                <div 
                  key={index} 
                  className="bg-paperwhite/10 rounded-lg p-4 cursor-pointer hover:bg-paperwhite/20 transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-trueturquoise/30"
                  onClick={() => handleLearningCardClick(item)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${getContentColor(item.type)}`}>
                      {getContentIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-paperwhite flex items-center gap-2">
                        {item.title}
                        <ExternalLinkIcon className="h-4 w-4 text-trueturquoise" />
                      </h3>
                      <span className="text-xs text-teallight capitalize">{item.type}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-paperwhite text-sm leading-relaxed">{item.content}</p>
                  </div>
                  
                  {item.type === 'video' && item.videoUrl && (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg">
                        <PlayIcon className="h-4 w-4" />
                        Watch Video
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-trueturquoise/70 mt-2">
                    Click to {item.type === 'video' && item.videoUrl ? 'watch video' : 'search YouTube for related content'}
                  </div>
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