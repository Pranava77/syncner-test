import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  TargetIcon, 
  StarFilledIcon, 
  ClockIcon, 
  CheckCircledIcon,
  ExternalLinkIcon,
  GitHubLogoIcon,
  GlobeIcon,
  CalendarIcon,
  StarIcon as AwardIcon,
  FileTextIcon as BookOpenIcon,
  CodeIcon
} from '@radix-ui/react-icons';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { getProjectImage } from '../utils/placeholderImages';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  completedAt: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'completed' | 'in-progress' | 'planned';
}

interface PortfolioSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'design';
  icon: string;
}

interface PortfolioAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  points: number;
}

const PortfolioPage: React.FC = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'skills' | 'achievements'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if this is a staff view
  const isStaffView = location.pathname.startsWith('/staff/');
  const staffStudentData = location.state as { studentId?: string; studentName?: string } | null;

  // Mock data - replace with real data from your backend
  const [portfolioData, setPortfolioData] = useState({
    student: {
      name: 'Alex Johnson',
      avatar: 'AJ',
      careerTrack: 'Full-Stack Development',
      enrollmentDate: '2024-01-15',
      totalPoints: 2840,
      currentLevel: 7,
      totalLevels: 10,
      completionRate: 70
    },
    projects: [
      {
        id: '1',
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce application with user authentication, product management, and payment integration.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        imageUrl: getProjectImage('1'),
        githubUrl: 'https://github.com/username/ecommerce',
        liveUrl: 'https://ecommerce-demo.com',
        completedAt: new Date('2024-03-15'),
        difficulty: 'advanced',
        status: 'completed'
      },
      {
        id: '2',
        title: 'Task Management App',
        description: 'A collaborative task management application with real-time updates and team features.',
        technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
        imageUrl: getProjectImage('2'),
        githubUrl: 'https://github.com/username/taskapp',
        liveUrl: 'https://taskapp-demo.com',
        completedAt: new Date('2024-02-28'),
        difficulty: 'intermediate',
        status: 'completed'
      },
      {
        id: '3',
        title: 'Weather Dashboard',
        description: 'A weather application with location-based forecasts and interactive charts.',
        technologies: ['React', 'OpenWeather API', 'Chart.js'],
        imageUrl: getProjectImage('3'),
        githubUrl: 'https://github.com/username/weather',
        liveUrl: 'https://weather-demo.com',
        completedAt: new Date('2024-01-20'),
        difficulty: 'beginner',
        status: 'completed'
      }
    ],
    skills: [
      { name: 'React', level: 'advanced', category: 'frontend', icon: '⚛️' },
      { name: 'Node.js', level: 'intermediate', category: 'backend', icon: '🟢' },
      { name: 'MongoDB', level: 'intermediate', category: 'database', icon: '🍃' },
      { name: 'TypeScript', level: 'intermediate', category: 'frontend', icon: '🔷' },
      { name: 'Tailwind CSS', level: 'advanced', category: 'frontend', icon: '🎨' },
      { name: 'Express.js', level: 'intermediate', category: 'backend', icon: '🚀' },
      { name: 'PostgreSQL', level: 'beginner', category: 'database', icon: '🐘' },
      { name: 'Docker', level: 'beginner', category: 'devops', icon: '🐳' }
    ],
    achievements: [
      {
        id: '1',
        title: 'First Project Completed',
        description: 'Successfully completed your first project milestone',
        icon: '🎯',
        earnedAt: new Date('2024-01-25'),
        points: 100
      },
      {
        id: '2',
        title: 'Code Quality Master',
        description: 'Achieved excellent code quality scores across multiple projects',
        icon: '⭐',
        earnedAt: new Date('2024-02-10'),
        points: 250
      },
      {
        id: '3',
        title: 'Team Collaboration',
        description: 'Successfully collaborated on a team project',
        icon: '🤝',
        earnedAt: new Date('2024-03-01'),
        points: 300
      }
    ]
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'var(--color-accent-tertiary)';
      case 'intermediate': return 'var(--color-accent-secondary)';
      case 'advanced': return 'var(--color-accent-primary)';
      case 'expert': return 'var(--color-accent-primary)';
      default: return 'var(--color-accent-tertiary)';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--color-accent-tertiary)';
      case 'intermediate': return 'var(--color-accent-secondary)';
      case 'advanced': return 'var(--color-accent-primary)';
      default: return 'var(--color-accent-tertiary)';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          />
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to={isStaffView ? "/staff" : "/student/dashboard"}
              className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ← Back to {isStaffView ? "Staff Dashboard" : "Dashboard"}
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--color-accent-tertiary)',
                  color: 'var(--color-text-primary)' 
                }}
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl font-bold border-4"
               style={{ 
                 backgroundColor: 'var(--color-accent-primary)', 
                 borderColor: 'var(--color-accent-secondary)',
                 color: 'var(--color-text-inverse)' 
               }}>
            {portfolioData.student.avatar}
          </div>
          
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {staffStudentData?.studentName || portfolioData.student.name}
          </h1>
          
          <p className="text-xl mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {portfolioData.student.careerTrack}
          </p>
          
          {isStaffView && staffStudentData?.studentName && (
            <div className="px-4 py-2 rounded-lg text-sm font-medium"
                 style={{ 
                   backgroundColor: 'var(--color-accent-tertiary)',
                   color: 'var(--color-text-primary)' 
                 }}>
              Staff View: {staffStudentData.studentName}'s Portfolio
            </div>
          )}
          
          <div className="flex items-center justify-center gap-6 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>Enrolled: {new Date(portfolioData.student.enrollmentDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>{portfolioData.student.totalPoints} Points</span>
            <span>•</span>
            <span>Level {portfolioData.student.currentLevel} of {portfolioData.student.totalLevels}</span>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="rounded-xl shadow-sm p-6 text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 boxShadow: 'var(--shadow-sm)'
               }}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
              <TargetIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {portfolioData.student.completionRate}%
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Completion Rate</p>
          </div>

          <div className="rounded-xl shadow-sm p-6 text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 boxShadow: 'var(--shadow-sm)'
               }}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
              <StarFilledIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {portfolioData.student.totalPoints}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total Points</p>
          </div>

          <div className="rounded-xl shadow-sm p-6 text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 boxShadow: 'var(--shadow-sm)'
               }}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
              <CodeIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {portfolioData.projects.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Projects</p>
          </div>

          <div className="rounded-xl shadow-sm p-6 text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 boxShadow: 'var(--shadow-sm)'
               }}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
              <StarIcon className="h-6 w-6" style={{ color: 'var(--color-accent-primary)' }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {portfolioData.achievements.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Achievements</p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex border-b mb-8"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {[
            { key: 'overview', label: 'Overview', icon: BookOpenIcon },
            { key: 'projects', label: 'Projects', icon: CodeIcon },
            { key: 'skills', label: 'Skills', icon: TargetIcon },
                         { key: 'achievements', label: 'Achievements', icon: StarFilledIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium ${
                activeTab === tab.key 
                  ? 'border-current' 
                  : 'border-transparent hover:border-current/50'
              }`}
              style={{ 
                color: activeTab === tab.key 
                  ? 'var(--color-accent-primary)' 
                  : 'var(--color-text-secondary)',
                borderColor: activeTab === tab.key 
                  ? 'var(--color-accent-primary)' 
                  : 'transparent'
              }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Projects */}
              <div className="rounded-xl shadow-sm p-6"
                   style={{
                     backgroundColor: 'var(--color-surface)',
                     boxShadow: 'var(--shadow-sm)'
                   }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Recent Projects
                </h3>
                <div className="space-y-4">
                  {portfolioData.projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--color-tertiary-bg)]">
                      <div className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                           style={{ backgroundImage: `url(${project.imageUrl})` }} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                          {project.title}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: getDifficultyColor(project.difficulty) + '20',
                                  color: getDifficultyColor(project.difficulty)
                                }}>
                            {project.difficulty}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            {new Date(project.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Overview */}
              <div className="rounded-xl shadow-sm p-6"
                   style={{
                     backgroundColor: 'var(--color-surface)',
                     boxShadow: 'var(--shadow-sm)'
                   }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Top Skills
                </h3>
                <div className="space-y-3">
                  {portfolioData.skills.slice(0, 6).map((skill, index) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{skill.icon}</span>
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {skill.name}
                        </span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: getSkillLevelColor(skill.level) + '20',
                              color: getSkillLevelColor(skill.level)
                            }}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioData.projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  className="rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div className="h-48 bg-cover bg-center"
                       style={{ backgroundImage: `url(${project.imageUrl})` }} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {project.title}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: getDifficultyColor(project.difficulty) + '20',
                              color: getDifficultyColor(project.difficulty)
                            }}>
                        {project.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="px-2 py-1 rounded-md text-xs font-medium"
                              style={{ 
                                backgroundColor: 'var(--color-accent-tertiary)',
                                color: 'var(--color-text-primary)' 
                              }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Completed {new Date(project.completedAt).toLocaleDateString()}
                      </span>
                      
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-tertiary-bg)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <GitHubLogoIcon className="h-4 w-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-tertiary-bg)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <GlobeIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8">
              {['frontend', 'backend', 'database', 'devops', 'design'].map((category) => {
                const categorySkills = portfolioData.skills.filter(skill => skill.category === category);
                if (categorySkills.length === 0) return null;
                
                return (
                  <div key={category} className="rounded-xl shadow-sm p-6"
                       style={{
                         backgroundColor: 'var(--color-surface)',
                         boxShadow: 'var(--shadow-sm)'
                       }}>
                    <h3 className="text-xl font-semibold mb-4 capitalize" style={{ color: 'var(--color-text-primary)' }}>
                      {category} Skills
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--color-tertiary-bg)]">
                          <span className="text-2xl">{skill.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {skill.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{ 
                                      backgroundColor: getSkillLevelColor(skill.level) + '20',
                                      color: getSkillLevelColor(skill.level)
                                    }}>
                                {skill.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioData.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ y: -5 }}
                  className="rounded-xl shadow-sm p-6 text-center transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 text-4xl">
                    {achievement.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {achievement.title}
                  </h3>
                  
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--color-accent-primary)' }}>
                      <AwardIcon className="h-4 w-4" />
                      {achievement.points} pts
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioPage;
