import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { generateResumeContent } from '../redux/slices/geminiSlice';
import { generateResumePDF, generateResumeFromHTML, ResumeData } from '../utils/pdfGenerator';
import ResumePreview from '../components/ResumePreview';
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
  Sparkles
} from 'lucide-react';
import apiService from '../services/api';
import logo from '../assets/syncner-logo.png';

const ResumeGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isApiKeyValid } = useAppSelector((state) => state.gemini);
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

  // Load user's actual data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Load user's completed tasks
        const tasksResponse = await apiService.getTasks();
        const completedTasks = tasksResponse.data.filter((task: any) => 
          task.status === 'completed' || task.userProgress?.status === 'completed'
        );

        // Transform completed tasks into projects
        const projects = completedTasks.map((task: any) => ({
          title: task.title,
          description: task.description,
          technologies: task.technologies || [],
          status: 'Completed',
          score: task.userProgress?.score || 0,
          date: task.userProgress?.completedAt || task.createdAt
        }));

        // Extract skills from completed tasks
        const allTechnologies = completedTasks.flatMap((task: any) => 
          task.technologies || []
        );
        const uniqueTechnologies = [...new Set(allTechnologies)] as string[];

        // Categorize skills
        const frontendSkills = uniqueTechnologies.filter(tech => 
          ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Bootstrap'].includes(tech)
        );
        const backendSkills = uniqueTechnologies.filter(tech => 
          ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring'].includes(tech)
        );
        const databaseSkills = uniqueTechnologies.filter(tech => 
          ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite'].includes(tech)
        );
        const toolSkills = uniqueTechnologies.filter(tech => 
          ['Git', 'Docker', 'AWS', 'Heroku', 'Figma', 'Jira'].includes(tech)
        );

        // Generate summary based on user's track and completed projects
        const summary = generateSummary(user, projects);

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
          certifications: [], // Will be populated from actual certifications
          education: {
            degree: 'Bachelor\'s Degree', // Default degree
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
  }, [user]);

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

  const generateSummary = (user: any, projects: any[]) => {
    const track = user.careerTrack || 'Software Development';
    const projectCount = projects.length;
    
    return `Passionate ${track.toLowerCase()} with hands-on experience in modern web technologies. Completed ${projectCount} real-world projects through Syncner platform, demonstrating strong problem-solving skills and ability to deliver production-ready applications.`;
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
    if (!isApiKeyValid) {
      alert('Please configure your Gemini API key to use AI enhancement.');
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await dispatch(generateResumeContent(resumeData)).unwrap();
      
      // Parse the AI response and update resume data
      // This is a simplified implementation - in production, you'd want more robust parsing
      const lines = result.split('\n');
      let enhancedSummary = resumeData.summary;
      
      // Look for professional summary in AI response
      const summaryIndex = lines.findIndex((line: string) => 
        line.toLowerCase().includes('professional summary') || 
        line.toLowerCase().includes('summary')
      );
      
      if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
        const summaryLine = lines[summaryIndex + 1];
        if (summaryLine && summaryLine.trim().length > 50) {
          enhancedSummary = summaryLine.trim();
        }
      }

      setResumeData(prev => ({
        ...prev,
        summary: enhancedSummary
      }));

      alert('Resume enhanced with AI! Check the updated content.');
    } catch (error: any) {
      console.error('Error enhancing resume:', error);
      alert(error.message || 'Failed to enhance resume with AI. Please try again.');
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Resume Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate a professional resume showcasing your completed projects and skills
        </p>
      </div>

      {isLoading ? (
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
                  disabled={isEnhancing || !isApiKeyValid}
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