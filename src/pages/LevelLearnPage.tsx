import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';
import { PlayIcon, ReaderIcon, FileTextIcon, ChevronUpIcon, ChevronDownIcon, ExternalLinkIcon, ClockIcon, LockClosedIcon, CheckCircledIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import syncnerLogo from '../assets/syncner-logo.png';

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
  const [accessedLinks, setAccessedLinks] = useState<string[]>([]);

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
      console.log('Fetch learn progress response:', response);
      
      if (response.success && response.data) {
        const { learn, test } = response.data;
        console.log('Learn data:', learn);
        console.log('Test data:', test);
        
        // Safely handle learn data
        const learnProgress = learn?.progress || {
          timeSpent: 0,
          linksAccessed: [],
          isCompleted: false
        };
        
        console.log('Setting learn progress:', learnProgress);
        setLearnProgress(learnProgress);
        setIsLearnUnlocked(learn?.isUnlocked ?? true); // Default to true for first level
        setIsTestUnlocked(learnProgress.isCompleted || false); // Test is unlocked when learn is completed
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
      setAccessedLinks([]);
    }
  }, [levelId]);

  useEffect(() => {
    if (levelId) {
      fetchLevel();
      fetchLearnProgress();
    }
  }, [levelId, fetchLevel, fetchLearnProgress]);

  const updateLearnProgress = async (linksAccessed: string[]) => {
    if (!levelId) return;
    
    try {
      console.log('Frontend: Updating learn progress with links:', linksAccessed);
      console.log('Frontend: Level ID:', levelId);
      
      const response = await apiService.updateLearnProgress(levelId, 0, linksAccessed);
      console.log('Frontend: Update learn progress response:', response);
      
      if (response.success) {
        // Update local state with new progress
        const newLearnProgress = {
          timeSpent: 0,
          linksAccessed,
          isCompleted: response.data.isCompleted || false
        };
        
        console.log('Frontend: Setting new learn progress:', newLearnProgress);
        setLearnProgress(newLearnProgress);
        setIsTestUnlocked(response.data.isCompleted || false);
        
        // If learn is completed, mark the learn section as completed
        if (response.data.isCompleted && level) {
          try {
            console.log('Marking learn section as completed:', { levelId: level.id, levelOrder: level.order, section: 'learn' });
            const completionResult = await apiService.markLevelCompleted(level.id, level.order, 'learn');
            console.log('Learn section completion result:', completionResult);
            
            // Trigger sidebar refresh to update unlock status
            setRefreshTrigger(prev => prev + 1);
            
            // Trigger dashboard progress update
            window.dispatchEvent(new CustomEvent('progress-updated'));
            localStorage.setItem('level-progress-updated', Date.now().toString());
          } catch (completionError) {
            console.error('Error marking learn section as completed:', completionError);
          }
        }
        

      }
    } catch (error) {
      console.error('Frontend: Error updating learn progress:', error);
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
      updateLearnProgress(newLinks);
    }
    
    // Always open link (allow multiple clicks for access)
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTakeTest = () => {
    console.log('Take Test clicked - learnProgress.isCompleted:', learnProgress.isCompleted, 'isTestUnlocked:', isTestUnlocked);
    if (learnProgress.isCompleted && isTestUnlocked) {
      console.log('Navigating to test page');
      navigate(`/student/training/${levelId}/test`);
    } else {
      console.log('Test not unlocked - learn completed:', learnProgress.isCompleted, 'test unlocked:', isTestUnlocked);
    }
  };

  const getProgressPercentage = () => {
    const safeLinksLength = accessedLinks?.length || 0;
    
    // Dynamic progress based on available links in the level
    const totalAvailableLinks = level?.learn?.length || 1; // At least 1 to avoid division by zero
    
    // Progress is based on accessed links vs total available links
    return Math.min((safeLinksLength / totalAvailableLinks) * 100, 100);
  };

  return (
    <div 
      className="flex h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" refreshTrigger={refreshTrigger} />
      <main 
        className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
        style={{ backgroundColor: 'var(--color-primary-bg)' }}
      >
        {loading ? (
          <div className="text-center flex flex-col items-center justify-center min-h-screen">
            <motion.img
              src={syncnerLogo}
              alt="Syncner Logo"
              className="w-16 h-16 mx-auto mb-4"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Loading level content...
            </p>
          </div>
        ) : error || !level ? (
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error || 'Level not found'}</p>
            <button 
              onClick={fetchLevel}
              className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : !isLearnUnlocked ? (
          <div 
            className="w-full max-w-5xl rounded-xl border shadow-lg p-6 text-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="text-paperwhite/30 text-6xl mb-4">
              <LockClosedIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Learning Section Locked
            </h2>
            <p 
              className="mb-6 text-lg"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Complete the previous level's exercise to unlock this learning section.
            </p>
            <button 
              onClick={() => navigate('/student/training')}
              className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-bold hover:bg-trueturquoise/90 transition-colors text-lg shadow-sm"
            >
              Back to Training
            </button>
          </div>
        ) : (
          <>
            {/* Level Header */}
            <div className="w-full max-w-5xl bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Level {level.order}: {level.title}
            </h1>
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
                  <h2 
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Learning Progress
            </h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-trueturquoise">{Math.round(getProgressPercentage()) || 0}%</div>
                  <div className="text-xs text-teallight">Progress</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-teallight mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage()) || 0}%</span>
                </div>
                <div className="w-full bg-paperwhite/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-trueturquoise to-teallight h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage() || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <span>Time spent: {Math.floor(learnProgress.timeSpent / 60)}m {learnProgress.timeSpent % 60}s</span>
                <span>{learnProgress.linksAccessed.length} of {level?.learn?.length || 1} resources accessed</span>
              </div>
            </div>

            {/* Learning Content */}
            <div className="w-full max-w-5xl space-y-6">
              {level.learn.map((item, index) => (
                <div 
                  key={index}
                  className="rounded-xl border shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                  onClick={() => handleLearningCardClick(item)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: 'var(--color-accent-tertiary)',
                          color: 'var(--color-accent-primary)'
                        }}
                      >
                        {getContentIcon(item.type)}
                      </div>
                      <div>
                        <h3 
                          className="text-lg font-semibold mb-1"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {item.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Order: {item.order}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {accessedLinks.includes(item.title) && (
                        <CheckCircledIcon 
                          className="h-5 w-5" 
                          style={{ color: 'var(--color-success)' }}
                        />
                      )}
                      <ChevronRightIcon 
                        className="h-4 w-4" 
                        style={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </div>
                  </div>
                  
                  <div 
                    className="text-sm line-clamp-3"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {item.content}
                  </div>
                  
                  {item.resources && item.resources.length > 0 && (
                    <div 
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    >
                      <h4 
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Resources:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.resources.map((resource, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: 'var(--color-accent-tertiary)',
                              color: 'var(--color-text-tertiary)'
                            }}
                          >
                            {resource.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

      

            {/* Action Buttons */}
            <div className="w-full max-w-5xl flex justify-between items-center mt-8">
              <button
                onClick={() => navigate('/student/training')}
                className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                style={{ 
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-accent-tertiary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                }}
              >
                Back to Training
              </button>
              
              <div className="flex gap-4">
                <button
                  onClick={handleTakeTest}
                  disabled={!learnProgress.isCompleted}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    learnProgress.isCompleted 
                      ? 'hover:scale-105' 
                      : 'cursor-not-allowed'
                  }`}
                  style={{ 
                    color: learnProgress.isCompleted ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                    backgroundColor: learnProgress.isCompleted 
                      ? 'var(--color-accent-primary)' 
                      : 'var(--color-accent-tertiary)'
                  }}
                  onMouseEnter={(e) => {
                    if (learnProgress.isCompleted) {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (learnProgress.isCompleted) {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                    }
                  }}
                >
                  Take Test {learnProgress.isCompleted ? '(Ready)' : '(Complete Learn First)'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LevelLearnPage; 