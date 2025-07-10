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
import { fetchProgress } from '../redux/slices/progressSlice';
import { fetchModules } from '../redux/slices/modulesSlice';
import { fetchTasks } from '../redux/slices/tasksSlice';
import LoadingScreen from '../components/LoadingScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const ResumeGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const progressState = useAppSelector((state) => state.progress);
  const modulesState = useAppSelector((state) => state.modules);
  const tasksState = useAppSelector((state) => state.tasks);
  
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

  useEffect(() => {
    if (!progressState.data || progressState.lastFetched === null) {
      dispatch(fetchProgress());
    }
    if ((!modulesState.data || modulesState.data.length === 0) || modulesState.lastFetched === null) {
      dispatch(fetchModules(user?.careerTrack || ''));
    }
    if ((!tasksState.data || tasksState.data.length === 0) || tasksState.lastFetched === null) {
      dispatch(fetchTasks({ trackId: user?.careerTrack || '' }));
    }
  }, [dispatch, user?.careerTrack]);

  const progress = progressState.data;
  const modules = modulesState.data || [];
  const tasks = tasksState.data || [];
  const progressLoading = progressState.loading;
  const modulesLoading = modulesState.loading;
  const tasksLoading = tasksState.loading;

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
        const response = await apiService.getResumeTemplate(user.careerTrack || '');
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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-[var(--brand-success-bg)] text-[var(--brand-success)] dark:bg-[var(--brand-success-bg)]/20 dark:text-[var(--brand-success)]';
      case 'Intermediate': return 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)] dark:bg-[var(--brand-warning-bg)]/20 dark:text-[var(--brand-warning)]';
      case 'Advanced': return 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)] dark:bg-[var(--brand-danger-bg)]/20 dark:text-[var(--brand-danger)]';
      default: return 'bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg)] dark:text-[var(--brand-text)]';
    }
  };

  if (isLoading) return <LoadingScreen message="Loading resume data..." showProgress={true} progressDuration={1600} />;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-2">AI Resume Generator</h1>
        <p className="text-[var(--brand-primary)]">
          Generate a professional resume showcasing your completed projects and skills
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        {/* Profile Summary */}
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-[var(--brand-text)] mb-4">Profile Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-sm text-[var(--brand-text)]">{resumeData.personalInfo.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-sm text-[var(--brand-text)]">{resumeData.personalInfo.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              {getTrackIcon(resumeData.personalInfo.careerTrack)}
              <span className="text-sm text-[var(--brand-text)]">{resumeData.personalInfo.careerTrack}</span>
            </div>
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
              <span className="text-sm text-[var(--brand-text)]">{resumeData.education.school}</span>
            </div>
            {progress && (
              <>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-[var(--brand-primary)]" />
                  <span className="text-sm text-[var(--brand-text)]">{progress.overallProgress}% Overall Progress</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-[var(--brand-primary)]" />
                  <span className="text-sm text-[var(--brand-text)]">{progress.totalPoints} Total Points</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-[var(--brand-text)] mb-4">Choose Template</h3>
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
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-bg)]'
                    : 'border-[var(--brand-bg-alt)] hover:border-[var(--brand-primary)]'
                }`}>
                  <div className={`h-16 rounded ${template.preview} mb-3`}></div>
                  <h4 className="font-medium text-[var(--brand-text)]">{template.name}</h4>
                  <p className="text-sm text-[var(--brand-primary)]">{template.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
          <div className="space-y-3">
            <button
              onClick={enhanceWithAI}
              disabled={isEnhancing}
              className="w-full flex items-center justify-center px-4 py-2 bg-[var(--brand-accent)] text-white rounded-lg hover:bg-[var(--brand-primary)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </button>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-center px-4 py-2 border border-[var(--brand-primary)] text-[var(--brand-text)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors font-medium"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Preview Resume'}
            </button>
            
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full flex items-center justify-center px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
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
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--brand-text)]">Completed Projects</h3>
            <span className="bg-[var(--brand-success-bg)] text-[var(--brand-success)] px-3 py-1 rounded-full text-sm font-medium">
              {resumeData.completedProjects.length} Projects
            </span>
          </div>
          
          <div className="space-y-4">
            {resumeData.completedProjects.map((project, index) => (
              <div key={index} className="border border-[var(--brand-bg)] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[var(--brand-text)]">{project.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] px-2 py-1 rounded text-xs font-medium">
                      Score: {project.score}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                    <div className="flex items-center text-[var(--brand-primary)] text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.date}
                    </div>
                  </div>
                </div>
                <p className="text-[var(--brand-primary)] text-sm mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="bg-[var(--brand-bg)] text-[var(--brand-text)] px-2 py-1 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-6">Technical Skills</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(resumeData.skills).map(([category, skills]) => (
              <div key={category}>
                <h4 className="font-medium text-[var(--brand-text)] mb-3">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-6">Certifications</h3>
          <div className="space-y-4">
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-[var(--brand-accent)]/10 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-[var(--brand-accent)]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--brand-text)]">{cert.name}</h4>
                  <p className="text-sm text-[var(--brand-primary)]">{cert.issuer} • {cert.date}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="bg-[var(--brand-bg)] text-[var(--brand-text)] px-2 py-1 rounded text-xs">
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
        <div className="bg-gradient-to-r from-[var(--brand-accent)]/10 to-[var(--brand-primary)]/10 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-[var(--brand-accent)]/10 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-[var(--brand-accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--brand-text)] mb-2">AI-Enhanced Resume</h3>
              <p className="text-[var(--brand-primary)] text-sm mb-4">
                Our AI analyzes your completed projects and skills to create compelling 
                descriptions that highlight your achievements and technical expertise.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-[var(--brand-success)]">
                  <Award className="h-4 w-4 mr-2" />
                  Automatically highlights key achievements
                </div>
                <div className="flex items-center text-[var(--brand-success)]">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Optimizes content for ATS systems
                </div>
                <div className="flex items-center text-[var(--brand-success)]">
                  <FileText className="h-4 w-4 mr-2" />
                  Tailored for your career track
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--brand-bg-alt)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--brand-text)]">Resume Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)] text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Resume Preview Content */}
              <div className="border border-[var(--brand-bg)] rounded-lg overflow-hidden">
                <ResumePreview resumeData={resumeData} template={selectedTemplate} sections={resumeTemplate?.sections} />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={generateFromPreview}
                  disabled={isGenerating}
                  className="flex-1 bg-[var(--brand-primary)] text-white py-3 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-6 py-3 border border-[var(--brand-primary)] text-[var(--brand-text)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors font-medium"
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