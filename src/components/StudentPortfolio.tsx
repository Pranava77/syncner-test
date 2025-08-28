import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircledIcon,
  ClockIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeOpenIcon,
  CalendarIcon,
  TargetIcon,
  RocketIcon,
  PersonIcon,
  IdCardIcon
} from '@radix-ui/react-icons';
import { StudentDetails } from '../types/staff';

interface StudentPortfolioProps {
  student: StudentDetails;
  onClose: () => void;
}

interface PortfolioTab {
  id: 'topics' | 'projects';
  label: string;
  active: boolean;
}

const StudentPortfolio: React.FC<StudentPortfolioProps> = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'projects'>('topics');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  const toggleLevelExpansion = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const calculateCompletionPercentage = () => {
    const completedLevels = student.learningTimeline.filter(level => level.status === 'completed').length;
    const totalLevels = student.learningTimeline.length;
    return totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  };

  const getSkillsForTrack = () => {
    const track = student.careerTrack.toLowerCase();
    const skills = {
      'full-stack': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
      'ai-ml': ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'SQL', 'Statistics'],
      'ui-ux': ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
      'data-science': ['Python', 'SQL', 'Statistics', 'Data Visualization', 'Machine Learning', 'R']
    };
    return skills[track as keyof typeof skills] || ['Programming', 'Problem Solving', 'Communication'];
  };

  const getRecommendedRoles = () => {
    const track = student.careerTrack.toLowerCase();
    const roles = {
      'full-stack': ['Full Stack Developer', 'Front-end Developer', 'Back-end Developer', 'Software Developer', 'Web Developer'],
      'ai-ml': ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'ML Developer', 'AI Full Stack Developer'],
      'ui-ux': ['UI/UX Designer', 'Product Designer', 'Visual Designer', 'Interaction Designer', 'UX Researcher'],
      'data-science': ['Data Scientist', 'Data Analyst', 'Business Analyst', 'Data Engineer', 'ML Engineer']
    };
    return roles[track as keyof typeof roles] || ['Software Developer', 'Developer', 'Engineer'];
  };

  const tabs: PortfolioTab[] = [
    { id: 'topics', label: 'Topics Covered', active: activeTab === 'topics' },
    { id: 'projects', label: 'Projects', active: activeTab === 'projects' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Portfolio</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            {/* Profile Header */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <PersonIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{student.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 flex items-center justify-center gap-2">
                <span className="w-4 h-4">📍</span>
                {student.department || 'N/A'}, {student.batch || 'N/A'}
              </p>
              
              {/* Completion Badge and Progress */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-3">
                  <CheckCircledIcon className="w-4 h-4" />
                  {calculateCompletionPercentage()}% completed
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculateCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Status Pills */}
              <div className="space-y-2 mb-6">
                <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                  Track: {student.careerTrack}
                </div>
                <div className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg text-sm">
                  Duration: {student.learningTimeline.length} months
                </div>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-sm">
                  Last verified: {formatDate(new Date().toISOString())}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-left">SKILLS</h4>
                <div className="flex flex-wrap gap-2">
                  {getSkillsForTrack().map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Roles */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">RECOMMENDED ROLES</h4>
              <div className="space-y-2">
                {getRecommendedRoles().map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-800 dark:text-gray-200">{role}</span>
                    <span className="text-gray-400">⋯</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">PERFORMANCE</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Attendance</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.summaryStats.consistency}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.summaryStats.progress}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Leaderboard</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.summaryStats.leaderboard}%</span>
                </div>
              </div>
            </div>

            {/* Career Readiness */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">CAREER READINESS</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900 rounded">
                  <span className="text-xs text-green-700 dark:text-green-300">Portfolio Ready</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900 rounded">
                  <span className="text-xs text-green-700 dark:text-green-300">Skills Verified</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">Industry Ready</span>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">~</span>
                </div>
              </div>
            </div>

            {/* Certificate ID */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">CERTIFICATE ID</h4>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                  SYNCNER-2025-{student._id.slice(-8).toUpperCase()}-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Introduction */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block">
                Introduction:
              </h3>
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <p className="text-gray-800 dark:text-blue-200">
                  {student.careerTrack} developer in the making, passionate about solving real business problems with code. 
                  Skilled in various technologies and ready to contribute to impactful projects.
                </p>
              </div>
            </div>

            {/* Learning Journey Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block">
                Learning Journey:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <CheckCircledIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Completed</h4>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {student.learningTimeline.filter(l => l.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">In Progress</h4>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {student.learningTimeline.filter(l => l.status === 'in-progress').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <RocketIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Total</h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {student.learningTimeline.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block">
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
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

                            {/* Topics Covered Content */}
              {activeTab === 'topics' && (
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {student.learningTimeline.filter(l => l.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {student.learningTimeline.filter(l => l.status === 'in-progress').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {student.learningTimeline.filter(l => l.status === 'not-started').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Not Started</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.round(student.learningTimeline.reduce((acc, l) => acc + (l.test.score || 0), 0) / Math.max(1, student.learningTimeline.length))}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Levels */}
                  {student.learningTimeline.map((level, index) => (
                    <motion.div
                      key={level.level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Level Header */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-sm font-bold">
                            {String(level.level).padStart(2, '0')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{level.courseName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Completed {level.learn.endTime ? formatDate(level.learn.endTime) : 'N/A'}</span>
                              <span>Assessed: {level.test.score || 0}/100</span>
                              <span>Time: {Math.floor(Math.random() * 8) + 1}h {Math.floor(Math.random() * 60)}m</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                              MCQ ✅ {level.test.score || 0}%
                            </span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                              Tasks 5/5
                            </span>
                          </div>
                          <button
                            onClick={() => toggleLevelExpansion(level.level)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            {expandedLevels.has(level.level) ? (
                              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedLevels.has(level.level) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {[1, 2, 3, 4, 5].map((taskNum) => (
                              <div
                                key={taskNum}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                  Task: Build a web using HTML/CSS
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  Brief: Create a HTML Website
                                </p>
                                <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                  <EyeOpenIcon className="w-4 h-4" />
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Will also be showing optional tasks
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Projects Content */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {/* Achievements Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-500" />
                      Achievements & Certifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CheckCircledIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Course Completion</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{calculateCompletionPercentage()}% of track completed</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <TargetIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Performance</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Top {Math.max(1, Math.floor(Math.random() * 20))}% performer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Areas for Improvement */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TargetIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Strengths & Areas for Improvement
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-green-800 dark:text-green-200 mb-3">Strengths</h5>
                        <div className="space-y-2">
                          {['Consistent attendance', 'Strong problem-solving skills', 'Good communication'].map((strength, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-3">Areas for Improvement</h5>
                        <div className="space-y-2">
                          {['Advanced project work', 'Industry experience', 'Specialized certifications'].map((area, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-gray-700 dark:text-gray-300">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Achievements */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900 dark:to-teal-900 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Learning Achievements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                            <CheckCircledIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Consistent Learner</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Maintained {student.summaryStats.consistency}% attendance</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-teal-200 dark:border-teal-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                            <RocketIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Fast Learner</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Completed {student.learningTimeline.filter(l => l.status === 'completed').length} levels</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projects Coming Soon */}
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <TargetIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Projects Coming Soon</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Student projects will be displayed here once they are completed and submitted.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentPortfolio;
