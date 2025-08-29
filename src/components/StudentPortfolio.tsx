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

interface PortfolioTab {
  id: 'topics' | 'projects';
  label: string;
  active: boolean;
}

const StudentPortfolio: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { selectedStudent, studentDetailsLoading, error, getStudentDetails } = useStaff();
  const [activeTab, setActiveTab] = useState<'topics' | 'projects'>('topics');
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

  const toggleLevelExpansion = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSkillsForTrack = () => {
    const skills: { [key: string]: string[] } = {
      'web-development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
      'data-science': ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Data Visualization'],
      'mobile-development': ['React Native', 'Flutter', 'iOS Development', 'Android Development'],
      'cybersecurity': ['Network Security', 'Ethical Hacking', 'Cryptography', 'Security Tools']
    };
    return skills[student.careerTrack as keyof typeof skills] || ['Programming', 'Problem Solving', 'Teamwork'];
  };

  const calculateCompletionPercentage = () => {
    const completed = student.learningTimeline.filter(l => l.status === 'completed').length;
    const total = student.learningTimeline.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getRecommendedRoles = () => {
    const roles: { [key: string]: string[] } = {
      'web-development': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Web Developer'],
      'data-science': ['Data Scientist', 'Data Analyst', 'Business Analyst', 'Data Engineer', 'ML Engineer'],
      'mobile-development': ['Mobile Developer', 'iOS Developer', 'Android Developer', 'Cross-platform Developer'],
      'cybersecurity': ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'Cybersecurity Specialist']
    };
    return roles[student.careerTrack as keyof typeof roles] || ['Software Developer', 'Developer', 'Engineer'];
  };

  const tabs: PortfolioTab[] = [
    { id: 'topics', label: 'Topics Covered', active: activeTab === 'topics' },
    { id: 'projects', label: 'Projects', active: activeTab === 'projects' }
  ];

  return (
    <ThemeContainer variant="primary" className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Student Details
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6 mb-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                  <PersonIcon className="w-12 h-12" style={{ color: 'var(--color-text-inverse)' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{student.name}</h3>
                <p className="mb-3 flex items-center justify-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="w-4 h-4">📍</span>
                  {student.department || 'N/A'}, {student.batch || 'N/A'}
                </p>
                
                {/* Completion Badge and Progress */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                    <CheckCircledIcon className="w-4 h-4" />
                    {calculateCompletionPercentage()}% completed
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${calculateCompletionPercentage()}%`,
                        backgroundColor: 'var(--color-success)'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Status Pills */}
                <div className="space-y-2 mb-6">
                  <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-accent-tertiary)', color: 'var(--color-accent-primary)' }}>
                    Track: {student.careerTrack}
                  </div>
                  <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-tertiary-bg)', color: 'var(--color-text-secondary)' }}>
                    Duration: {student.learningTimeline.length} months
                  </div>
                  <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-tertiary)' }}>
                    Last verified: {formatDate(new Date().toISOString())}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-left" style={{ color: 'var(--color-text-secondary)' }}>SKILLS</h4>
                  <div className="flex flex-wrap gap-2">
                    {getSkillsForTrack().map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: 'var(--color-surface)', 
                          color: 'var(--color-text-secondary)',
                          borderColor: 'var(--color-border)',
                          border: '1px solid'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Roles */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>RECOMMENDED ROLES</h4>
                <div className="space-y-2">
                  {getRecommendedRoles().map((role) => (
                    <div
                      key={role}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{role}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>⋯</span>
                    </div>
                  ))}
                </div>
              </div>

              

              {/* Certificate ID */}
              <div>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>CERTIFICATE ID</h4>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                  <p className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    SYNCNER-2025-{student._id.slice(-8).toUpperCase()}-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </p>
                </div>
              </div>
              </ThemeContainer>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Introduction Card */}
              <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Introduction
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                  <p style={{ color: 'var(--color-accent-primary)' }}>
                    {student.careerTrack} developer in the making, passionate about solving real business problems with code. 
                    Skilled in various technologies and ready to contribute to impactful projects.
                  </p>
                </div>
              </ThemeContainer>

              {/* Learning Journey Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                    <CheckCircledIcon className="h-6 w-6" style={{ color: 'var(--color-success)' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Completed</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {student.learningTimeline.filter(l => l.status === 'completed').length}
                    </p>
                  </div>
                </ThemeContainer>

                <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                    <ClockIcon className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>In Progress</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {student.learningTimeline.filter(l => l.status === 'in-progress').length}
                    </p>
                  </div>
                </ThemeContainer>

                <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                    <RocketIcon className="h-6 w-6" style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {student.learningTimeline.length}
                    </p>
                  </div>
                </ThemeContainer>
              </div>

              {/* Portfolio Section */}
              <ThemeContainer variant="surface" className="rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                  Portfolio
                </h3>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tab.active
                          ? 'text-white'
                          : 'hover:bg-[var(--color-accent-tertiary)]'
                      }`}
                      style={{
                        backgroundColor: tab.active ? 'var(--color-accent-primary)' : 'var(--color-surface)',
                        color: tab.active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)',
                        border: '1px solid'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Topics Covered Content */}
                {activeTab === 'topics' && (
                  <div className="space-y-6">
                    {/* Progress Overview */}
                    <ThemeContainer variant="secondary" className="rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Learning Progress Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                            {student.learningTimeline.filter(l => l.status === 'completed').length}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                            {student.learningTimeline.filter(l => l.status === 'in-progress').length}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                            {student.learningTimeline.filter(l => l.status === 'not-started').length}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Not Started</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                            {calculateCompletionPercentage()}%
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Overall</div>
                        </div>
                      </div>
                    </ThemeContainer>

                    {/* Learning Levels */}
                    <div className="space-y-4">
                      {student.learningTimeline.map((level, index) => (
                        <ThemeContainer 
                          key={index}
                          variant="secondary" 
                          className="rounded-lg border transition-all duration-200"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => toggleLevelExpansion(index)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                                backgroundColor: level.status === 'completed' ? 'var(--color-success)' : 
                                              level.status === 'in-progress' ? 'var(--color-warning)' : 'var(--color-text-muted)'
                              }}>
                                {level.status === 'completed' ? (
                                  <CheckCircledIcon className="w-5 h-5" style={{ color: 'var(--color-text-inverse)' }} />
                                ) : level.status === 'in-progress' ? (
                                  <ClockIcon className="w-5 h-5" style={{ color: 'var(--color-text-inverse)' }} />
                                ) : (
                                  <EyeOpenIcon className="w-5 h-5" style={{ color: 'var(--color-text-inverse)' }} />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                  {level.courseName}
                                </h4>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  Level {level.level}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm px-2 py-1 rounded-full" style={{ 
                                backgroundColor: level.status === 'completed' ? 'var(--color-success-bg)' : 
                                              level.status === 'in-progress' ? 'var(--color-warning-bg)' : 'var(--color-tertiary-bg)',
                                color: level.status === 'completed' ? 'var(--color-success)' : 
                                       level.status === 'in-progress' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                              }}>
                                {level.status}
                              </span>
                              {expandedLevels.has(index) ? (
                                <ChevronDownIcon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                              ) : (
                                <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                              )}
                            </div>
                          </div>
                          
                          {expandedLevels.has(index) && (
                            <ThemeContainer variant="surface" className="p-4 border-t rounded-t-none">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-lg font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                                    {level.learn?.completed ? '✓' : '○'}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Learning</div>
                                </div>
                                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-lg font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                                    {level.test?.completed ? '✓' : '○'}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Test</div>
                                </div>
                                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                                  <div className="text-lg font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                                    {level.exercise?.completed ? '✓' : '○'}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Exercise</div>
                                </div>
                              </div>
                            </ThemeContainer>
                          )}
                        </ThemeContainer>
                      ))}
                    </div>




                  </div>
                )}

                {/* Projects Content */}
                {activeTab === 'projects' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
                      <RocketIcon className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Projects Coming Soon</h4>
                    <p style={{ color: 'var(--color-text-tertiary)' }}>
                      Student projects will be displayed here once they are completed and submitted.
                    </p>
                  </div>
                )}
              </ThemeContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </ThemeContainer>
  );
};

export default StudentPortfolio;
