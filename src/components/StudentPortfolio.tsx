import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import {
  CheckCircledIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
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
  const { studentId } = useParams<{ studentId: string }>();
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
    navigate('/staff/students');
  };

  if (studentDetailsLoading || !selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading student portfolio...
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
            Back to Students
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
      'data-science': ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Business Intelligence Analyst'],
      'mobile-development': ['Mobile App Developer', 'React Native Developer', 'Flutter Developer', 'iOS/Android Developer'],
      'cybersecurity': ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'Cyber Security Specialist']
    };
    return roles[student.careerTrack as keyof typeof roles] || ['Software Developer', 'Technical Specialist', 'IT Professional'];
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

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${student.name}'s Portfolio - Syncner`,
      text: `Check out ${student.name}'s learning portfolio and achievements at Syncner!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        alert('Unable to share portfolio. Please copy the URL manually.');
      }
    }
  };

  // Handle PDF download functionality
  const handleDownloadPDF = async () => {
    try {
      // Generate portfolio text content
      const portfolioText = `
MY PORTFOLIO - SYNCNER
======================

Student Information:
- Name: ${student.name}
- Career Track: ${student.careerTrack}
- Department: ${student.department || 'N/A'}
- Batch: ${student.batch || 'N/A'}
- Completion: ${calculateCompletionPercentage()}%

Introduction:
You are a dedicated student pursuing ${student.careerTrack} with a strong focus on practical learning and skill development. Currently enrolled in batch ${student.batch || 'N/A'} at ${student.department || 'N/A'} department, you have demonstrated consistent progress and commitment to mastering the curriculum.

Recommended Roles:
${getRecommendedRoles().map(role => `- ${role}`).join('\n')}

Certificate ID:
SYNCNER-2025-${student._id.slice(-8).toUpperCase()}-${student.enrolledDate ? new Date(student.enrolledDate).getFullYear().toString().slice(-2) : '25'}

