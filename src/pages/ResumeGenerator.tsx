import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { generateResumeContent } from '../redux/slices/geminiSlice';
import { generateResumePDF, generateResumeFromHTML, ResumeData } from '../utils/pdfGenerator';
import ResumePreview from '../components/ResumePreview';
import { useProgress } from '../hooks/useProgress';
import { useTasks } from '../hooks/useTasks';
import { useModules } from '../hooks/useModules';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  User, 
  Briefcase, 
  Award,
  Code,
  Palette,
  BarChart3,
  Brain,
  Mail,
  Calendar,
  Loader2,
  Sparkles,
  CheckCircle,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import apiService from '../services/api';
import logo from '../assets/syncner-logo.png';

const ResumeGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isApiKeyValid } = useAppSelector((state) => state.gemini);
  const { progress, loading: progressLoading } = useProgress();
  const { tasks, loading: tasksLoading } = useTasks(user?.careerTrack);
  const { modules, loading: modulesLoading } = useModules(user?.careerTrack);
  
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      careerTrack: user?.careerTrack || ''
    },
    summary: '',
    completedProjects: [],
    skills: {
      'Frontend': [],
      'Backend': [],
      'Database': [],
      'Tools': []
    },
    certifications: [],
    education: {
      degree: '',
      school: user?.college || '',
      year: user?.graduationYear || '',
      gpa: user?.gpa || ''
    }
  });
  const [resumeTemplate, setResumeTemplate] = useState<any>(null);
  const [enhancedSummary, setEnhancedSummary] = useState('');
  const [enhanceError, setEnhanceError] = useState('');

  // Load user's actual data from profile, tasks, and progress
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Wait for all data to load
        await Promise.all([
          new Promise(resolve => {
            if (!progressLoading && !tasksLoading && !modulesLoading) resolve(null);
            const checkLoading = () => {
              if (!progressLoading && !tasksLoading && !modulesLoading) resolve(null);
              else setTimeout(checkLoading, 100);
            };
            checkLoading();
          })
        ]);

        // Get completed tasks with scores from progress
        const completedTasks = tasks.filter((task: any) => {
          const taskProgress = progress?.taskProgress?.find((tp: any) => tp.task === task.id);
          return taskProgress?.status === 'completed';
        });

        // Get completed modules
        const completedModules = modules.filter((module: any) => {
          const moduleProgress = progress?.moduleProgress?.find((mp: any) => mp.module === module.id);
          return moduleProgress?.status === 'completed';
        });

        // Transform completed tasks into projects with actual scores
        const projects = completedTasks.map((task: any) => {
          const taskProgress = progress?.taskProgress?.find((tp: any) => tp.task === task.id);
          return {
            title: task.title,
            description: task.description,
            technologies: task.skills || [],
            status: 'Completed',
            score: taskProgress?.score || 0,
            date: taskProgress?.completedAt ? new Date(taskProgress.completedAt).toLocaleDateString() : 'Recently',
            category: task.category,
            difficulty: task.difficulty,
            points: task.points
          };
        });

        // Extract skills from completed tasks and modules
        const allSkills = [
          ...completedTasks.flatMap((task: any) => task.skills || []),
          ...completedModules.flatMap((module: any) => module.skills || [])
        ];
        const uniqueSkills = [...new Set(allSkills)] as string[];

        // Categorize skills more comprehensively
        const frontendSkills = uniqueSkills.filter(skill => 
          ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass', 'Less', 'Next.js', 'Gatsby'].includes(skill)
        );
        const backendSkills = uniqueSkills.filter(skill => 
          ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Rails'].includes(skill)
        );
        const databaseSkills = uniqueSkills.filter(skill => 
          ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Firebase', 'Supabase', 'DynamoDB'].includes(skill)
        );
        const toolSkills = uniqueSkills.filter(skill => 
          ['Git', 'Docker', 'AWS', 'Heroku', 'Figma', 'Jira', 'Jenkins', 'Kubernetes', 'Vercel', 'Netlify'].includes(skill)
        );

        // Generate comprehensive summary based on user's track, progress, and completed projects
        const summary = generateSummary(user, projects, progress, completedModules);

        // Create certifications from completed modules
        const certifications = completedModules.map((module: any) => ({
          name: `${module.title} Certification`,
          issuer: 'Syncner Platform',
          date: new Date().toLocaleDateString(),
          skills: module.skills || []
        }));

        setResumeData({
          personalInfo: {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            location: user.location || '',
            careerTrack: user.careerTrack || 'Software Development'
          },
          summary,
          completedProjects: projects,
          skills: {
            'Frontend': frontendSkills,
            'Backend': backendSkills,
            'Database': databaseSkills,
            'Tools': toolSkills
          },
          certifications,
          education: {
            degree: user.department ? `${user.department} Degree` : 'Bachelor\'s Degree',
            school: user.college,
            year: user.graduationYear || '',
            gpa: user.gpa || ''
          }
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, progress, tasks, modules, progressLoading, tasksLoading, modulesLoading]);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!user?.careerTrack) return;
      try {
        const response = await apiService.getResumeTemplate(user.careerTrack);
        setResumeTemplate(response.data);
      } catch (error) {
        setResumeTemplate(null);
      }
    };
    fetchTemplate();
  }, [user?.careerTrack]);

  const generateSummary = (user: any, projects: any[], progress: any, completedModules: any[]) => {
    const track = user.careerTrack || 'Software Development';
    const projectCount = projects.length;
    const moduleCount = completedModules.length;
    const totalPoints = progress?.totalPoints || 0;
    const overallProgress = progress?.overallProgress || 0;
    
    return `Passionate ${track.toLowerCase()} with hands-on experience in modern web technologies. Completed ${projectCount} real-world projects and ${moduleCount} training modules through Syncner platform, demonstrating strong problem-solving skills and ability to deliver production-ready applications. Achieved ${totalPoints} points with ${overallProgress}% overall progress, showcasing consistent learning and technical growth.`;
  };

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and modern design perfect for tech roles',
      preview: 'bg-gradient-to-br from-blue-50 to-white'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold design with color accents for design roles',
      preview: 'bg-gradient-to-br from-purple-50 to-pink-50'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant layout focusing on content',
      preview: 'bg-gradient-to-br from-gray-50 to-white'
    }
  ];

  const enhanceWithAI = async () => {
    setIsEnhancing(true);
    setEnhanceError('');
    try {
      const res = await apiService.generateResumeContent(resumeData);
      setEnhancedSummary(res.data || 'No summary generated.');
    } catch (error: any) {
      setEnhanceError('AI resume enhancement is currently unavailable.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      await generateResumePDF(resumeData, selectedTemplate);
      alert('Resume PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromPreview = async () => {
    setIsGenerating(true);
    try {
      const fileName = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      await generateResumeFromHTML('resume-preview', fileName);
      alert('Resume PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF from preview:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTrackIcon = (track: string) => {
    if (track?.includes('Full Stack')) return <Code className="h-5 w-5" />;
    if (track?.includes('UI/UX')) return <Palette className="h-5 w-5" />;
    if (track?.includes('Data')) return <BarChart3 className="h-5 w-5" />;
    if (track?.includes('AI/ML')) return <Brain className="h-5 w-5" />;
    return <Briefcase className="h-5 w-5" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Resume Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate a professional resume showcasing your completed projects and skills
        </p>
      </div>

      {isLoading || progressLoading || tasksLoading || modulesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-300">Loading your resume data...</span>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{resumeData.personalInfo.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{resumeData.personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getTrackIcon(resumeData.personalInfo.careerTrack)}
                  <span className="text-sm text-gray-900 dark:text-white">{resumeData.personalInfo.careerTrack}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
                  <span className="text-sm text-gray-900 dark:text-white">{resumeData.education.school}</span>
                </div>
                {progress && (
                  <>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{progress.overallProgress}% Overall Progress</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{progress.totalPoints} Total Points</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Choose Template</h3>
              <div className="space-y-3">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className="block cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplate === template.id}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}>
                      <div className={`h-16 rounded ${template.preview} mb-3`}></div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{template.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="space-y-3">
                <button
                  onClick={enhanceWithAI}
                  disabled={isEnhancing}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                </button>
                
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Preview Resume'}
                </button>
                
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate & Download'}
                </button>
              </div>
            </div>
          </div>

          {/* Content Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Projects</h3>
                <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  {resumeData.completedProjects.length} Projects
                </span>
              </div>
              
              <div className="space-y-4">
                {resumeData.completedProjects.map((project, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{project.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
                          Score: {project.score}%
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                          {project.difficulty}
                        </span>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {project.date}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Technical Skills</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(resumeData.skills).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Certifications</h3>
              <div className="space-y-4">
                {resumeData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                      <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{cert.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{cert.issuer} • {cert.date}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cert.skills.map((skill) => (
                          <span key={skill} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Enhancement */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Enhanced Resume</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Our AI analyzes your completed projects and skills to create compelling 
                    descriptions that highlight your achievements and technical expertise.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <Award className="h-4 w-4 mr-2" />
                      Automatically highlights key achievements
                    </div>
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Optimizes content for ATS systems
                    </div>
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <FileText className="h-4 w-4 mr-2" />
                      Tailored for your career track
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Resume Preview Content */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <ResumePreview resumeData={resumeData} template={selectedTemplate} sections={resumeTemplate?.sections} />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={generateFromPreview}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeGenerator;