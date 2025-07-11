import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Download, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  Code,
  Link,
  FileText
} from 'lucide-react';

interface Submission {
  _id: string;
  id?: string;
  taskId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  notes?: string;
  files?: string[];
  score?: number;
  feedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  taskTitle?: string;
  task?: { title: string };
}

interface TaskReviewProps {
  submissions?: Submission[];
  onReview: (submissionId: string, score: number, feedback: string, status: string) => void;
}

const TaskReview: React.FC<TaskReviewProps> = ({ submissions = [], onReview }) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewForm, setReviewForm] = useState({
    score: 0,
    feedback: '',
    status: 'pending'
  });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredSubmissions = (submissions || []).filter(submission => {
    if (filter !== 'all' && submission.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (submission.studentName && submission.studentName.toLowerCase().includes(s)) ||
        (submission.studentEmail && submission.studentEmail.toLowerCase().includes(s)) ||
        (submission.taskTitle && submission.taskTitle.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleReview = () => {
    if (!selectedSubmission) return;
    
    if (reviewForm.score === 0) {
      alert('Please provide a score for this submission.');
      return;
    }
    
    if (!reviewForm.feedback.trim()) {
      alert('Please provide feedback for this submission.');
      return;
    }

    onReview(selectedSubmission._id || selectedSubmission.id || '', reviewForm.score, reviewForm.feedback, reviewForm.status);
    setSelectedSubmission(null);
    setReviewForm({ score: 0, feedback: '', status: 'pending' });
  };

  const openSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      score: submission.score || 0,
      feedback: submission.feedback || '',
      status: submission.status
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Submissions</h2>
          <p className="text-gray-600 dark:text-gray-300">Review and grade student submissions</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, email, or task..."
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{submission.taskTitle || submission.task?.title || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.studentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.studentEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.score ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Not graded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSubmission(submission)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                        title="Review Submission"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {submission.liveUrl && (
                        <a
                          href={submission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                          title="View Live Demo"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      )}
                      {submission.githubUrl && (
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors"
                          title="View GitHub Code"
                        >
                          <Code className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Submissions Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'No submissions have been made yet.' : `No ${filter} submissions found.`}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Submission</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedSubmission.studentName} • Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-semibold">Task:</span> {selectedSubmission.taskTitle || selectedSubmission.task?.title || '—'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Submission Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Solution Description</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedSubmission.description}
                      </p>
                    </div>
                  </div>

                  {selectedSubmission.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Additional Notes</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedSubmission.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="space-y-3">
                    {selectedSubmission.liveUrl && (
                      <a
                        href={selectedSubmission.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Link className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Live Demo</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSubmission.liveUrl}</p>
                        </div>
                      </a>
                    )}

                    {selectedSubmission.githubUrl && (
                      <a
                        href={selectedSubmission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Code className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">GitHub Repository</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSubmission.githubUrl}</p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Files */}
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Uploaded Files</h3>
                      <div className="space-y-2">
                        {selectedSubmission.files.map((file: any, index: number) => {
                          // file can be a string (old data) or object (new data)
                          let fileName: string;
                          let fileUrl: string;
                          if (typeof file === 'string') {
                            fileName = file;
                            fileUrl = `/uploads/${file}`;
                          } else if (file && typeof file === 'object' && ('filename' in file)) {
                            fileName = file.originalName || file.filename;
                            fileUrl = `/uploads/${file.filename}`;
                          } else {
                            fileName = 'Unknown';
                            fileUrl = '#';
                          }
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-900 dark:text-white">{fileName}</span>
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center"
                              >
                                <DownloadIcon className="h-4 w-4 mr-1" /> Download
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reviewForm.score}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={reviewForm.status}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Provide detailed feedback on the submission..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReview}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save Review
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReview;