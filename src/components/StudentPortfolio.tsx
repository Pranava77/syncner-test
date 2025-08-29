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
  TargetIcon,
  RocketIcon,
  PersonIcon,
  ArrowLeftIcon,
  Share1Icon,
  DownloadIcon,
  BarChartIcon
} from '@radix-ui/react-icons';
import { StudentDetails } from '../types/staff';
import { useStaff } from '../hooks/useStaff';

interface PortfolioTab {
  id: 'topics';
  label: string;
  active: boolean;
}

const StudentPortfolio: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { selectedStudent, studentDetailsLoading, error, getStudentDetails } = useStaff();
  const [activeTab, setActiveTab] = useState<'topics'>('topics');
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
    { id: 'topics', label: 'Topics Covered', active: activeTab === 'topics' }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Top Header/Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Student Details
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Student Portfolio</h2>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-accent-primary)',
                  borderColor: 'var(--color-border)',
                  border: '1px solid'
                }}
                title="Share portfolio"
              >
                <Share1Icon className="w-4 h-4" />
                Share
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
                style={{ 
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)',
                  borderColor: 'var(--color-accent-primary)',
                  border: '1px solid'
                }}
                title="Download portfolio as PDF"
              >
                <DownloadIcon className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Student Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="rounded-xl shadow-sm p-6 flex items-center gap-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
              >
                <PersonIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Student</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{student.name}</p>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-sm p-6 flex items-center gap-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
              >
                <TargetIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Career Track</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{student.careerTrack}</p>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-sm p-6 flex items-center gap-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
              >
                <RocketIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Progress</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{calculateCompletionPercentage()}%</p>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-sm p-6 flex items-center gap-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
              >
                <BarChartIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Attendance</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{student.summaryStats.consistency}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              {/* Student Details Card */}
              <div 
                className="p-6 rounded-xl shadow-sm mb-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Student Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Roll Number:</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{student._id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Department:</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Batch:</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.batch || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enrolled Date:</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{student.enrolledDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Last Active:</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatDate(new Date().toISOString())}</span>
                  </div>
                </div>
              </div>

              {/* Skills Card */}
              <div 
                className="p-6 rounded-xl shadow-sm mb-6"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {getSkillsForTrack().map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: 'var(--color-accent-tertiary)', 
                        color: 'var(--color-accent-primary)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Roles Card */}
              <div 
                className="p-6 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recommended Roles</h3>
                <div className="space-y-2">
                  {getRecommendedRoles().map((role) => (
                    <div
                      key={role}
                      className="p-2 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: 'var(--color-secondary-bg)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              </div>


            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
              {/* Introduction */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 px-4 py-2 rounded-lg inline-block" style={{ 
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-border)',
                  border: '1px solid'
                }}>
                  Introduction:
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                  <p style={{ color: 'var(--color-accent-primary)' }}>
                    {student.careerTrack} developer in the making, passionate about solving real business problems with code. 
                    Skilled in various technologies and ready to contribute to impactful projects.
                  </p>
                </div>
              </div>

              {/* Learning Journey Summary */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 px-4 py-2 rounded-lg inline-block" style={{ 
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-border)',
                  border: '1px solid'
                }}>
                  Learning Journey:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border" style={{ 
                    backgroundColor: 'var(--color-success-bg)', 
                    borderColor: 'var(--color-success)'
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-success)' }}>
                        <CheckCircledIcon className="w-5 h-5" style={{ color: 'var(--color-text-inverse)' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--color-success)' }}>Completed</h4>
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                          {student.learningTimeline.filter(l => l.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ 
                    backgroundColor: 'var(--color-warning-bg)', 
                    borderColor: 'var(--color-warning)'
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-warning)' }}>
                        <ClockIcon className="w-5 h-5" style={{ color: 'var(--color-text-inverse)' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--color-warning)' }}>In Progress</h4>
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                          {student.learningTimeline.filter(l => l.status === 'in-progress').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ 
                    backgroundColor: 'var(--color-secondary-bg)', 
                    borderColor: 'var(--color-border)'
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-text-secondary)' }}>
                        <RocketIcon className="w-5 h-5" style={{ color: 'var(--color-text-inverse)' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Total</h4>
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {student.learningTimeline.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div>
                <h3 className="text-xl font-bold mb-4 px-4 py-2 rounded-lg inline-block" style={{ 
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-border)',
                  border: '1px solid'
                }}>
                  Portfolio:
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
                    <div className="p-6 rounded-lg" style={{ 
                      backgroundColor: 'var(--color-secondary-bg)',
                      borderColor: 'var(--color-border)',
                      border: '1px solid',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
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
                    </div>

                    {/* Learning Levels */}
                    <div className="space-y-4">
                      {student.learningTimeline.map((level, index) => (
                        <div
                          key={index}
                          className="rounded-lg border transition-all duration-200"
                          style={{ 
                            backgroundColor: 'var(--color-secondary-bg)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => toggleLevelExpansion(index)}
                            style={{ backgroundColor: 'var(--color-secondary-bg)' }}
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
                            <div className="p-4 border-t" style={{ 
                              backgroundColor: 'var(--color-surface)', 
                              borderColor: 'var(--color-border)' 
                            }}>
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
                            </div>
                          )}
                        </div>
                      ))}
                    </div>




                  </div>
                )}


              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
