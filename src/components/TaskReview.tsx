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
      case 'approved': return 'bg-trueturquoise/20 text-trueturquoise';
      case 'rejected': return 'bg-rust/20 text-rust';
      case 'reviewed': return 'bg-trueturquoise/20 text-trueturquoise';
      case 'pending': return 'bg-teallight/20 text-teallight';
      default: return 'bg-paperwhite/10 text-paperwhite/70';
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
          <h2 className="text-2xl font-bold text-paperwhite">Task Submissions</h2>
          <p className="text-teallight">Review and grade student submissions</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, email, or task..."
            className="border border-paperwhite/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite placeholder-teallight text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-paperwhite/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite text-sm"
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
      <div className="bg-paperwhite/10 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-paperwhite/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-paperwhite">{submission.taskTitle || submission.task?.title || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-trueturquoise/20 p-2 rounded-full mr-3">
                        <PersonIcon className="h-4 w-4 text-trueturquoise" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-paperwhite">
                          {submission.studentName}
                        </div>
                        <div className="text-sm text-teallight">
                          {submission.studentEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-teallight">
                      <CalendarIcon className="h-4 w-4 mr-1" />
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
                        <StarFilledIcon className="h-4 w-4 text-trueturquoise mr-1" />
                        <span className="text-sm font-medium text-paperwhite">
                          {submission.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-teallight">Not graded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSubmission(submission)}
                        className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack p-2 rounded transition-colors"
                        title="Review Submission"
                      >
                        <EyeOpenIcon className="h-4 w-4" />
                      </button>
                      {submission.liveUrl && (
                        <a
                          href={submission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-trueturquoise/20 hover:bg-trueturquoise/40 text-trueturquoise p-2 rounded transition-colors"
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
                          className="bg-trueturquoise/20 hover:bg-trueturquoise/40 text-trueturquoise p-2 rounded transition-colors"
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
            <ChatBubbleIcon className="h-12 w-12 text-teallight mx-auto mb-4" />
            <h3 className="text-lg font-medium text-paperwhite mb-2">No Submissions Found</h3>
            <p className="text-teallight">
              {filter === 'all' ? 'No submissions have been made yet.' : `No ${filter} submissions found.`}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-offblack rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-paperwhite">Review Submission</h2>
                  <p className="text-teallight">
                    {selectedSubmission.studentName} • Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-teallight mt-1">
                    <span className="font-semibold">Task:</span> {selectedSubmission.taskTitle || selectedSubmission.task?.title || '—'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-teallight hover:text-trueturquoise text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Submission Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-paperwhite mb-3">Solution Description</h3>
                    <div className="bg-paperwhite/10 rounded-lg p-4">
                      <p className="text-paperwhite/80 whitespace-pre-wrap">
                        {selectedSubmission.description}
                      </p>
                    </div>
                  </div>

                  {selectedSubmission.notes && (
                    <div>
                      <h3 className="font-semibold text-paperwhite mb-3">Additional Notes</h3>
                      <div className="bg-paperwhite/10 rounded-lg p-4">
                        <p className="text-paperwhite/80 whitespace-pre-wrap">
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
                        className="flex items-center p-3 border border-paperwhite/20 rounded-lg hover:bg-paperwhite/10 transition-colors"
                      >
                        <Link2Icon className="h-5 w-5 text-trueturquoise mr-3" />
                        <div>
                          <p className="font-medium text-paperwhite">Live Demo</p>
                          <p className="text-sm text-teallight">{selectedSubmission.liveUrl}</p>
                        </div>
                      </a>
                    )}

                    {selectedSubmission.githubUrl && (
                      <a
                        href={selectedSubmission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border border-paperwhite/20 rounded-lg hover:bg-paperwhite/10 transition-colors"
                      >
                        <CodeIcon className="h-5 w-5 text-trueturquoise mr-3" />
                        <div>
                          <p className="font-medium text-paperwhite">GitHub Repository</p>
                          <p className="text-sm text-teallight">{selectedSubmission.githubUrl}</p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Files */}
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-paperwhite mb-3">Uploaded Files</h3>
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
                            <div key={index} className="flex items-center justify-between p-3 bg-paperwhite/10 rounded-lg">
                              <div className="flex items-center">
                                <FileTextIcon className="h-4 w-4 text-teallight mr-2" />
                                <span className="text-sm text-paperwhite">{fileName}</span>
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-trueturquoise hover:text-trueturquoise/80 text-sm flex items-center"
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
                    <label className="block text-sm font-medium text-teallight mb-2">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reviewForm.score}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teallight mb-2">
                      Status
                    </label>
                    <select
                      value={reviewForm.status}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teallight mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full h-40 px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      placeholder="Provide detailed feedback on the submission..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReview}
                      className="flex-1 bg-trueturquoise text-offblack py-3 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium"
                    >
                      Save Review
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-6 py-3 border border-paperwhite/20 text-paperwhite rounded-lg hover:bg-paperwhite/10 transition-colors font-medium"
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