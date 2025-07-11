import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { generateFeedback } from '../redux/slices/geminiSlice';
import { 
  Upload, 
  Send, 
  Code, 
  FileText, 
  Link, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Star,
  Eye,
} from 'lucide-react';
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
  const dispatch = useAppDispatch();
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
      case 'coding': return <Code className="h-5 w-5" />;
      case 'design': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (isSubmitting || isGeneratingFeedback) {
    return <LoadingScreen message={isSubmitting ? "Submitting..." : "Generating Feedback..."} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                  {getCategoryIcon(task.category)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                    <div className="flex items-center text-purple-600 dark:text-purple-400">
                      <Star className="h-4 w-4 mr-1" />
                      {task.points} points
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {task.estimatedTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {['instructions', 'submission', 'feedback'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
                {tab === 'feedback' && feedback && (
                  <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    Ready
                  </span>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Task Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {task.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills You'll Practice</h3>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((skill) => (
                    <span key={skill} className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Submission Guidelines</h4>
                    <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Solution Description *
                </label>
                <textarea
                  value={submission.description}
                  onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your solution, approach, and any challenges you faced..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Files
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload code files, screenshots, or documentation
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".js,.jsx,.ts,.tsx,.html,.css,.py,.java,.cpp,.c,.png,.jpg,.jpeg,.pdf,.md"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>

                {submission.codeFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Uploaded Files:</h4>
                    {submission.codeFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Live Demo URL
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={submission.liveUrl}
                      onChange={(e) => setSubmission(prev => ({ ...prev, liveUrl: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://your-demo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub Repository
                  </label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={submission.githubUrl}
                      onChange={(e) => setSubmission(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={submission.notes}
                  onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Any additional information, challenges faced, or future improvements..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !submission.description.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Task
                </button>
                
                <button
                  onClick={generateAIFeedback}
                  disabled={isGeneratingFeedback || !submission.description.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Get AI Feedback
                </button>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {feedback ? (
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg mr-3">
                      <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Feedback</h3>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                      {feedback}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full w-fit mx-auto mb-4">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Feedback Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Submit your solution or generate AI feedback to see detailed review here.
                  </p>
                  <button
                    onClick={generateAIFeedback}
                    disabled={isGeneratingFeedback || !submission.description.trim()}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                  >
                    <EyeOpenIcon className="h-4 w-4 mr-2" />
                    Generate AI Feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskWorkspace;
