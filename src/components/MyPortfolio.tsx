import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircledIcon,
  ClockIcon,
  ChevronRightIcon,
  CalendarIcon,
  RocketIcon,
  PersonIcon,
  IdCardIcon,
  ArrowLeftIcon,
  Share1Icon,
  DownloadIcon
} from '@radix-ui/react-icons';
import { useStudent } from '../hooks/useStudent';
import ThemeContainer from './ThemeContainer';
import DailyActivityChart from './DailyActivityChart';

const MyPortfolio: React.FC = () => {
  const navigate = useNavigate();
  const { portfolioData, portfolioLoading, portfolioError, getPortfolioData } = useStudent();
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  // Handle back navigation
  const handleBack = () => {
    navigate('/student/dashboard');
  };

  // Fetch student's own portfolio data when component mounts
  React.useEffect(() => {
    console.log('🔄 Fetching own portfolio data');
    getPortfolioData(''); // Pass empty string for own portfolio
  }, [getPortfolioData]);

  // Show loading state
  if (portfolioLoading || !portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading your portfolio...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (portfolioError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {portfolioError}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (portfolioLoading || !portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading your portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (portfolioError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {portfolioError}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const student = portfolioData;



  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!student?.learningTimeline || !Array.isArray(student.learningTimeline) || student.learningTimeline.length === 0) return 0;
    const completed = student.learningTimeline.filter((l: any) => l.status === 'completed').length;
    return Math.round((completed / student.learningTimeline.length) * 100);
  };

  // Get skills for career track - use backend data if available, fallback to hardcoded
  const getSkillsForTrack = () => {
    if (student.skills && student.skills.length > 0) {
      return student.skills;
    }
    
    const skills: { [key: string]: string[] } = {
      'web-development': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database Design'],
      'full-stack': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database Design', 'Full Stack Architecture'],
      'data-science': ['Python', 'Statistics', 'Machine Learning', 'Data Visualization', 'SQL'],
      'mobile-development': ['React Native', 'Flutter', 'Mobile UI/UX', 'App Development', 'Cross-platform'],
      'cybersecurity': ['Network Security', 'Ethical Hacking', 'Cryptography', 'Security Analysis', 'Incident Response']
    };
    return skills[student.careerTrack as keyof typeof skills] || ['Programming', 'Problem Solving', 'Critical Thinking'];
  };

  // Get recommended roles - use backend data if available, fallback to hardcoded
  const getRecommendedRoles = () => {
    if (student.recommendedRoles && student.recommendedRoles.length > 0) {
      return student.recommendedRoles;
      }
    
    const roles: { [key: string]: string[] } = {
      'web-development': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Web Developer'],
      'full-stack': ['Full Stack Developer', 'Full Stack Engineer', 'Web Developer', 'Software Engineer'],
      'data-science': ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Business Intelligence Analyst'],
      'mobile-development': ['Mobile App Developer', 'React Native Developer', 'Flutter Developer', 'iOS/Android Developer'],
      'cybersecurity': ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'Cyber Security Specialist']
    };
    return roles[student.careerTrack as keyof typeof roles] || ['Software Developer', 'Technical Specialist', 'IT Professional'];
  };

  // Generate dynamic introduction based on student data
  const generateDynamicIntroduction = (student: any) => {
    const completionPercentage = calculateCompletionPercentage();
    const currentLevel = student.summaryStats?.currentLevel || 1;
    const totalLevels = student.summaryStats?.totalLevels || 10;
    
    // Performance descriptors based on completion percentage
    const performanceLevel = completionPercentage >= 80 ? 'an exceptional' : 
                            completionPercentage >= 60 ? 'a highly motivated' : 
                            completionPercentage >= 40 ? 'a dedicated' : 'an aspiring';
    
    // Progress descriptor
    const progressText = currentLevel === totalLevels ? 'who has successfully completed the entire curriculum' :
                        currentLevel > totalLevels * 0.8 ? 'approaching mastery of the curriculum' :
                        currentLevel > totalLevels * 0.5 ? 'making excellent progress through the curriculum' :
                        'building a strong foundation in the curriculum';
    
    return (
      <>
        {performanceLevel} student pursuing{' '}
        <span className="px-2 py-1 rounded-md font-medium" style={{ 
          backgroundColor: 'var(--color-accent-tertiary)', 
          color: 'var(--color-accent-primary)' 
        }}>
          {student.careerTrack || 'Technology'}
        </span>{' '}
        {progressText}. Currently enrolled in{' '}
        {student.batch ? (
          <>
            batch <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.batch}</span>{' '}
          </>
        ) : ''}
        {student.department && (
          <>
            at <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.department}</span> department{' '}
          </>
        )}
        {student.college && (
          <>
            of <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.college}</span>,{' '}
          </>
        )}
        you are currently at{' '}
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Level {currentLevel} of {totalLevels}
        </span>{' '}
        with a strong focus on practical learning and skill development.
        {student.interests && student.interests.length > 0 && (
          <> Your areas of interest include{' '}
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {student.interests.slice(0, 3).join(', ')}
            </span>
            {student.interests.length > 3 && ' and more'}.
          </>
        )}
      </>
    );
  };

  // Generate dynamic status badge based on student activity and progress
  const getDynamicStatusBadge = (student: any) => {
    const now = new Date();
    const lastActive = student.lastActive ? new Date(student.lastActive) : null;
    const daysSinceActive = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const completionPercentage = calculateCompletionPercentage();

    let status, color, bgColor, borderColor, shouldAnimate;

    if (daysSinceActive <= 1 && completionPercentage >= 20) {
      status = 'Highly Active';
      color = 'var(--color-success)';
      bgColor = 'var(--color-success-bg)';
      borderColor = 'var(--color-success)';
      shouldAnimate = true;
    } else if (daysSinceActive <= 3) {
      status = 'Active Student';
      color = 'var(--color-success)';
      bgColor = 'var(--color-success-bg)';
      borderColor = 'var(--color-success)';
      shouldAnimate = true;
    } else if (daysSinceActive <= 7) {
      status = 'Recently Active';
      color = 'var(--color-warning)';
      bgColor = 'var(--color-warning-bg)';
      borderColor = 'var(--color-warning)';
      shouldAnimate = false;
    } else if (completionPercentage >= 50) {
      status = 'Progressing Well';
      color = 'var(--color-info)';
      bgColor = 'var(--color-info-bg)';
      borderColor = 'var(--color-info)';
      shouldAnimate = false;
    } else {
      status = 'Enrolled Student';
      color = 'var(--color-text-secondary)';
      bgColor = 'var(--color-secondary-bg)';
      borderColor = 'var(--color-border)';
      shouldAnimate = false;
    }

    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm" 
           style={{ 
             backgroundColor: bgColor, 
             color: color,
             border: `1px solid ${borderColor}`
           }}>
        <div className={`w-2 h-2 rounded-full ${shouldAnimate ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }}></div>
        {status}
      </div>
    );
  };

  // Toggle level expansion
  const toggleLevelExpansion = (index: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLevels(newExpanded);
  };

  // Calculate completed tasks for a level
  const calculateCompletedTasks = (level: any) => {
    let completed = 0;
    if (level.learn?.completed) completed++;
    if (level.test?.completed) completed++;
    if (level.exercise?.completed) completed++;
    return completed;
  };

  // Get tasks for a level with dynamic content
  const getTasksForLevel = (level: any) => {
    interface Task {
      title: string;
      brief: string;
      status: 'completed' | 'in-progress' | 'pending';
      type: 'learn' | 'test' | 'exercise';
    }

    const tasks: Task[] = [];
    
    // Learn section - use actual content
    if (level?.learn?.content && Array.isArray(level.learn.content)) {
      level.learn.content.forEach((item: any) => {
        if (item && typeof item === 'object') {
          tasks.push({
            title: item.title || 'Learning Module',
            brief: item.description || (typeof item.content === 'string' ? item.content.substring(0, 100) + '...' : 'Complete learning materials'),
            status: level.learn.completed ? 'completed' : level.learn.startTime ? 'in-progress' : 'pending',
            type: 'learn'
          });
        }
      });
    }
    
    // Test section - use actual content
    if (level?.test?.content && Array.isArray(level.test.content)) {
      level.test.content.forEach((item: any) => {
        if (item && typeof item === 'object') {
          tasks.push({
            title: item.title || 'Assessment',
            brief: item.question || 'Complete the assessment',
            status: level.test.completed ? 'completed' : level.test.attempts > 0 ? 'in-progress' : 'pending',
            type: 'test'
          });
        }
      });
    }
    
    // Exercise section - use actual content
    if (level?.exercise?.content && Array.isArray(level.exercise.content)) {
      level.exercise.content.forEach((item: any) => {
        if (item && typeof item === 'object') {
          tasks.push({
            title: item.title || 'Exercise',
            brief: item.description || 'Complete the practical exercise',
            status: level.exercise.completed ? 'completed' : level.exercise.startTime ? 'in-progress' : 'pending',
            type: 'exercise'
          });
        }
      });
    }
    
    // If no content is available, add default tasks
    if (tasks.length === 0) {
      const levelName = level.courseName || `Level ${level.level}`;
      
      tasks.push({
        title: `${levelName} - Learning Module`,
        brief: 'Complete learning materials, theory, and concepts for this level',
        status: level.learn?.completed ? 'completed' : level.learn?.startTime ? 'in-progress' : 'pending',
        type: 'learn'
      });
      
      tasks.push({
        title: `${levelName} - Assessment`,
        brief: 'Complete assessment and evaluation for this level',
        status: level.test?.completed ? 'completed' : level.test?.attempts > 0 ? 'in-progress' : 'pending',
        type: 'test'
      });
      
      tasks.push({
        title: `${levelName} - Practical Exercise`,
        brief: 'Complete hands-on exercises and practical applications',
        status: level.exercise?.completed ? 'completed' : level.exercise?.startTime ? 'in-progress' : 'pending',
        type: 'exercise'
      });
    }
    
    return tasks;
  };

  // Process learning timeline to show all levels with proper status
  const processLearningTimeline = (timeline: any[] | undefined) => {
    if (!timeline || !Array.isArray(timeline)) {
      timeline = [];
    }

    const totalLevels = student?.summaryStats?.totalLevels || 10;
    const currentLevel = student?.summaryStats?.currentLevel || 1;
    
    // If we have complete backend data, use it directly
    if (timeline.length > 0 && timeline.length >= totalLevels) {
      // Backend data is complete, just ensure proper ordering
      // Create a copy to avoid modifying the original array
      return [...timeline].sort((a, b) => a.level - b.level);
    }
    
    // Group existing timeline data by level
    const levelDataMap = new Map();
    
    if (timeline && timeline.length > 0) {
      timeline.forEach((entry: any) => {
        const levelKey = entry.level;
        
        if (!levelDataMap.has(levelKey)) {
          levelDataMap.set(levelKey, {
            courseName: entry.courseName,
            learnContentName: entry.learnContentName,
            learnDescription: entry.learnDescription,
            testContentName: entry.testContentName,
            testDescription: entry.testDescription,
            exerciseContentName: entry.exerciseContentName,
            exerciseDescription: entry.exerciseDescription,
            learn: entry.learn || { completed: false, startTime: null, endTime: null },
            test: entry.test || { completed: false, score: 0, attempts: 0, startTime: null, endTime: null },
            exercise: entry.exercise || { completed: false, startTime: null, endTime: null }
          });
        } else {
          // Merge data from duplicate entry
          const existing = levelDataMap.get(levelKey);
          
          // Preserve content names and descriptions
          if (entry.courseName && !existing.courseName) existing.courseName = entry.courseName;
          if (entry.learnContentName && !existing.learnContentName) existing.learnContentName = entry.learnContentName;
          if (entry.learnDescription && !existing.learnDescription) existing.learnDescription = entry.learnDescription;
          if (entry.testContentName && !existing.testContentName) existing.testContentName = entry.testContentName;
          if (entry.testDescription && !existing.testDescription) existing.testDescription = entry.testDescription;
          if (entry.exerciseContentName && !existing.exerciseContentName) existing.exerciseContentName = entry.exerciseContentName;
          if (entry.exerciseDescription && !existing.exerciseDescription) existing.exerciseDescription = entry.exerciseDescription;
          
          // Merge learn data (take the completed one if available)
          if (entry.learn && (entry.learn.completed || !existing.learn.completed)) {
            existing.learn = { ...existing.learn, ...entry.learn };
          }
          
          // Merge test data (take the one with better score or more recent)
          if (entry.test && (entry.test.completed || entry.test.score > existing.test.score)) {
            existing.test = { ...existing.test, ...entry.test };
          }
          
          // Merge exercise data (take the completed one if available)
          if (entry.exercise && (entry.exercise.completed || !existing.exercise.completed)) {
            existing.exercise = { ...existing.exercise, ...entry.exercise };
          }
        }
      });
    }
    
    // Create all levels from 1 to totalLevels
    const allLevels = [];
    for (let i = 1; i <= totalLevels; i++) {
      const backendLevel = i - 1; // Backend uses 0-based indexing
      const levelData = levelDataMap.get(backendLevel) || {
        courseName: `Level ${i}`,
        learnContentName: `Level ${i} - Learning Module`,
        learnDescription: `Complete learning materials and theory for Level ${i}`,
        testContentName: `Level ${i} - Assessment`,
        testDescription: `Complete assessment and evaluation for Level ${i}`,
        exerciseContentName: `Level ${i} - Practical Exercise`,
        exerciseDescription: `Complete hands-on exercises for Level ${i}`,
        learn: { completed: false, startTime: null, endTime: null },
        test: { completed: false, score: 0, attempts: 0, startTime: null, endTime: null },
        exercise: { completed: false, startTime: null, endTime: null }
      };
      
      const learnCompleted = levelData.learn?.completed || false;
      const testCompleted = levelData.test?.completed || false;
      const exerciseCompleted = levelData.exercise?.completed || false;
      
      // Determine status based on current level and completion
      let status = 'not-started';
      if (i < currentLevel || (learnCompleted && testCompleted && exerciseCompleted)) {
        status = 'completed';
      } else if (i === currentLevel || learnCompleted || testCompleted || exerciseCompleted) {
        status = 'in-progress';
      }
      
      allLevels.push({
        level: i, // Display level (1, 2, 3, etc.)
        originalLevel: backendLevel, // Backend level (0, 1, 2, etc.)
        courseName: levelData.courseName,
        learnContentName: levelData.learnContentName,
        learnDescription: levelData.learnDescription,
        testContentName: levelData.testContentName,
        testDescription: levelData.testDescription,
        exerciseContentName: levelData.exerciseContentName,
        exerciseDescription: levelData.exerciseDescription,
        status: status,
        learn: levelData.learn,
        test: levelData.test,
        exercise: levelData.exercise
      });
    }
    
    return allLevels;
  };

  // Share portfolio
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Portfolio - Syncner',
        text: 'Check out my learning portfolio and progress!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Portfolio link copied to clipboard!');
      }).catch(() => {
        alert('Unable to share. Please copy the URL manually.');
      });
    }
  };

  // Download portfolio as text file
  const handleDownload = () => {
    const portfolioText = `My Portfolio - Syncner

Name: ${student.name}
Career Track: ${student.careerTrack}
Batch: ${student.batch || 'N/A'}
Department: ${student.department || 'N/A'}
College: ${student.college || 'N/A'}
Enrolled: ${student.enrolledDate}

Progress Summary:
- Current Level: ${student.summaryStats?.currentLevel || 1}
- Total Levels: ${student.summaryStats?.totalLevels || 10}
- Completion Rate: ${calculateCompletionPercentage()}%
- Completed Levels: ${student.summaryStats?.completedLevels || 0}

Learning Journey:
${student.learningTimeline?.map((level: any) => `
Level ${level.level} - ${level.status}
- Learn: ${level.learn?.completed ? 'Completed' : 'Pending'}
- Test: ${level.test?.completed ? 'Completed' : 'Pending'} ${level.test?.score ? `(Score: ${level.test.score}%)` : ''}
- Exercise: ${level.exercise?.completed ? 'Completed' : 'Pending'}
`).join('') || 'No learning data available'}

Generated on: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([portfolioText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My_Portfolio_Syncner.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Header */}
      {/* Daily Activity */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
          <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Learning Activity</h3>
        </div>
        <div className="p-6 rounded-xl" style={{ 
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}>
          <DailyActivityChart dailyActivity={portfolioData.dailyActivity} />
        </div>
      </div>

      {/* Certificate ID */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                My Portfolio
              </h1>
              <p className="text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                Your learning journey and achievements
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-accent-primary)',
                color: 'white'
              }}
            >
              <Share1Icon className="w-5 h-5" />
              Share Portfolio
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-success)',
                color: 'white'
              }}
            >
              <DownloadIcon className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Profile Section */}
          <ThemeContainer variant="secondary" className="p-8">
            <div className="flex items-start gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl"
                    style={{ 
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'white',
                      background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))'
                    }}
                  >
                    {student.name?.charAt(0) || 'S'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                       style={{ backgroundColor: 'var(--color-success)' }}>
                    <CheckCircledIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {student.name}
                  </h2>
                  <p className="text-xl mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {student.careerTrack} Specialist
                  </p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg" 
                         style={{ 
                           backgroundColor: 'var(--color-info-bg)', 
                           color: 'var(--color-info)',
                           border: '1px solid var(--color-border)'
                         }}>
                      <PersonIcon className="w-4 h-4" />
                      ID: {student._id?.slice(-8) || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg" 
                         style={{ 
                           backgroundColor: 'var(--color-warning-bg)', 
                           color: 'var(--color-warning)',
                           border: '1px solid var(--color-border)'
                         }}>
                      <CalendarIcon className="w-4 h-4" />
                      Batch {student.batch || 'N/A'}
                    </div>
                    {getDynamicStatusBadge(student)}
                  </div>
                </div>
              </div>
            </div>
          </ThemeContainer>

          {/* Introduction */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Introduction</h3>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <div className="p-6 rounded-xl" style={{ 
              backgroundColor: 'var(--color-secondary-bg)',
              border: '1px solid var(--color-border)'
            }}>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>You</span> are {generateDynamicIntroduction(student)}
              </p>
            </div>
          </div>

          {/* Recommended Roles */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Recommended Roles</h3>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getRecommendedRoles().map((role, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl text-center group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    border: '2px solid var(--color-border)',
                    background: 'linear-gradient(135deg, var(--color-secondary-bg) 0%, var(--color-primary-bg) 100%)'
                  }}
                >
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                       style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                    <RocketIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {role}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate ID */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Certificate ID</h3>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <div className="p-8 rounded-2xl relative overflow-hidden" style={{ 
              backgroundColor: 'var(--color-secondary-bg)',
              border: '2px solid var(--color-accent-primary)',
              background: 'linear-gradient(135deg, var(--color-secondary-bg) 0%, var(--color-accent-tertiary) 100%)'
            }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ 
                background: 'radial-gradient(circle, var(--color-accent-primary) 0%, transparent 70%)'
              }}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))'
                  }}>
                    <IdCardIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Certificate ID
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Unique identification for your achievements
                    </p>
                  </div>
                </div>
                <div className="bg-black/5 rounded-xl p-4 font-mono text-lg font-bold tracking-wider border-2 border-dashed"
                     style={{ 
                       borderColor: 'var(--color-accent-primary)',
                       color: 'var(--color-text-primary)'
                     }}>
                  SYN-{student._id || 'LOADING'}-{student.enrolledDate ? 
                    new Date(student.enrolledDate).getFullYear() : 
                    new Date().getFullYear()
                  }
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    Issued: {student.enrolledDate ? 
                      new Date(student.enrolledDate).toLocaleDateString('en-GB', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Journey */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Learning Journey</h3>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl text-center" style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                border: '1px solid var(--color-border)'
              }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
                  {student.summaryStats?.completedLevels ?? 
                   (student.learningTimeline ? student.learningTimeline.filter((l: any) => l.status === 'completed').length : 0)}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Levels Completed</div>
                {!student.summaryStats && (
                  <div className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>No progress data</div>
                )}
              </div>
              <div className="p-6 rounded-xl text-center" style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                border: '1px solid var(--color-border)'
              }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
                  {student.summaryStats?.currentLevel || 1}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Current Level</div>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                border: '1px solid var(--color-border)'
              }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-info)' }}>
                  {student.summaryStats?.totalLevels || 10}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Levels</div>
                {(student.summaryStats?.totalLevels || 10) === 10 && (
                  <div className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>Default value</div>
                )}
              </div>
              <div className="p-6 rounded-xl text-center" style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                border: '1px solid var(--color-border)'
              }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                  {calculateCompletionPercentage()}%
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Completion Rate</div>
              </div>
            </div>

            {/* Learning Timeline */}
            <div className="space-y-4">
              {(() => {
                const processedTimeline = processLearningTimeline(student.learningTimeline);
                if (!processedTimeline || processedTimeline.length === 0) {
                  return (
                    <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
                      <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No learning data available yet.</p>
                      <p className="text-sm mt-2">Start your learning journey to see your progress here!</p>
                    </div>
                  );
                }
                
                return processedTimeline.map((level: any, index: number) => {
                  const tasks = getTasksForLevel(level);
                  const completedTasks = calculateCompletedTasks(level);
                  const isExpanded = expandedLevels.has(index);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl overflow-hidden shadow-lg"
                      style={{ 
                        backgroundColor: 'var(--color-secondary-bg)',
                        border: level.status === 'completed' ? '2px solid var(--color-success)' : 
                               level.status === 'in-progress' ? '2px solid var(--color-warning)' : 
                               '1px solid var(--color-border)'
                      }}
                    >
                      {/* Level Header */}
                      <div 
                        className="p-6 cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                        onClick={() => toggleLevelExpansion(index)}
                        style={{ 
                          backgroundColor: level.status === 'completed' ? 'var(--color-success-bg)' : 
                                         level.status === 'in-progress' ? 'var(--color-warning-bg)' : 
                                         'var(--color-secondary-bg)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
                                style={{ 
                                  backgroundColor: level.status === 'completed' ? 'var(--color-success)' : 
                                                 level.status === 'in-progress' ? 'var(--color-warning)' : 
                                                 'var(--color-text-secondary)',
                                  color: 'white'
                                }}
                              >
                                {level.level}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                  {level.courseName}
                                </h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    {level.status === 'completed' && <CheckCircledIcon className="w-5 h-5" style={{ color: 'var(--color-success)' }} />}
                                    {level.status === 'in-progress' && <ClockIcon className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />}
                                    <span className="text-sm font-medium capitalize" style={{ 
                                      color: level.status === 'completed' ? 'var(--color-success)' : 
                                             level.status === 'in-progress' ? 'var(--color-warning)' : 
                                             'var(--color-text-secondary)'
                                    }}>
                                      {level.status}
                                    </span>
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {completedTasks}/{tasks.length} tasks completed
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {level.test?.score && (
                              <div className="text-right">
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Assessment Score</div>
                                <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                  {level.test.score}%
                                </div>
                              </div>
                            )}
                            <div className="transform transition-transform duration-200" style={{ 
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}>
                              <ChevronRightIcon className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Content */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="border-t" style={{ borderColor: 'var(--color-border)' }}
                        >
                          <div className="p-6 space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
                                <span style={{ color: 'var(--color-text-primary)' }}>
                                  {Math.round((completedTasks / tasks.length) * 100)}%
                                </span>
                              </div>
                              <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                  className="h-full rounded-full"
                                  style={{ 
                                    backgroundColor: level.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)',
                                    background: `linear-gradient(90deg, ${level.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'}, ${level.status === 'completed' ? 'var(--color-success)' : 'var(--color-accent-primary)'})`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-3">
                              <h5 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                                Tasks & Activities
                              </h5>
                              <div className="grid grid-cols-1 gap-3">
                                {tasks.map((task, taskIndex) => (
                                  <div
                                    key={taskIndex}
                                    className="flex items-center gap-4 p-4 rounded-lg"
                                    style={{ 
                                      backgroundColor: task.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-primary-bg)',
                                      border: `1px solid ${task.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)'}`
                                    }}
                                  >
                                    <div className="flex-shrink-0">
                                      {task.status === 'completed' ? (
                                        <CheckCircledIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: 'var(--color-border)' }} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h6 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                          {task.title}
                                        </h6>
                                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ 
                                          backgroundColor: task.type === 'learn' ? 'var(--color-info-bg)' : 
                                                         task.type === 'test' ? 'var(--color-warning-bg)' : 'var(--color-accent-tertiary)',
                                          color: task.type === 'learn' ? 'var(--color-info)' : 
                                                task.type === 'test' ? 'var(--color-warning)' : 'var(--color-accent-primary)'
                                        }}>
                                          {task.type.toUpperCase()}
                                        </span>
                                      </div>
                                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        {task.brief}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Summary */}
                              <div className="mt-4 p-3 rounded-lg" style={{ 
                                backgroundColor: 'var(--color-secondary-bg)',
                                border: '1px solid var(--color-border)'
                              }}>
                                <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                  Complete current tasks to unlock more content
                                </p>
                              </div>
                            </div>

                            {/* Level Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Completion Date</div>
                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                  {level.learn?.endTime || level.test?.endTime || level.exercise?.endTime ? 
                                    new Date(level.learn?.endTime || level.test?.endTime || level.exercise?.endTime).toLocaleDateString('en-GB') : 
                                    'In Progress'
                                  }
                                </div>
                              </div>
                              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Assessment Score</div>
                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                  {level.test?.score ? `${level.test.score}%` : 'Not taken'}
                                </div>
                              </div>
                              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Time Spent</div>
                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                  {level.learn?.startTime && level.learn?.endTime ? 
                                    Math.ceil((new Date(level.learn.endTime).getTime() - new Date(level.learn.startTime).getTime()) / (1000 * 60 * 60 * 24)) + ' days' : 
                                    'Ongoing'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPortfolio;
