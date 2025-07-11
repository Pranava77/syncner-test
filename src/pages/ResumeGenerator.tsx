import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { generateResumeContent } from '../redux/slices/geminiSlice';
import { generateResumePDF, generateResumeFromHTML, ResumeData } from '../utils/pdfGenerator';
import ResumePreview from '../components/ResumePreview';
import { useProgress } from '../hooks/useProgress';
import { useTasks } from '../hooks/useTasks';
import { useModules } from '../hooks/useModules';
import {
  CodeIcon,
  ColorWheelIcon,
  BarChartIcon,
  LightningBoltIcon,
  FileTextIcon as Briefcase
} from '@radix-ui/react-icons';
import apiService from '../services/api';
import logo from '../assets/syncner-logo.png';
import { fetchProgress } from '../redux/slices/progressSlice';
import { fetchModules } from '../redux/slices/modulesSlice';
import { fetchTasks } from '../redux/slices/tasksSlice';
import LoadingScreen from '../components/LoadingScreen';

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
    if (track?.includes('Full Stack')) return <CodeIcon className="h-5 w-5" />;
    if (track?.includes('UI/UX')) return <ColorWheelIcon className="h-5 w-5" />;
    if (track?.includes('Data')) return <BarChartIcon className="h-5 w-5" />;
    if (track?.includes('AI/ML')) return <LightningBoltIcon className="h-5 w-5" />;
    return <Briefcase className="h-5 w-5" />;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (isLoading || isGenerating || isEnhancing) {
    return <LoadingScreen message={isGenerating ? "Generating PDF..." : isEnhancing ? "Enhancing with AI..." : "Loading resume data..."} />;
  }

  // At the end of the component's return, ensure ResumePreview is always rendered
  // If resumeData is missing, show a message or placeholder
  if (!resumeData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Resume Data Available</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Please complete your profile and tasks to generate your resume.</p>
        {/* Optionally, render a disabled ResumePreview with placeholder data */}
      </div>
    );
  }

  return (
    <ResumePreview resumeData={resumeData} template={selectedTemplate} sections={resumeTemplate?.sections} />
  );
};

export default ResumeGenerator;
