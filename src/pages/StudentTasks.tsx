import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchSubmissions } from '../redux/slices/submissionsSlice';
import { FileText, CheckCircle, Clock, Star, Eye, AlertCircle } from 'lucide-react';

const StudentSubmissions: React.FC = () => {
  const dispatch = useAppDispatch();
  const submissionsState = useAppSelector((state) => state.submissions);

  useEffect(() => {
    if ((!submissionsState.data || submissionsState.data.length === 0) || submissionsState.lastFetched === null) {
      dispatch(fetchSubmissions());
    }
  }, [dispatch]);

  const submissions = submissionsState.data || [];
  const loading = submissionsState.loading;
  const error = submissionsState.error;

  const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null);

  // Use only backend data:
  const submissionsToShow = submissions;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-[var(--brand-bg)] min-h-[80vh] rounded-xl shadow-xl transition-colors">
      <h2 className="text-3xl font-bold mb-6 text-[var(--brand-text)]">My Submissions</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
        </div>
      ) : error ? (
        <div className="text-[var(--brand-danger)] text-center py-8">{error}</div>
      ) : submissionsToShow.length === 0 ? (
        <div className="text-center py-12 text-[var(--brand-primary)]">No submissions yet!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {submissionsToShow.map(sub => {
            const statusColor = sub.status === 'Reviewed' || sub.status === 'reviewed'
              ? 'bg-[var(--brand-info-bg)] text-[var(--brand-info)]'
              : sub.status === 'Submitted' || sub.status === 'submitted'
                ? 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)]'
                : sub.status === 'Rejected' || sub.status === 'rejected'
                  ? 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)]'
                  : 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]';
            const statusIcon = sub.status === 'Reviewed' || sub.status === 'reviewed'
              ? <Eye className="h-4 w-4" />
              : sub.status === 'Submitted' || sub.status === 'submitted'
                ? <Clock className="h-4 w-4" />
                : sub.status === 'Rejected' || sub.status === 'rejected'
                  ? <AlertCircle className="h-4 w-4" />
                  : <CheckCircle className="h-4 w-4" />;
            return (
              <div key={sub.id} className="bg-[var(--brand-bg-alt)] rounded-xl shadow p-6 flex flex-col gap-3 border border-[var(--brand-bg)] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-[var(--brand-accent)]" />
                  <div className="font-semibold text-lg text-[var(--brand-text)]">{sub.taskTitle}</div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor}`}>{statusIcon}<span>{sub.status}</span></span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[var(--brand-primary)]">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {sub.score !== undefined ? sub.score + '/100' : 'Not graded'}</span>
                </div>
                <div className="truncate text-[var(--brand-text)]">Feedback: {sub.feedback || 'No feedback yet'}</div>
                <button
                  className="mt-2 bg-[var(--brand-primary)] text-white py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--brand-bg-alt)] p-8 rounded-xl shadow-xl w-full max-w-lg relative border border-[var(--brand-bg)] transition-colors">
            <button
              className="absolute top-3 right-3 text-[var(--brand-text)] hover:text-[var(--brand-primary)] text-2xl"
              onClick={() => setSelectedSubmission(null)}
            >
              ×
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--brand-text)]">Submission Details</h3>
            <div className="mb-4">
              <div className="font-semibold text-lg text-[var(--brand-text)] mb-1">{selectedSubmission.taskTitle}</div>
              <div className="flex flex-wrap gap-3 text-sm text-[var(--brand-primary)] mb-2">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : '—'}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {selectedSubmission.score !== undefined ? selectedSubmission.score + '/100' : 'Not graded'}</span>
                <span className="flex items-center gap-1"><FileText className="h-4 w-4 text-[var(--brand-accent)]" /> Status: {selectedSubmission.status}</span>
                {selectedSubmission.reviewedAt && (
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4 text-[var(--brand-info)]" /> Reviewed: {new Date(selectedSubmission.reviewedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-[var(--brand-text)]">Description:</span>
                <div className="text-[var(--brand-text)] whitespace-pre-wrap">{selectedSubmission.description}</div>
              </div>
              {selectedSubmission.notes && (
                <div className="mb-2">
                  <span className="font-semibold text-[var(--brand-text)]">Notes:</span>
                  <div className="text-[var(--brand-text)] whitespace-pre-wrap">{selectedSubmission.notes}</div>
                </div>
              )}
              {selectedSubmission.liveUrl && (
                <div className="mb-2">
                  <span className="font-semibold text-[var(--brand-text)]">Live Demo:</span>
                  <a href={selectedSubmission.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] underline ml-2">{selectedSubmission.liveUrl}</a>
                </div>
              )}
              {selectedSubmission.githubUrl && (
                <div className="mb-2">
                  <span className="font-semibold text-[var(--brand-text)]">GitHub:</span>
                  <a href={selectedSubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-accent)] underline ml-2">{selectedSubmission.githubUrl}</a>
                </div>
              )}
              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div className="mb-2">
                  <span className="font-semibold text-[var(--brand-text)]">Files:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedSubmission.files.map((file: any, idx: number) => {
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
                        <li key={idx}>
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] underline flex items-center gap-1">
                            <FileText className="h-4 w-4" /> {fileName}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="text-[var(--brand-text)] mb-2"><span className="font-semibold text-[var(--brand-text)]">Feedback:</span> {selectedSubmission.feedback || 'No feedback yet'}</div>
            </div>
            <button
              className="w-full bg-[var(--brand-primary)] text-white py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium"
              onClick={() => setSelectedSubmission(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions; 