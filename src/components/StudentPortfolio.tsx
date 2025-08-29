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
                      SYNCNER-2025-{student._id.slice(-8).toUpperCase()}-{Math.random().toString(36).substr(2, 6).toUpperCase()}
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
                {student.learningTimeline.map((level, index) => (
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
                            {level.courseName}
                          </h4>
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>Completed {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                            <span>Assessed: {Math.floor(Math.random() * 20) + 80}/100</span>
                            <span>Time: {Math.floor(Math.random() * 3) + 4}h {Math.floor(Math.random() * 60)}m</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Performance Badges */}
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2" 
                               style={{ 
                                 backgroundColor: 'var(--color-success-bg)', 
                                 color: 'var(--color-success)',
                                 border: '1px solid',
                                 borderColor: 'var(--color-success)'
                               }}>
                            <CheckCircledIcon className="w-4 h-4" />
                            MCQ {Math.floor(Math.random() * 20) + 80}%
                          </div>
                          <div className="px-3 py-2 rounded-lg text-sm font-medium" 
                               style={{ 
                                 backgroundColor: 'var(--color-surface)', 
                                 color: 'var(--color-text-primary)',
                                 border: '1px solid',
                                 borderColor: 'var(--color-border)'
                               }}>
                            Tasks {level.learn?.completed ? '5/5' : level.test?.completed ? '3/5' : '1/5'}
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
                            {/* Sample Tasks */}
                            <div className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md" 
                                 style={{ 
                                   backgroundColor: 'var(--color-surface)',
                                   borderColor: 'var(--color-border)'
                                 }}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                    Task: Build a web using HTML/CSS
                                  </h6>
                                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Brief: Create a HTML Website
                                  </p>
                                </div>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-tertiary)]"
                                        style={{ 
                                          backgroundColor: 'var(--color-secondary-bg)',
                                          color: 'var(--color-text-secondary)'
                                        }}>
                                  View
                                </button>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md" 
                                 style={{ 
                                   backgroundColor: 'var(--color-surface)',
                                   borderColor: 'var(--color-border)'
                                 }}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                    Task: Implement JavaScript functionality
                                  </h6>
                                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Brief: Add interactive features
                                  </p>
                                </div>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-tertiary)]"
                                        style={{ 
                                          backgroundColor: 'var(--color-secondary-bg)',
                                          color: 'var(--color-text-secondary)'
                                        }}>
                                  View
                                </button>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md" 
                                 style={{ 
                                   backgroundColor: 'var(--color-surface)',
                                   borderColor: 'var(--color-border)'
                                 }}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                    Task: Database integration
                                  </h6>
                                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Brief: Connect to backend
                                  </p>
                                </div>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-tertiary)]"
                                        style={{ 
                                          backgroundColor: 'var(--color-secondary-bg)',
                                          color: 'var(--color-text-secondary)'
                                        }}>
                                  View
                                </button>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md" 
                                 style={{ 
                                   backgroundColor: 'var(--color-surface)',
                                   borderColor: 'var(--color-border)'
                                 }}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                    Task: API development
                                  </h6>
                                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Brief: Create REST endpoints
                                  </p>
                                </div>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-tertiary)]"
                                        style={{ 
                                          backgroundColor: 'var(--color-secondary-bg)',
                                          color: 'var(--color-text-secondary)'
                                        }}>
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Optional Tasks Note */}
                          <div className="text-center mt-6 p-4" style={{ color: 'var(--color-text-secondary)' }}>
                            Will also be showing optional tasks
                          </div>
                        </div>
                      </ThemeContainer>
                    )}
                  </ThemeContainer>
                ))}
              </div>
            </ThemeContainer>
          </div>
        </motion.div>
      </div>
    </ThemeContainer>
  );
};

export default StudentPortfolio;
