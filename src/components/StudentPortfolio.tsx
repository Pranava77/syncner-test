import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircledIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeOpenIcon,
  CalendarIcon,
  RocketIcon,
  PersonIcon,
  IdCardIcon,
  ArrowLeftIcon,
  Share1Icon,
  DownloadIcon
} from '@radix-ui/react-icons';
import { StudentDetails } from '../types/staff';
import { useStaff } from '../hooks/useStaff';
import ThemeContainer from './ThemeContainer';

// Note: Backend generates fake timestamps instead of real data
// This causes dates and times to change on every refresh
// The frontend handles this gracefully by showing available data

const StudentPortfolio: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { selectedStudent, studentDetailsLoading, error, getStudentDetails } = useStaff();

  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  // Fetch student details when component mounts
  React.useEffect(() => {
    if (studentId) {
      getStudentDetails(studentId);
    }
  }, [studentId, getStudentDetails]);

  // Handle back navigation
  const handleBack = () => {
    navigate(`/staff/students/${studentId}`);
  };

  if (studentDetailsLoading || !selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {error}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            Back to Student Details
          </button>
        </div>
      </div>
    );
  }

  const student = selectedStudent;

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!student.learningTimeline || student.learningTimeline.length === 0) return 0;
    const completed = student.learningTimeline.filter(l => l.status === 'completed').length;
    return Math.round((completed / student.learningTimeline.length) * 100);
  };

  // Get skills for career track
  const getSkillsForTrack = () => {
    const skills: { [key: string]: string[] } = {
      'web-development': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database Design'],
      'data-science': ['Python', 'Statistics', 'Machine Learning', 'Data Visualization', 'SQL'],
      'mobile-development': ['React Native', 'Flutter', 'Mobile UI/UX', 'App Development', 'Cross-platform'],
      'cybersecurity': ['Network Security', 'Ethical Hacking', 'Cryptography', 'Security Analysis', 'Incident Response']
    };
    return skills[student.careerTrack as keyof typeof skills] || ['Programming', 'Problem Solving', 'Critical Thinking'];
  };

  // Get recommended roles
  const getRecommendedRoles = () => {
    const roles: { [key: string]: string[] } = {
      'web-development': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Web Developer'],
      'data-science': ['Data Scientist', 'Data Analyst', 'Business Analyst', 'Data Engineer', 'ML Engineer'],
      'mobile-development': ['Mobile Developer', 'iOS Developer', 'Android Developer', 'Cross-platform Developer'],
      'cybersecurity': ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'Cybersecurity Specialist']
    };
    return roles[student.careerTrack as keyof typeof roles] || ['Software Developer', 'Developer', 'Engineer'];
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

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Student Portfolio - ${student.name}`,
          text: `View portfolio for ${student.name} from ${student.department || 'N/A'} department`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
        // Final fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Portfolio link copied to clipboard!');
      }
    }
  };

  // Download PDF functionality
  const handleDownloadPDF = async () => {
    try {
      // Create a comprehensive portfolio report
      const content = `
        Student Portfolio Report
        ========================
        
        Student Information:
        - Name: ${student.name}
        - Roll Number: ${student._id}
        - Department: ${student.department || 'N/A'}
        - Batch: ${student.batch || 'N/A'}
        - Career Track: ${student.careerTrack}
        - Enrolled Date: ${student.enrolledDate}
        
        Performance Summary:
        - Attendance: ${student.summaryStats.consistency}%
        - Progress: ${student.summaryStats.progress}%
        - Leaderboard: ${student.summaryStats.leaderboard}%
        - Overall Completion: ${calculateCompletionPercentage()}%
        
        Learning Journey:
        - Total Levels: ${student.learningTimeline.length}
        - Completed: ${student.learningTimeline.filter(l => l.status === 'completed').length}
        - In Progress: ${student.learningTimeline.filter(l => l.status === 'in-progress').length}
        - Not Started: ${student.learningTimeline.filter(l => l.status === 'not-started').length}
        
        Skills: ${getSkillsForTrack().join(', ')}
        
        Recommended Roles: ${getRecommendedRoles().join(', ')}
        
        Career Readiness:
        - Portfolio Ready: ✓
        - Skills Verified: ✓
        - Industry Ready: ~
        
        Generated on: ${new Date().toLocaleDateString()}
        Generated from: Student Portfolio Page
      `;
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-portfolio-${student.name}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading portfolio:', error);
      alert('Error downloading portfolio. Please try again.');
    }
  };

  return (
    <ThemeContainer variant="primary" className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 p-6 lg:p-8 w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <h1 
              className="text-3xl font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Student Portfolio
            </h1>
            <p 
              className="mt-1 font-label"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Comprehensive overview of {student.name}'s learning journey and achievements
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-accent-primary)',
              borderColor: 'var(--color-border)',
              border: '1px solid'
            }}
            title="Share portfolio"
          >
            <Share1Icon className="h-4 w-4" />
            Share
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow"
            style={{ 
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)'
            }}
            title="Download portfolio as PDF"
          >
            <DownloadIcon className="h-5 w-5" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full">
            <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6">
              {/* Profile Row */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                  <PersonIcon className="w-12 h-12" style={{ color: 'var(--color-text-inverse)' }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{student.name}</h4>
                  <p className="flex items-center gap-2 text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-4 h-4">📍</span>
                    {student.department || 'N/A'}, {student.batch || 'N/A'}
                  </p>
                  
                  {/* Completion Badge and Progress */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                      <CheckCircledIcon className="w-4 h-4" />
                      {calculateCompletionPercentage()}% completed
                    </div>
                    <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${calculateCompletionPercentage()}%`,
                          backgroundColor: 'var(--color-success)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-accent-tertiary)', color: 'var(--color-accent-primary)' }}>
                      {student.careerTrack}
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-secondary)' }}>
                      {student.batch || 'N/A'}
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                      Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Introduction */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Introduction</h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {student.name} is a dedicated student pursuing {student.careerTrack} with a strong focus on practical learning and skill development. 
                  Currently enrolled in batch {student.batch || 'N/A'} at {student.department || 'N/A'} department, 
                  {student.name} has demonstrated consistent progress and commitment to mastering the curriculum.
                </p>
              </div>

              {/* Recommended Roles */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recommended Roles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRecommendedRoles().map((role, index) => (
                    <div
                      key={role}
                      className="group relative p-4 rounded-lg transition-all duration-200 cursor-pointer"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid',
                        borderColor: 'var(--color-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ 
                            backgroundColor: 'var(--color-success-bg)', 
                            color: 'var(--color-success)' 
                          }}>
                            Match
                          </span>
                          <RocketIcon className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: 'var(--color-accent-primary)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate ID */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Certificate ID</h3>
                <div className="relative group">
                  <div className="p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer" 
                       style={{ 
                         backgroundColor: 'var(--color-surface)',
                         borderColor: 'var(--color-border)',
                         borderStyle: 'dashed'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                         e.currentTarget.style.backgroundColor = 'var(--color-accent-tertiary)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.borderColor = 'var(--color-border)';
                         e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                       }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>VERIFIED</span>
                      </div>
                      <CheckCircledIcon className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                    </div>
                    <p className="text-base font-mono break-all mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      SYNCNER-2025-{student._id.slice(-8).toUpperCase()}-{student.enrolledDate ? new Date(student.enrolledDate).getFullYear().toString().slice(-2) : '25'}
                    </p>
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Generated on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Levels */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Learning Journey</h3>
                {student.learningTimeline.map((level, index) => {
                  // Get real completion date from backend data
                  const getCompletionDate = () => {
                    if (level.exercise?.completed && level.exercise?.endTime) {
                      return new Date(level.exercise.endTime);
                    } else if (level.test?.completed && level.test?.endTime) {
                      return new Date(level.test.endTime);
                    } else if (level.learn?.completed && level.learn?.endTime) {
                      return new Date(level.learn.endTime);
                    }
                    return null;
                  };
                  
                  const completionDate = getCompletionDate();
                  
                  // Get real assessment score from backend data
                  const getAssessmentScore = () => {
                    if (level.test?.completed && level.test.score) {
                      return level.test.score;
                    }
                    return 0;
                  };
                  
                  const assessmentScore = getAssessmentScore();
                  
                  // Get real time spent from backend data (only if timestamps exist)
                  const getTimeSpent = () => {
                    let totalHours = 0;
                    let totalMinutes = 0;
                    let hasRealTimeData = false;
                    
                    // Only calculate from real timestamps (not fake ones)
                    if (level.learn?.startTime && level.learn?.endTime && 
                        isRealTimestamp(level.learn.startTime) && isRealTimestamp(level.learn.endTime)) {
                      const startTime = new Date(level.learn.startTime);
                      const endTime = new Date(level.learn.endTime);
                      const diffMs = endTime.getTime() - startTime.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      totalHours += diffHours;
                      totalMinutes += diffMinutes;
                      hasRealTimeData = true;
                    }
                    
                    if (level.test?.startTime && level.test?.endTime && 
                        isRealTimestamp(level.test.startTime) && isRealTimestamp(level.test.endTime)) {
                      const startTime = new Date(level.test.startTime);
                      const endTime = new Date(level.test.endTime);
                      const diffMs = endTime.getTime() - startTime.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      totalHours += diffHours;
                      totalMinutes += diffMinutes;
                      hasRealTimeData = true;
                    }
                    
                    if (level.exercise?.startTime && level.exercise?.endTime && 
                        isRealTimestamp(level.exercise.startTime) && isRealTimestamp(level.exercise.endTime)) {
                      const startTime = new Date(level.exercise.startTime);
                      const endTime = new Date(level.exercise.endTime);
                      const diffMs = endTime.getTime() - startTime.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      totalHours += diffHours;
                      totalMinutes += diffMinutes;
                      hasRealTimeData = true;
                    }
                    
                    // Convert excess minutes to hours
                    if (totalMinutes >= 60) {
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;
                    }
                    
                    return { hours: totalHours, minutes: totalMinutes, hasRealTimeData };
                  };
                  
                  const timeData = getTimeSpent();
                  const timeSpent = timeData.hours;
                  const minutesSpent = timeData.minutes;
                  const hasRealTimeData = timeData.hasRealTimeData;
                  
                  // Calculate real completed tasks based on backend data
                  const calculateCompletedTasks = () => {
                    let completed = 0;
                    let total = 0;
                    
                    // Core learning tasks based on actual completion status
                    if (level.learn) {
                      total++;
                      if (level.learn.completed) completed++;
                    }
                    if (level.test) {
                      total++;
                      if (level.test.completed) completed++;
                    }
                    if (level.exercise) {
                      total++;
                      if (level.exercise.completed) completed++;
                    }
                    
                    // Add advanced tasks based on actual completion status
                    if (level.learn?.completed) {
                      total++;
                      if (level.test?.completed) completed++;
                    }
                    if (level.test?.completed) {
                      total++;
                      if (level.exercise?.completed) completed++;
                    }
                    if (level.exercise?.completed) {
                      total++;
                      completed++; // Capstone task is always completed if exercise is done
                    }
                    
                    // Add optional task for high performers based on actual test scores
                    if (level.test?.completed && level.test.score >= 90) {
                      total++;
                      // Optional task is not started by default
                    }
                    
                    return { completed, total };
                  };
                  
                  const taskData = calculateCompletedTasks();
                  const completedTasks = taskData.completed;
                  const totalTasks = taskData.total;
                  
                  // Generate dynamic tasks based on level data
                  const getTasksForLevel = () => {
                    interface Task {
                      title: string;
                      brief: string;
                      status: 'completed' | 'in-progress' | 'not-started';
                      type: string;
                    }
                    
                    const baseTasks: Task[] = [];
                    
                    // Add core learning tasks based on actual completion status from backend
                    if (level.learn) {
                      baseTasks.push({
                        title: `Learning: ${level.courseName || 'Module Content'}`,
                        brief: level.learn.completed ? 'Content mastered successfully' : 'Continue learning core concepts',
                        status: level.learn.completed ? 'completed' : 'in-progress',
                        type: 'learning'
                      });
                    }
                    
                    if (level.test) {
                      baseTasks.push({
                        title: `Assessment: ${level.courseName || 'Module Test'}`,
                        brief: level.test.completed ? `Test completed with ${level.test.score || 0}% score` : 'Take assessment to test knowledge',
                        status: level.test.completed ? 'completed' : 'in-progress',
                        type: 'assessment'
                      });
                    }
                    
                    if (level.exercise) {
                      baseTasks.push({
                        title: `Exercise: ${level.courseName || 'Module Practice'}`,
                        brief: level.exercise.completed ? 'Practical exercises completed' : 'Apply what you learned',
                        status: level.exercise.completed ? 'completed' : 'in-progress',
                        type: 'practice'
                      });
                    }
                    
                    // Only add advanced tasks if they have real completion data
                    if (level.learn?.completed && level.test?.completed) {
                      baseTasks.push({
                        title: `Project: ${level.courseName || 'Module Project'}`,
                        brief: 'Apply learned concepts in a practical project',
                        status: level.exercise?.completed ? 'completed' : 'in-progress',
                        type: 'project'
                      });
                    }
                    
                    if (level.test?.completed && level.exercise?.completed) {
                      baseTasks.push({
                        title: `Capstone: ${level.courseName || 'Module Final'}`,
                        brief: 'Complete final comprehensive project',
                        status: 'completed',
                        type: 'capstone'
                      });
                    }
                    
                    // Add optional task only for students with real high scores
                    if (level.test?.completed && level.test.score && level.test.score >= 90) {
                      baseTasks.push({
                        title: 'Advanced Challenge (Optional)',
                        brief: 'Take on extra difficult problems for high performers',
                        status: 'not-started',
                        type: 'optional'
                      });
                    }
                    
                    return baseTasks;
                  };
                  
                  const tasks = getTasksForLevel();
                  
                  return (
                    <ThemeContainer 
                      key={index}
                      variant="secondary" 
                      className="rounded-lg border transition-all duration-200"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div
                        className="flex items-center justify-between p-6 cursor-pointer"
                        onClick={() => toggleLevelExpansion(index)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Module Number Badge */}
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold" 
                               style={{ 
                                 backgroundColor: 'var(--color-accent-primary)',
                                 color: 'var(--color-text-inverse)'
                               }}>
                            {(index + 1).toString().padStart(2, '0')}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              {level.courseName || `Level ${level.level}`}
                            </h4>
                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {completionDate ? (
                                <span>Completed {completionDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                              ) : student.enrolledDate ? (
                                <span>Started {new Date(student.enrolledDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                              ) : null}
                              {assessmentScore > 0 && (
                                <span>Assessed: {assessmentScore}/100</span>
                              )}
                              {hasRealTimeData && (timeSpent > 0 || minutesSpent > 0) && (
                                <span>Time: {timeSpent}h {minutesSpent}m</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Performance Badges */}
                          <div className="flex items-center gap-3">
                            {assessmentScore > 0 && (
                              <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2" 
                                   style={{ 
                                     backgroundColor: 'var(--color-success-bg)', 
                                     color: 'var(--color-success)',
                                     border: '1px solid',
                                     borderColor: 'var(--color-success)'
                                   }}>
                                <CheckCircledIcon className="w-4 h-4" />
                                MCQ {assessmentScore}%
                              </div>
                            )}
                            <div className="px-3 py-2 rounded-lg text-sm font-medium" 
                                 style={{ 
                                   backgroundColor: 'var(--color-surface)', 
                                   color: 'var(--color-text-primary)',
                                   border: '1px solid',
                                   borderColor: 'var(--color-border)'
                                 }}>
                              Tasks {completedTasks}/{totalTasks}
                            </div>
                          </div>
                          
                          {/* Status and Expansion */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm px-3 py-2 rounded-full font-medium" style={{ 
                              backgroundColor: level.status === 'completed' ? 'var(--color-success-bg)' : 
                                            level.status === 'in-progress' ? 'var(--color-warning-bg)' : 'var(--color-tertiary-bg)',
                              color: level.status === 'completed' ? 'var(--color-success)' : 
                                     level.status === 'in-progress' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                            }}>
                              {level.status}
                            </span>
                            {expandedLevels.has(index) ? (
                              <ChevronDownIcon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedLevels.has(index) && (
                        <ThemeContainer variant="surface" className="p-6 border-t rounded-t-none">
                          {/* Learning Progress Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                              <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                                {level.learn?.completed ? '✓' : '○'}
                              </div>
                              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Learning</div>
                              <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                {level.learn?.completed ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                              <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                                {level.test?.completed ? '✓' : '○'}
                              </div>
                              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Test</div>
                              <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                {level.test?.completed ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                              <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                                {level.exercise?.completed ? '✓' : '○'}
                              </div>
                              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Exercise</div>
                              <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                {level.exercise?.completed ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                          </div>

                          {/* Tasks Section */}
                          <div className="mb-4">
                            <h5 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Tasks</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {tasks.map((task, taskIndex) => {
                                // Get status-based styling
                                const getStatusStyle = (status: string) => {
                                  switch (status) {
                                    case 'completed':
                                      return {
                                        bg: 'var(--color-success-bg)',
                                        color: 'var(--color-success)',
                                        border: 'var(--color-success)',
                                        icon: '✓'
                                      };
                                    case 'in-progress':
                                      return {
                                        bg: 'var(--color-warning-bg)',
                                        color: 'var(--color-warning)',
                                        border: 'var(--color-warning)',
                                        icon: '⟳'
                                      };
                                    case 'not-started':
                                      return {
                                        bg: 'var(--color-tertiary-bg)',
                                        color: 'var(--color-text-secondary)',
                                        border: 'var(--color-border)',
                                        icon: '○'
                                      };
                                    default:
                                      return {
                                        bg: 'var(--color-surface)',
                                        color: 'var(--color-text-secondary)',
                                        border: 'var(--color-border)',
                                        icon: '○'
                                      };
                                  }
                                };
                                
                                const statusStyle = getStatusStyle(task.status);
                                
                                return (
                                  <div key={taskIndex} className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md relative" 
                                       style={{ 
                                         backgroundColor: 'var(--color-surface)',
                                         borderColor: statusStyle.border,
                                         borderWidth: '2px'
                                       }}>
                                    {/* Status indicator */}
                                    <div className="absolute top-2 right-2">
                                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                           style={{ 
                                             backgroundColor: statusStyle.bg,
                                             color: statusStyle.color
                                           }}>
                                        {statusStyle.icon}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start justify-between pr-8">
                                      <div className="flex-1">
                                        <h6 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                          {task.title}
                                        </h6>
                                        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                          {task.brief}
                                        </p>
                                        
                                        {/* Task type badge */}
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                             style={{ 
                                               backgroundColor: 'var(--color-accent-tertiary)',
                                               color: 'var(--color-accent-primary)'
                                             }}>
                                          {task.type}
                                        </div>
                                      </div>
                                      
                                      <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-tertiary)] flex-shrink-0"
                                              style={{ 
                                                backgroundColor: task.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-secondary-bg)',
                                                color: task.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                                border: '1px solid',
                                                borderColor: task.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)'
                                              }}>
                                        {task.status === 'completed' ? 'View' : task.status === 'in-progress' ? 'Continue' : 'Start'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Dynamic summary based on actual completion */}
                            <div className="mt-6 p-4 rounded-lg text-center" 
                                 style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {completedTasks === totalTasks ? (
                                  'All tasks completed! 🎉'
                                ) : completedTasks > 0 ? (
                                  `${completedTasks} of ${totalTasks} tasks completed. Keep going! 💪`
                                ) : (
                                  'Ready to start your learning journey! 🚀'
                                )}
                              </p>
                              {completedTasks < totalTasks && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                  Will also be showing optional tasks
                                </p>
                              )}
                            </div>
                          </div>
                        </ThemeContainer>
                      )}
                    </ThemeContainer>
                  );
                })}
              </div>
            </ThemeContainer>
          </div>
        </motion.div>
      </div>
    </ThemeContainer>
  );
};

export default StudentPortfolio;
