import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
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
  skills?: string[];
  duration?: string;
}

interface LearnItem {
  id: string;
  title: string;
  content: string;
  externalLink?: string; // Only external link field for learn content
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
  const { user } = useAppSelector((state) => state.auth);
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

  // Listen for curriculum changes from admin
  useEffect(() => {
    const handleCurriculumChange = (event: CustomEvent) => {
      console.log('LevelLearnPage: Curriculum change detected:', event.detail);
      // Check both level career track and user career track as fallback
      if (event.detail.track === level?.careerTrack || event.detail.track === user?.careerTrack) {
        console.log('LevelLearnPage: Refreshing level due to curriculum change in admin');
        // Refresh the current level data
        fetchLevel();
      }
    };
    
    const handleLevelsRefreshRequired = (event: CustomEvent) => {
      console.log('LevelLearnPage: Immediate refresh required:', event.detail);
      // Check both level career track and user career track as fallback
      if (event.detail.track === level?.careerTrack || event.detail.track === user?.careerTrack) {
        console.log('LevelLearnPage: Force refreshing level due to immediate refresh requirement');
        // Force immediate refresh
        setTimeout(() => fetchLevel(), 100);
      }
    };
    
    window.addEventListener('curriculum-changed', handleCurriculumChange as EventListener);
    window.addEventListener('levels-refresh-required', handleLevelsRefreshRequired as EventListener);
    
    return () => {
      window.removeEventListener('curriculum-changed', handleCurriculumChange as EventListener);
      window.removeEventListener('levels-refresh-required', handleLevelsRefreshRequired as EventListener);
    };
  }, [fetchLevel, level?.careerTrack, user?.careerTrack]);

