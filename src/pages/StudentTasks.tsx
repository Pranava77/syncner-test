import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchSubmissions } from '../redux/slices/submissionsSlice';
import { FileTextIcon, CheckCircledIcon, ClockIcon, EyeOpenIcon, ExclamationTriangleIcon, StarFilledIcon } from '@radix-ui/react-icons';
import LoadingScreen from '../components/LoadingScreen';

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

  if (loading) return <LoadingScreen message="Loading submissions..." />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-paper-white dark:bg-offblack min-h-screen transition-colors">
      <h2 className="text-3xl font-bold mb-6 text-offblack dark:text-paper-white">My Submissions</h2>
      {submissionsToShow.length === 0 ? (
        <div className="text-center py-12 text-teal-light">No submissions yet!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {submissionsToShow.map(sub => {
            const statusColor = sub.status === 'Reviewed' || sub.status === 'reviewed'
              ? 'bg-true-turquoise/10 text-true-turquoise border border-true-turquoise'
              : sub.status === 'Submitted' || sub.status === 'submitted'
                ? 'bg-teal-light/20 text-teal-light border border-teal-light'
                : sub.status === 'Rejected' || sub.status === 'rejected'
                  ? 'bg-rust/10 text-rust border border-rust'
                  : 'bg-green-100 text-green-700 border border-green-200';
            const statusIcon = sub.status === 'Reviewed' || sub.status === 'reviewed'
              ? <EyeOpenIcon className="h-4 w-4" />
              : sub.status === 'Submitted' || sub.status === 'submitted'
                ? <ClockIcon className="h-4 w-4" />
                : sub.status === 'Rejected' || sub.status === 'rejected'
                  ? <ExclamationTriangleIcon className="h-4 w-4" />
                  : <CheckCircledIcon className="h-4 w-4" />;
            return (
              <div key={sub.id} className={`bg-paper-white dark:bg-offblack rounded-2xl shadow-xl p-6 flex flex-col gap-3 border transition-all ${statusColor} hover:shadow-2xl hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 mb-2">
                  <FileTextIcon className="h-5 w-5 text-true-turquoise" />
                  <div className="font-semibold text-lg text-offblack dark:text-paper-white">{sub.taskTitle}</div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor} transition-colors`}>{statusIcon}<span>{sub.status}</span></span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-offblack/70 dark:text-paper-white/70">
                  <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '\u2014'}</span>
                  <span className="flex items-center gap-1"><StarFilledIcon className="h-4 w-4 text-yellow-500" /> {sub.score !== undefined ? sub.score + '/100' : 'Not graded'}</span>
                </div>
                <div className="truncate text-offblack/80 dark:text-paper-white/80">Feedback: {sub.feedback || 'No feedback yet'}</div>
                <button
                  className="mt-2 bg-true-turquoise text-paper-white py-2 rounded-lg hover:bg-teal-light hover:text-offblack transition-colors font-medium flex items-center justify-center shadow-sm"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <EyeOpenIcon className="h-4 w-4 mr-2" /> View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50 transition-all">
          <div className="bg-paper-white dark:bg-offblack p-8 rounded-2xl shadow-2xl w-full max-w-lg relative border border-true-turquoise transition-all">
            <button
              className="absolute top-3 right-3 text-offblack/40 hover:text-true-turquoise text-2xl transition-colors"
              onClick={() => setSelectedSubmission(null)}
            >
              \u00d7
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-offblack dark:text-paper-white">Submission Details</h3>
            <div className="mb-4">
              <div className="font-semibold text-lg text-offblack dark:text-paper-white mb-1">{selectedSubmission.taskTitle}</div>
              <div className="flex flex-wrap gap-3 text-sm text-offblack/70 dark:text-paper-white/70 mb-2">
                <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : '\u2014'}</span>
                <span className="flex items-center gap-1"><StarFilledIcon className="h-4 w-4 text-yellow-500" /> {selectedSubmission.score !== undefined ? selectedSubmission.score + '/100' : 'Not graded'}</span>
                <span className="flex items-center gap-1"><FileTextIcon className="h-4 w-4 text-true-turquoise" /> Status: {selectedSubmission.status}</span>
                {selectedSubmission.reviewedAt && (
                  <span className="flex items-center gap-1"><EyeOpenIcon className="h-4 w-4 text-true-turquoise" /> Reviewed: {new Date(selectedSubmission.reviewedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-offblack dark:text-paper-white">Description:</span>
                <div className="text-offblack/80 dark:text-paper-white/80 whitespace-pre-wrap">{selectedSubmission.description}</div>
              </div>
              {selectedSubmission.notes && (
                <div className="mb-2">
                  <span className="font-semibold text-offblack dark:text-paper-white">Notes:</span>
                  <div className="text-offblack/80 dark:text-paper-white/80 whitespace-pre-wrap">{selectedSubmission.notes}</div>
                </div>
              )}
              {selectedSubmission.liveUrl && (
                <div className="mb-2">
                  <span className="font-semibold text-offblack dark:text-paper-white">Live Demo:</span>
                  <a href={selectedSubmission.liveUrl} target="_blank" rel="noopener noreferrer" className="text-true-turquoise underline ml-2">{selectedSubmission.liveUrl}</a>
                </div>
              )}
              {selectedSubmission.githubUrl && (
                <div className="mb-2">
                  <span className="font-semibold text-offblack dark:text-paper-white">GitHub:</span>
                  <a href={selectedSubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-teal-light underline ml-2">{selectedSubmission.githubUrl}</a>
                </div>
              )}
              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div className="mb-2">
                  <span className="font-semibold text-offblack dark:text-paper-white">Files:</span>
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
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-true-turquoise underline flex items-center gap-1">
                            <FileTextIcon className="h-4 w-4" /> {fileName}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="text-offblack/80 dark:text-paper-white/80 mb-2"><span className="font-semibold text-offblack dark:text-paper-white">Feedback:</span> {selectedSubmission.feedback || 'No feedback yet'}</div>
            </div>
            <button
              className="w-full bg-true-turquoise text-paper-white py-2 rounded-lg hover:bg-teal-light hover:text-offblack transition-colors font-medium shadow-sm"
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