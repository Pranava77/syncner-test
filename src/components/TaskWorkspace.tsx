import React, { useState } from 'react';
import { 
  CodeIcon, 
  FileTextIcon, 
  ClockIcon,
  StarFilledIcon,
  EyeOpenIcon,
  UploadIcon as Upload, 
  PaperPlaneIcon as Send, 
  Link2Icon as Link, 
  CheckCircledIcon as CheckCircle, 
  ExclamationTriangleIcon as AlertTriangle,
  EyeOpenIcon as Eye,
} from '@radix-ui/react-icons';
import apiService from '../services/api';
import LoadingScreen from './LoadingScreen';

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  dueDate: string;
  estimatedTime: string;
  status: string;
  requirements: string[];
  skills: string[];
}

interface TaskWorkspaceProps {
  task: Task;
  onClose: () => void;
  onSubmit: (submission: any) => void;
}

const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({ task, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('instructions');
  const [submission, setSubmission] = useState({
    description: '',
    codeFiles: [] as File[],
    liveUrl: '',
    githubUrl: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSubmission(prev => ({
      ...prev,
      codeFiles: [...prev.codeFiles, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setSubmission(prev => ({
      ...prev,
      codeFiles: prev.codeFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!submission.description.trim()) {
      alert('Please provide a description of your solution.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submission process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        ...submission,
        taskId: task.id,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      onSubmit(submissionData);
      
      // Generate AI feedback if API key is available
      await generateAIFeedback();
      
      alert('Task submitted successfully!');
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIFeedback = async () => {
    setIsGeneratingFeedback(true);
    setFeedback('');
    try {
      const res = await apiService.generateFeedback(task, submission.description);
      setFeedback(res.data || 'No feedback generated.');
    } catch (error: any) {
      setFeedback('AI feedback is currently unavailable.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding': return <CodeIcon className="h-5 w-5" />;
      case 'design': return <FileTextIcon className="h-5 w-5" />;
      default: return <FileTextIcon className="h-5 w-5" />;
    }
  };

  if (isSubmitting || isGeneratingFeedback) {
    return <LoadingScreen message={isSubmitting ? "Submitting..." : "Generating Feedback..."} />;
  }

  return (
    <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-paper-white dark:bg-offblack rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-true-turquoise/20 transition-all">
        {/* Header */}
        <div className="p-6 border-b border-true-turquoise/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-true-turquoise/10 p-2 rounded-lg">
                  {getCategoryIcon(task.category)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-offblack dark:text-paper-white">{task.title}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-teal-light/20 text-teal-light border border-teal-light/40`}>
                      {task.difficulty}
                    </span>
                    <div className="flex items-center text-teal-light">
                      <StarFilledIcon className="h-4 w-4 mr-1" />
                      {task.points} points
                    </div>
                    <div className="flex items-center text-offblack/60 dark:text-paper-white/60 text-sm">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {task.estimatedTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-offblack/40 hover:text-true-turquoise text-2xl transition-colors"
            >
              \u00d7
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-true-turquoise/10 bg-paper-white dark:bg-offblack">
          <nav className="flex space-x-8 px-6">
            {['instructions', 'submission', 'feedback'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-true-turquoise text-true-turquoise'
                    : 'border-transparent text-offblack/60 dark:text-paper-white/60 hover:text-true-turquoise'
                }`}
              >
                {tab}
                {tab === 'feedback' && feedback && (
                  <span className="ml-2 bg-teal-light/20 text-teal-light px-2 py-1 rounded-full text-xs">Ready</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-offblack dark:text-paper-white mb-3">Task Description</h3>
                <p className="text-offblack/80 dark:text-paper-white/80 leading-relaxed">{task.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-offblack dark:text-paper-white mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {task.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-true-turquoise mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-offblack/80 dark:text-paper-white/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-offblack dark:text-paper-white mb-3">Skills You'll Practice</h3>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((skill: string) => (
                    <span key={skill} className="bg-true-turquoise/10 text-true-turquoise px-3 py-1 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="bg-rust/10 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-rust mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-rust">Submission Guidelines</h4>
                    <ul className="mt-2 text-sm text-rust space-y-1">
                      <li>• Provide a clear description of your solution</li>
                      <li>• Upload relevant code files or screenshots</li>
                      <li>• Include live demo URL if applicable</li>
                      <li>• Share GitHub repository link for code review</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submission' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-offblack dark:text-paper-white mb-2">
                  Solution Description *
                </label>
                <textarea
                  value={submission.description}
                  onChange={e => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                  rows={4}
                  placeholder="Describe your solution, approach, and any challenges you faced..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-offblack dark:text-paper-white mb-2">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-offblack dark:text-paper-white border border-true-turquoise/30 rounded-lg cursor-pointer bg-paper-white dark:bg-offblack focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                />
                {submission.codeFiles.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {submission.codeFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-teal-light/10 p-2 rounded">
                        <span className="text-xs text-offblack dark:text-paper-white">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button type="button" className="text-rust ml-2" onClick={() => removeFile(idx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-offblack dark:text-paper-white mb-2">Live URL</label>
                  <input
                    value={submission.liveUrl}
                    onChange={e => setSubmission(prev => ({ ...prev, liveUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                    type="url"
                    placeholder="https://your-demo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-offblack dark:text-paper-white mb-2">GitHub URL</label>
                  <input
                    value={submission.githubUrl}
                    onChange={e => setSubmission(prev => ({ ...prev, githubUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                    type="url"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-offblack dark:text-paper-white mb-2">Notes</label>
                <textarea
                  value={submission.notes}
                  onChange={e => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                  rows={2}
                  placeholder="Any additional information, challenges faced, or future improvements..."
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-true-turquoise text-paper-white py-2 rounded-lg hover:bg-teal-light hover:text-offblack disabled:opacity-50 font-semibold flex items-center justify-center mt-2 transition shadow-sm"
              >
                <Send className="h-4 w-4 mr-2" /> Submit Task
              </button>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-offblack dark:text-paper-white mb-3">AI Feedback</h3>
                <div className="bg-teal-light/10 rounded-lg p-4">
                  <p className="text-offblack/80 dark:text-paper-white/80 whitespace-pre-wrap">{feedback || 'No feedback generated yet.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskWorkspace;