  // Check if current level still exists (in case it was deleted by admin)
  useEffect(() => {
    if (level && levelId) {
      // If we have level data but it's not active, it might have been deleted
      if (!level.isActive) {
        console.log('LevelLearnPage: Current level is not active, redirecting to training page');
        navigate('/student/training');
        return;
      }
      
      // If the level ID doesn't match the level data, it might have been changed
      if (level.id !== levelId) {
        console.log('LevelLearnPage: Level ID mismatch, redirecting to training page');
        navigate('/student/training');
        return;
      }
    }
  }, [level, levelId, navigate]);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'var(--color-error)';
      case 'reading': return 'var(--color-accent-primary)';
      case 'slide': return 'var(--color-success)';
      case 'learn': return 'var(--color-accent-primary)';
      default: return 'var(--color-text-muted)';
    }
  };

  const handleLearningCardClick = (item: LearnItem) => {
    let linkUrl = '';
    
    // Check if item has external link
    if (item.externalLink) {
      linkUrl = item.externalLink;
    } else {
      // No link available - show message or handle gracefully
      console.log('No external link available for this item');
      return; // Don't proceed if no link is available
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
    
    // Dynamic progress based on available external links in the level
    const totalAvailableLinks = level?.learn?.filter(item => item.externalLink)?.length || 1; // At least 1 to avoid division by zero
    
    // Progress is based on accessed links vs total available external links
    return Math.min((safeLinksLength / totalAvailableLinks) * 100, 100);
  };

  return (
    <div 
      className="flex h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-secondary-bg)' }}
    >
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelId} currentSection="learn" refreshTrigger={refreshTrigger} />
      <main 
        className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-12 max-w-full flex flex-col items-center"
        style={{ backgroundColor: 'var(--color-secondary-bg)' }}
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
            <p className="text-lg mb-4" style={{ color: 'var(--color-error)' }}>{error || 'Level not found'}</p>
            <button 
              onClick={fetchLevel}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              }}
            >
              Retry
            </button>
          </div>
        ) : !isLearnUnlocked ? (
          <div 
            className="w-full rounded-xl border shadow-lg p-6 text-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="text-6xl mb-4" style={{ color: 'var(--color-text-muted)' }}>
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
              className="px-8 py-3 rounded-lg font-bold transition-colors text-lg shadow-sm"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              }}
            >
              Back to Training
            </button>
          </div>
        ) : (
          <>
            {/* Level Header */}
            <div 
              className="w-full rounded-2xl border shadow-lg p-8 mb-8 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-tertiary) 0%, var(--color-surface) 100%)',
                borderColor: 'var(--color-accent-primary)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <div className="w-full h-full rounded-full"
                  style={{ backgroundColor: 'var(--color-accent-primary)' }}
                />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    {/* Level Number and Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                          color: 'var(--color-text-inverse)'
                        }}
                      >
                        <span className="text-3xl font-bold">{level.order}</span>
                      </div>
                      <div>
                        <h1 
                          className="text-4xl font-bold mb-3"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {level.title}
                        </h1>
                        <p 
                          className="text-xl leading-relaxed"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {level.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Skills and Prerequisites */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {level.skills?.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index}
                          className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                          style={{
                            backgroundColor: 'var(--color-accent-primary)',
                            color: 'var(--color-text-inverse)'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {level.skills && level.skills.length > 3 && (
                        <span 
                          className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                          style={{
                            backgroundColor: 'var(--color-tertiary-bg)',
                            color: 'var(--color-text-secondary)'
                          }}
                        >
                          +{level.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side Badges */}
                  <div className="flex flex-col gap-4">
                    <div 
                      className="px-6 py-4 rounded-2xl text-center shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)'
                      }}
                    >
                      <div className="text-sm font-medium mb-2">Difficulty</div>
                      <div className="text-2xl font-bold capitalize">{level.difficulty}</div>
                    </div>
                    
                    <div 
                      className="px-6 py-4 rounded-2xl text-center shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent-tertiary)',
                        color: 'var(--color-accent-primary)',
                        border: '2px solid var(--color-accent-primary)'
                      }}
                    >
                      <div className="text-sm font-medium mb-2">Track</div>
                      <div className="text-2xl font-bold capitalize">
                        {level.careerTrack.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <div 
                      className="px-6 py-4 rounded-2xl text-center shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent-secondary)',
                        color: 'var(--color-text-inverse)'
                      }}
                    >
                      <div className="text-sm font-medium mb-2">Duration</div>
                      <div className="text-2xl font-bold">{level.duration}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learn Progress Tracker */}
            <div 
              className="w-full rounded-xl border shadow-lg p-6 mb-8"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-tertiary) 0%, var(--color-tertiary-bg) 100%)',
                borderColor: 'var(--color-accent-primary)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
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
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-accent-primary)' }}
                  >
                    {Math.round(getProgressPercentage()) || 0}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Progress</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage()) || 0}%</span>
                </div>
                <div 
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: 'var(--color-border)' }}
                >
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      background: 'linear-gradient(90deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                      width: `${getProgressPercentage() || 0}%` 
                    }}
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
            <div className="w-full">
              {/* Section Header */}
              <div className="mb-6">
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Learning Resources
                </h2>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Click on any resource to start learning. Track your progress as you explore each topic.
                </p>
              </div>

              {/* Learn Content Grid */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                {level.learn.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="group relative rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: accessedLinks.includes(item.title) 
                        ? 'var(--color-success)' 
                        : 'var(--color-border)'
                    }}
                    onClick={() => handleLearningCardClick(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = accessedLinks.includes(item.title) 
                        ? 'var(--color-success)' 
                        : 'var(--color-border)';
                    }}
                  >
                    {/* Progress Indicator */}
                    {accessedLinks.includes(item.title) && (
                      <div 
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ backgroundColor: 'var(--color-success)' }}
                      />
                    )}

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {/* Icon Container */}
                          <div 
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              accessedLinks.includes(item.title) 
                                ? 'scale-110' 
                                : 'group-hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: accessedLinks.includes(item.title)
                                ? 'var(--color-success)'
                                : 'var(--color-accent-tertiary)',
                              color: accessedLinks.includes(item.title)
                                ? 'var(--color-text-inverse)'
                                : 'var(--color-accent-primary)'
                            }}
                          >
                            {accessedLinks.includes(item.title) ? (
                              <CheckCircledIcon className="h-6 w-6" />
                            ) : (
                              <ReaderIcon className="h-6 w-6" />
                            )}
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 
                                className="text-xl font-bold truncate"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {item.title}
                              </h3>
                              {accessedLinks.includes(item.title) && (
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: 'var(--color-success)',
                                    color: 'var(--color-text-inverse)'
                                  }}
                                >
                                  Completed
                                </span>
                              )}
                            </div>
                            
                            {/* Order Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span 
                                className="px-2 py-1 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: 'var(--color-tertiary-bg)',
                                  color: 'var(--color-text-secondary)'
                                }}
                              >
                                Resource #{item.order}
                              </span>
                              {item.externalLink && (
                                <span 
                                  className="px-2 py-1 rounded-md text-xs font-medium"
                                  style={{
                                    backgroundColor: 'var(--color-accent-tertiary)',
                                    color: 'var(--color-accent-primary)'
                                  }}
                                >
                                  External Link
                                </span>
                              )}
                            </div>

                            {/* Content Preview */}
                            <p 
                              className="text-base leading-relaxed line-clamp-3"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {item.content}
                            </p>
                          </div>
                        </div>

                        {/* Action Indicators */}
                        <div className="flex items-center gap-3">
                          {accessedLinks.includes(item.title) ? (
                            <div 
                              className="p-2 rounded-full"
                              style={{
                                backgroundColor: 'var(--color-success)',
                                color: 'var(--color-text-inverse)'
                              }}
                            >
                              <CheckCircledIcon className="h-5 w-5" />
                            </div>
                          ) : (
                            <div 
                              className="p-2 rounded-full transition-all duration-300 group-hover:scale-110"
                              style={{
                                backgroundColor: 'var(--color-accent-tertiary)',
                                color: 'var(--color-accent-primary)'
                              }}
                            >
                              <ChevronRightIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* External Link Section */}
                      {item.externalLink && (
                        <div 
                          className="mt-6 pt-4 border-t"
                          style={{ borderColor: 'var(--color-border-subtle)' }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-sm font-medium"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                External Resource:
                              </span>
                            </div>
                            <a 
                              href={item.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: 'var(--color-accent-primary)',
                                color: 'var(--color-text-inverse)'
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                              }}
                            >
                              <span>Open Resource</span>
                              <ExternalLinkIcon className="h-4 w-4" />
                            </a>
                          </div>
                          
                          {/* Link Preview */}
                          <div className="mt-3 p-3 rounded-lg bg-opacity-50"
                            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
                          >
                            <p 
                              className="text-sm break-all font-mono"
                              style={{ color: 'var(--color-accent-primary)' }}
                            >
                              {item.externalLink}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-6 pt-4 border-t"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                      >
                        <button 
                          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                            accessedLinks.includes(item.title)
                              ? 'cursor-default'
                              : 'hover:scale-105'
                          }`}
                          style={{
                            backgroundColor: accessedLinks.includes(item.title)
                              ? 'var(--color-success)'
                              : 'var(--color-accent-primary)',
                            color: 'var(--color-text-inverse)'
                          }}
                          disabled={accessedLinks.includes(item.title)}
                        >
                          {accessedLinks.includes(item.title) 
                            ? '✓ Resource Completed' 
                            : 'Start Learning'
                          }
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty State */}
                {level.learn.length === 0 && (
                  <div 
                    className="text-center py-12 rounded-2xl border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-subtle)'
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      <ReaderIcon className="h-8 w-8" />
                    </div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      No Learning Resources Available
                    </h3>
                    <p 
                      className="text-base"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      This level doesn't have any learning resources yet. Check back later!
                    </p>
                  </div>
                )}
              </div>
            </div>

      

            {/* Action Buttons */}
            <div className="w-full flex justify-between items-center mt-8">
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