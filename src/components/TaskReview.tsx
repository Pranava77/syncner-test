import React, { useState } from 'react';
import { 
  CheckCircledIcon, 
  CrossCircledIcon, 
  ClockIcon, 
  StarFilledIcon, 
  DownloadIcon, 
  EyeOpenIcon, 
  ChatBubbleIcon,
  CalendarIcon,
  PersonIcon,
  CodeIcon,
  Link2Icon,
  FileTextIcon
} from '@radix-ui/react-icons';

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
      case 'approved': return 'bg-true-turquoise/10 text-true-turquoise border border-true-turquoise';
      case 'rejected': return 'bg-rust/10 text-rust border border-rust';
      case 'reviewed': return 'bg-teal-light/20 text-teal-light border border-teal-light';
      case 'pending': return 'bg-paper-white/80 text-offblack border border-offblack/20';
      default: return 'bg-paper-white/80 text-offblack border border-offblack/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircledIcon className="h-4 w-4" />;
      case 'rejected': return <CrossCircledIcon className="h-4 w-4" />;
      case 'reviewed': return <EyeOpenIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
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
          <h2 className="text-2xl font-bold text-offblack dark:text-paper-white">Task Submissions</h2>
          <p className="text-offblack/70 dark:text-paper-white/70">Review and grade student submissions</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, email, or task..."
            className="border border-true-turquoise/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-true-turquoise focus:border-transparent bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white text-sm transition-colors"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-true-turquoise/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-true-turquoise focus:border-transparent bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white text-sm transition-colors"
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
      <div className="bg-paper-white dark:bg-offblack rounded-2xl shadow-xl overflow-hidden border border-true-turquoise/10 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-true-turquoise/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-true-turquoise uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-true-turquoise uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-true-turquoise uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-true-turquoise uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-true-turquoise uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-true-turquoise uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-paper-white dark:bg-offblack divide-y divide-true-turquoise/10">
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-true-turquoise/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-offblack dark:text-paper-white">{submission.taskTitle || submission.task?.title || '\u2014'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-true-turquoise/10 p-2 rounded-full mr-3">
                        <PersonIcon className="h-4 w-4 text-true-turquoise" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-offblack dark:text-paper-white">
                          {submission.studentName}
                        </div>
                        <div className="text-sm text-offblack/60 dark:text-paper-white/60">
                          {submission.studentEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-offblack/60 dark:text-paper-white/60">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      submission.status === 'approved' ? 'bg-true-turquoise/10 text-true-turquoise border border-true-turquoise' :
                      submission.status === 'rejected' ? 'bg-rust/10 text-rust border border-rust' :
                      submission.status === 'reviewed' ? 'bg-teal-light/20 text-teal-light border border-teal-light' :
                      submission.status === 'pending' ? 'bg-paper-white/80 text-offblack border border-offblack/20' :
                      'bg-paper-white/80 text-offblack border border-offblack/10'}
                    `}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.score ? (
                      <div className="flex items-center">
                        <StarFilledIcon className="h-4 w-4 text-teal-light mr-1" />
                        <span className="text-sm font-medium text-offblack dark:text-paper-white">
                          {submission.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-offblack/60 dark:text-paper-white/60">Not graded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSubmission(submission)}
                        className="bg-true-turquoise hover:bg-teal-light text-paper-white hover:text-offblack p-2 rounded transition-colors shadow-sm"
                        title="Review Submission"
                      >
                        <EyeOpenIcon className="h-4 w-4" />
                      </button>
                      {submission.liveUrl && (
                        <a
                          href={submission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-teal-light hover:bg-true-turquoise text-offblack hover:text-paper-white p-2 rounded transition-colors shadow-sm"
                          title="View Live Demo"
                        >
                          <Link2Icon className="h-4 w-4" />
                        </a>
                      )}
                      {submission.githubUrl && (
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-paper-white hover:bg-true-turquoise text-true-turquoise hover:text-paper-white p-2 rounded transition-colors border border-true-turquoise shadow-sm"
                          title="View GitHub Code"
                        >
                          <CodeIcon className="h-4 w-4" />
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
            <ChatBubbleIcon className="h-12 w-12 text-offblack/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-offblack dark:text-paper-white mb-2">No Submissions Found</h3>
            <p className="text-offblack/70 dark:text-paper-white/70">
              {filter === 'all' ? 'No submissions have been made yet.' : `No ${filter} submissions found.`}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-paper-white dark:bg-offblack rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-offblack dark:text-paper-white">Review Submission</h2>
                  <p className="text-offblack/70 dark:text-paper-white/70">
                    {selectedSubmission.studentName} • Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-offblack/60 dark:text-paper-white/60 mt-1">
                    <span className="font-semibold">Task:</span> {selectedSubmission.taskTitle || selectedSubmission.task?.title || '—'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-offblack/40 hover:text-offblack dark:hover:text-paper-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Submission Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-offblack dark:text-paper-white mb-3">Solution Description</h3>
                    <div className="bg-paper-white dark:bg-offblack rounded-lg p-4">
                      <p className="text-offblack dark:text-paper-white whitespace-pre-wrap">
                        {selectedSubmission.description}
                      </p>
                    </div>
                  </div>

                  {selectedSubmission.notes && (
                    <div>
                      <h3 className="font-semibold text-offblack dark:text-paper-white mb-3">Additional Notes</h3>
                      <div className="bg-paper-white dark:bg-offblack rounded-lg p-4">
                        <p className="text-offblack dark:text-paper-white whitespace-pre-wrap">
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
                        className="flex items-center p-3 border border-true-turquoise/20 rounded-lg hover:bg-true-turquoise/5 transition-colors"
                      >
                        <Link2Icon className="h-5 w-5 text-teal-light mr-3" />
                        <div>
                          <p className="font-medium text-offblack dark:text-paper-white">Live Demo</p>
                          <p className="text-sm text-offblack/60 dark:text-paper-white/60">{selectedSubmission.liveUrl}</p>
                        </div>
                      </a>
                    )}

                    {selectedSubmission.githubUrl && (
                      <a
                        href={selectedSubmission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border border-true-turquoise/20 rounded-lg hover:bg-true-turquoise/5 transition-colors"
                      >
                        <CodeIcon className="h-5 w-5 text-true-turquoise mr-3" />
                        <div>
                          <p className="font-medium text-offblack dark:text-paper-white">GitHub Repository</p>
                          <p className="text-sm text-offblack/60 dark:text-paper-white/60">{selectedSubmission.githubUrl}</p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Files */}
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-offblack dark:text-paper-white mb-3">Uploaded Files</h3>
                      <div className="space-y-2">
                        {selectedSubmission.files.map((file: string | { filename: string; originalName?: string }, index: number) => {
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
                            <div key={index} className="flex items-center justify-between p-3 bg-paper-white dark:bg-offblack rounded-lg">
                              <div className="flex items-center">
                                <FileTextIcon className="h-4 w-4 text-offblack/60 mr-2" />
                                <span className="text-sm text-offblack dark:text-paper-white">{fileName}</span>
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-true-turquoise hover:text-teal-light text-sm flex items-center"
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
                    <label className="block text-sm font-medium text-offblack dark:text-paper-white/70 mb-2">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reviewForm.score}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg focus:ring-2 focus:ring-true-turquoise focus:border-transparent bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-offblack dark:text-paper-white/70 mb-2">
                      Status
                    </label>
                    <select
                      value={reviewForm.status}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg focus:ring-2 focus:ring-true-turquoise focus:border-transparent bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-offblack dark:text-paper-white/70 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full h-40 px-3 py-2 border border-true-turquoise/30 rounded-lg focus:ring-2 focus:ring-true-turquoise focus:border-transparent bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white"
                      placeholder="Provide detailed feedback on the submission..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReview}
                      className="flex-1 bg-true-turquoise text-paper-white py-3 rounded-lg hover:bg-teal-light transition-colors font-medium shadow-sm"
                    >
                      Save Review
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-6 py-3 border border-true-turquoise/30 rounded-lg text-offblack hover:text-paper-white transition-colors font-medium"
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