Learning Journey:
${student.learningTimeline.map((level, index) => `
Level ${level.level}: ${level.courseName || `Level ${level.level}`}
- Status: ${level.status}
- Learning: ${level.learn?.completed ? 'Completed' : 'In Progress'}
- Test: ${level.test?.completed ? `Completed (Score: ${level.test.score || 0}%)` : 'In Progress'}
- Exercise: ${level.exercise?.completed ? 'Completed' : 'In Progress'}
`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
      `;

      // Create and download the file
      const blob = new Blob([portfolioText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
              a.download = `My_Portfolio_Syncner.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
              Comprehensive overview of your learning journey and achievements
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
            {/* Profile Section */}
            <ThemeContainer variant="surface" className="rounded-xl shadow-lg border-0 p-8 mb-8" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-secondary-bg) 100%)' }}>
              {/* Profile Row */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)'
                  }}>
                    <PersonIcon className="w-14 h-14 lg:w-16 lg:h-16" style={{ color: 'var(--color-text-inverse)' }} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md" 
                       style={{ backgroundColor: 'var(--color-success)', border: '3px solid var(--color-surface)' }}>
                    <CheckCircledIcon className="w-4 h-4" style={{ color: 'white' }} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-3 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                        <span className="font-medium">{student.department || 'N/A'}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-text-tertiary)' }}></div>
                      <span>{student.batch || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm" 
                           style={{ 
                             backgroundColor: 'var(--color-success-bg)', 
                             color: 'var(--color-success)',
                             border: '1px solid var(--color-success)'
                           }}>
                        <CheckCircledIcon className="w-5 h-5" />
                        {calculateCompletionPercentage()}% Complete
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                        {student.learningTimeline?.filter(l => l.status === 'completed').length || 0} of {student.learningTimeline?.length || 0} levels
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                          style={{ 
                            width: `${calculateCompletionPercentage()}%`,
                            background: 'linear-gradient(90deg, var(--color-success) 0%, var(--color-accent-primary) 100%)'
                          }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Status Pills */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:scale-105" 
                         style={{ 
                           backgroundColor: 'var(--color-accent-tertiary)', 
                           color: 'var(--color-accent-primary)',
                           border: '1px solid var(--color-accent-primary)'
                         }}>
                      <RocketIcon className="w-4 h-4" />
                      {student.careerTrack}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm" 
                         style={{ 
                           backgroundColor: 'var(--color-surface)', 
                           color: 'var(--color-text-secondary)',
                           border: '1px solid var(--color-border)'
                         }}>
                      <CalendarIcon className="w-4 h-4" />
                      Batch {student.batch || 'N/A'}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm" 
                         style={{ 
                           backgroundColor: 'var(--color-success-bg)', 
                           color: 'var(--color-success)',
                           border: '1px solid var(--color-success)'
                         }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></div>
                      Active Student
                    </div>
                  </div>
                </div>
              </div>

              {/* Introduction */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                  <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Introduction</h3>
                </div>
                <div className="p-6 rounded-xl" style={{ 
                  backgroundColor: 'var(--color-secondary-bg)',
                  border: '1px solid var(--color-border)'
                }}>
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>You</span> are a dedicated student pursuing{' '}
                    <span className="px-2 py-1 rounded-md font-medium" style={{ 
                      backgroundColor: 'var(--color-accent-tertiary)', 
                      color: 'var(--color-accent-primary)' 
                    }}>
                      {student.careerTrack}
                    </span>{' '}
                    with a strong focus on practical learning and skill development. Currently enrolled in batch{' '}
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.batch || 'N/A'}</span>{' '}
                    at {student.department || 'N/A'} department, you have demonstrated consistent progress and commitment to mastering the curriculum.
                  </p>
                </div>
              </div>

              {/* Recommended Roles */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                  <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Recommended Career Paths</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRecommendedRoles().map((role, index) => (
                    <div
                      key={role}
                      className="group relative p-5 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-secondary-bg) 100%)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                          <span className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>{role}</span>
                        </div>
                        <RocketIcon className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" 
                                   style={{ color: 'var(--color-accent-primary)' }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Perfect match for your skills
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs px-3 py-1 rounded-full font-medium shadow-sm" style={{ 
                            backgroundColor: 'var(--color-success-bg)', 
                            color: 'var(--color-success)',
                            border: '1px solid var(--color-success)'
                          }}>
                            ✓ {85 + (index * 3)}% Match
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate ID */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                  <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Digital Certificate</h3>
                </div>
                <div className="relative group">
                  <div className="p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg" 
                       style={{ 
                         backgroundColor: 'var(--color-surface)',
                         borderColor: 'var(--color-success)',
                         borderStyle: 'solid',
                         background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-success-bg) 100%)'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-4px)';
                         e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0px)';
                         e.currentTarget.style.boxShadow = 'none';
                       }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></div>
                          <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-success)', opacity: 0.4 }}></div>
                        </div>
                        <span className="text-lg font-bold tracking-wide" style={{ color: 'var(--color-success)' }}>VERIFIED CERTIFICATE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IdCardIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                        <CheckCircledIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Certificate ID</p>
                      <p className="text-xl font-mono font-bold tracking-wider break-all p-3 rounded-lg" 
                         style={{ 
                           color: 'var(--color-text-primary)',
                           backgroundColor: 'var(--color-secondary-bg)',
                           border: '1px solid var(--color-border)'
                         }}>
                        SYNCNER-2025-{student._id.slice(-8).toUpperCase()}-{student.enrolledDate ? new Date(student.enrolledDate).getFullYear().toString().slice(-2) : '25'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                          Issued: {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </ThemeContainer>

            {/* Learning Journey */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Learning Journey</h3>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
                <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ 
                  backgroundColor: 'var(--color-accent-tertiary)', 
                  color: 'var(--color-accent-primary)' 
                }}>
                  {student.learningTimeline?.length || 0} Levels
                </span>
              </div>
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
                  
                  // Calculate time from learn section if both timestamps exist
                  if (level.learn?.startTime && level.learn?.endTime && 
                      level.learn.startTime !== 'In Progress' && level.learn.endTime !== 'In Progress') {
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
                      level.test.startTime !== 'In Progress' && level.test.endTime !== 'Not Started') {
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
                      level.exercise.startTime !== 'In Progress' && level.exercise.endTime !== 'In Progress') {
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
                  
                  // Only count real tasks from backend data
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
                  
                  // Only show real tasks from backend data - no fake generated tasks
                  
                  return baseTasks;
                };
                
                const tasks = getTasksForLevel();
                
                return (
                  <ThemeContainer 
                    key={index}
                    variant="surface" 
                    className="rounded-xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden"
                    style={{ 
                      background: level.status === 'completed' 
                        ? 'linear-gradient(135deg, var(--color-success-bg) 0%, var(--color-surface) 100%)'
                        : level.status === 'in-progress'
                        ? 'linear-gradient(135deg, var(--color-warning-bg) 0%, var(--color-surface) 100%)'
                        : 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-secondary-bg) 100%)'
                    }}
                  >
                    <div
                      className="flex items-center justify-between p-6 cursor-pointer group hover:bg-opacity-80"
                      onClick={() => toggleLevelExpansion(index)}
                    >
                      <div className="flex items-center gap-6">
                        {/* Enhanced Module Number Badge */}
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110" 
                               style={{ 
                                 backgroundColor: 'var(--color-accent-primary)',
                                 background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
                                 color: 'var(--color-text-inverse)'
                               }}>
                            {(index + 1).toString().padStart(2, '0')}
                          </div>
                          {level.status === 'completed' && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md" 
                                 style={{ backgroundColor: 'var(--color-success)', border: '2px solid var(--color-surface)' }}>
                              <CheckCircledIcon className="w-3 h-3" style={{ color: 'white' }} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <h4 className="text-2xl font-bold tracking-tight group-hover:text-opacity-80 transition-all duration-200" 
                              style={{ color: 'var(--color-text-primary)' }}>
                            {level.courseName || `Level ${level.level}`}
                          </h4>
                          <div className="flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {completionDate ? (
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Completed {completionDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                              </div>
                            ) : student.enrolledDate ? (
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>Started {new Date(student.enrolledDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                              </div>
                            ) : null}
                            {assessmentScore > 0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircledIcon className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                                <span>Score: {assessmentScore}%</span>
                              </div>
                            )}
                            {hasRealTimeData && (timeSpent > 0 || minutesSpent > 0) && (
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>{timeSpent}h {minutesSpent}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Enhanced Performance Badges */}
                        <div className="flex items-center gap-3">
                          {assessmentScore > 0 && (
                            <div className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm" 
                                 style={{ 
                                   backgroundColor: 'var(--color-success-bg)', 
                                   color: 'var(--color-success)',
                                   border: '2px solid var(--color-success)'
                                 }}>
                              <CheckCircledIcon className="w-4 h-4" />
                              {assessmentScore}%
                            </div>
                          )}
                          <div className="px-4 py-2 rounded-xl text-sm font-semibold shadow-sm" 
                               style={{ 
                                 backgroundColor: 'var(--color-surface)', 
                                 color: 'var(--color-text-primary)',
                                 border: '2px solid var(--color-border)'
                               }}>
                            {completedTasks}/{totalTasks} Tasks
                          </div>
                        </div>
                        
                        {/* Enhanced Status and Expansion */}
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm" style={{ 
                            backgroundColor: level.status === 'completed' ? 'var(--color-success-bg)' : 
                                          level.status === 'in-progress' ? 'var(--color-warning-bg)' : 'var(--color-tertiary-bg)',
                            color: level.status === 'completed' ? 'var(--color-success)' : 
                                   level.status === 'in-progress' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                            border: '2px solid',
                            borderColor: level.status === 'completed' ? 'var(--color-success)' : 
                                        level.status === 'in-progress' ? 'var(--color-warning)' : 'var(--color-border)'
                          }}>
                            {level.status === 'completed' ? '✓ Complete' : 
                             level.status === 'in-progress' ? '⟳ In Progress' : '○ Pending'}
                          </div>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110" 
                               style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                            {expandedLevels.has(index) ? (
                              <ChevronDownIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                            )}
                          </div>
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
                                  
                                  <div className="flex items-start justify-between">
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
                                Complete current tasks to unlock more content
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
          </div>
        </motion.div>
      </div>
    </ThemeContainer>
  );
};

export default StudentPortfolio;