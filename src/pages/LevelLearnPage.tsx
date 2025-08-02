import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { PlayIcon, ReaderIcon, FileTextIcon, ChevronUpIcon, ChevronDownIcon, ExternalLinkIcon, ClockIcon, LockClosedIcon } from '@radix-ui/react-icons';
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
  resources?: Array<{
    title: string;
    url: string;
    type: string;
    description: string;
  }>;
  order: number;
}

interface LearnProgress {
  timeSpent: number;
  linksAccessed: string[];
  isCompleted: boolean;
}

const LevelLearnPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [readFirstExpanded, setReadFirstExpanded] = useState(true);
  
  // New state for learn progress tracking
  const [learnProgress, setLearnProgress] = useState<LearnProgress>({
    timeSpent: 0,
    linksAccessed: [],
    isCompleted: false
  });
  const [isTestUnlocked, setIsTestUnlocked] = useState(false);
  const [isLearnUnlocked, setIsLearnUnlocked] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [accessedLinks, setAccessedLinks] = useState<string[]>([]);
  const [isTracking, setIsTracking] = useState(false);

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

  // Fetch learn progress and section unlock status
  const fetchLearnProgress = useCallback(async () => {
    if (!levelId) return;
    
    try {
      const response = await apiService.getLevelSectionStatus(levelId);
      if (response.success && response.data) {
        const { learn, test } = response.data;
        
        // Safely handle learn data
        const learnProgress = learn?.progress || {
          timeSpent: 0,
          linksAccessed: [],
          isCompleted: false
        };
        
        setLearnProgress(learnProgress);
        setIsLearnUnlocked(learn?.isUnlocked ?? true); // Default to true for first level
        setIsTestUnlocked(test?.isUnlocked ?? false);
        setTimeSpent(learnProgress.timeSpent || 0);
        setAccessedLinks(learnProgress.linksAccessed || []);
      }
    } catch (error) {
      console.error('Error fetching learn progress:', error);
      // Set default values on error
      setLearnProgress({
        timeSpent: 0,
        linksAccessed: [],
        isCompleted: false
      });
      setIsLearnUnlocked(true); // Default to unlocked
      setIsTestUnlocked(false);
      setTimeSpent(0);
      setAccessedLinks([]);
    }
  }, [levelId]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
      fetchLearnProgress();
    }
  }, [levelId, fetchLevel, fetchLearnProgress]);

  // Timer effect for tracking time spent
  useEffect(() => {
    if (!isTracking || learnProgress.isCompleted) return;

    const interval = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1;
        
        // Update progress every 30 seconds
        if (newTime % 30 === 0) {
          updateLearnProgress(newTime, accessedLinks);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, learnProgress.isCompleted, accessedLinks]);

  // Start tracking when component mounts
  useEffect(() => {
    setIsTracking(true);
    return () => setIsTracking(false);
  }, []);

  const updateLearnProgress = async (timeSpent: number, linksAccessed: string[]) => {
    if (!levelId) return;
    
    try {
      const response = await apiService.updateLearnProgress(levelId, timeSpent, linksAccessed);
      if (response.success) {
        // Update local state with new progress
        const newLearnProgress = {
          timeSpent,
          linksAccessed,
          isCompleted: response.data.isCompleted || false
        };
        
        setLearnProgress(newLearnProgress);
        setIsTestUnlocked(response.data.isCompleted || false);
        
        if (response.data.isCompleted) {
          setIsTracking(false);
        }
      }
    } catch (error) {
      console.error('Error updating learn progress:', error);
    }
  };

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
    let linkUrl = '';
    
    // Check if item has resources with URLs
    if (item.resources && item.resources.length > 0 && item.resources[0].url) {
      linkUrl = item.resources[0].url;
    } else {
      // Fallback to YouTube search
      linkUrl = generateYouTubeSearchUrl(item.title, level?.title || '');
    }
    
    // Track accessed link only if not already tracked (unique links only)
    if (!accessedLinks.includes(linkUrl)) {
      const newLinks = [...accessedLinks, linkUrl];
      setAccessedLinks(newLinks);
      updateLearnProgress(timeSpent, newLinks);
    }
    
    // Always open link (allow multiple clicks for access)
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTakeTest = () => {
    if (isTestUnlocked) {
      navigate(`/student/training/${levelId}/test`);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const safeTimeSpent = timeSpent || 0;
    const safeLinksLength = accessedLinks?.length || 0;
    
    const timeProgress = Math.min((safeTimeSpent / 300) * 50, 50); // 50% for time (5 minutes)
    const linkProgress = Math.min((safeLinksLength / 2) * 50, 50); // 50% for links (2 links minimum)
    return Math.min(timeProgress + linkProgress, 100);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" refreshTrigger={refreshTrigger} />
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
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" refreshTrigger={refreshTrigger} />
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

  // Check if learn section is unlocked
  if (!isLearnUnlocked) {
    return (
      <div className="flex h-screen bg-offblack overflow-x-hidden">
        <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" refreshTrigger={refreshTrigger} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
          <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 text-center">
            <div className="text-paperwhite/30 text-6xl mb-4">
              <LockClosedIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-paperwhite mb-2">Learning Section Locked</h2>
            <p className="text-teallight mb-6 text-lg">Complete the previous level's exercise to unlock this learning section.</p>
            <button 
              onClick={() => navigate('/student/training')}
              className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
            >
              Back to Training
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" refreshTrigger={refreshTrigger} />
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

        {/* Learn Progress Tracker */}
        <div className="w-full max-w-5xl bg-gradient-to-r from-trueturquoise/10 to-teallight/10 rounded-xl border border-trueturquoise/30 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-trueturquoise text-offblack p-2 rounded-lg">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-paperwhite">Learning Progress</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-trueturquoise">{formatTime(timeSpent)}</div>
              <div className="text-xs text-teallight">Time Spent</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-teallight mb-1">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage()) || 0}%</span>
            </div>
            <div className="w-full bg-paperwhite/20 rounded-full h-3">
              <div 
                className="bg-trueturquoise h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage() || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-paperwhite/5 rounded-lg p-3">
              <div className="text-trueturquoise font-semibold">Time Requirement</div>
              <div className="text-paperwhite">{formatTime(timeSpent)} / 5:00</div>
            </div>
            <div className="bg-paperwhite/5 rounded-lg p-3">
              <div className="text-trueturquoise font-semibold">Links Accessed</div>
              <div className="text-paperwhite">{accessedLinks.length} / 2</div>
            </div>
          </div>
          
          {learnProgress.isCompleted && (
            <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-semibold">Learning Complete! Test is now unlocked.</span>
              </div>
            </div>
          )}
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
                  
                  {item.type === 'video' && item.resources && item.resources.length > 0 && item.resources[0].url && (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg">
                        <PlayIcon className="h-4 w-4" />
                        Watch Video
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-trueturquoise/70 mt-2">
                    Click to {item.type === 'video' && item.resources && item.resources.length > 0 && item.resources[0].url ? 'watch video' : 'search YouTube for related content'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 mb-8">
          {isTestUnlocked ? (
            <button 
              onClick={handleTakeTest}
              disabled={level.test.length === 0}
              className="w-full sm:w-auto bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Take Test ► {level.test.length > 0 && `(${level.test.length} questions)`}
            </button>
          ) : (
            <button 
              disabled
              className="w-full sm:w-auto bg-paperwhite/20 text-paperwhite/50 px-8 py-3 rounded-lg font-bold text-lg cursor-not-allowed flex items-center gap-2"
            >
              <LockClosedIcon className="h-5 w-5" />
              Test Locked - Complete Learning First
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default LevelLearnPage; 