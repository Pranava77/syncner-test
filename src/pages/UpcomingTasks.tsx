import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import upcomingTasksReducer, { fetchUpcomingTasks } from '../redux/slices/upcomingTasksSlice';
import { useTasks } from '../hooks/useTasks';
import { Calendar, Clock, Star, Send, FileText, Code, AlertTriangle } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const UpcomingTasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const upcomingTasksState = useAppSelector((state) => state.upcomingTasks);
  const { submitTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [form, setForm] = useState({
    description: '',
    liveUrl: '',
    githubUrl: '',
    notes: '',
    files: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if ((!upcomingTasksState.data || upcomingTasksState.data.length === 0) || upcomingTasksState.lastFetched === null) {
      dispatch(fetchUpcomingTasks());
    }
  }, [dispatch]);

  const tasks = upcomingTasksState.data || [];
  const loading = upcomingTasksState.loading;
  const error = upcomingTasksState.error;

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setSubmitError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleRemoveFile = (index: number) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitTask(selectedTask.id, form);
      closeModal();
      setForm({ description: '', liveUrl: '', githubUrl: '', notes: '', files: [] });
      dispatch(fetchUpcomingTasks());
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading upcoming tasks..." showProgress={true} progressDuration={1600} />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-[var(--brand-bg)] min-h-[80vh] rounded-xl shadow-xl transition-colors">
      <h2 className="text-3xl font-bold mb-6 text-[var(--brand-text)]">Upcoming Tasks</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingScreen message="Loading upcoming tasks..." showProgress={true} progressDuration={1600} />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-[var(--brand-text)]">No upcoming tasks!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task: any) => {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = due && due < new Date();
            const isDueSoon = due && due > new Date() && (due.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
            // Update statusColor logic to use CSS variables
            const statusColor = isOverdue
              ? 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)]'
              : isDueSoon
                ? 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)]'
                : 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]';
            const categoryIcon = task.category === 'frontend' ? <Code className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-purple-500" />;
            return (
              <div key={task.id} className="bg-[var(--brand-bg-alt)] rounded-xl shadow p-6 flex flex-col gap-3 border border-[var(--brand-bg)] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  {categoryIcon}
                  <div className="font-semibold text-lg text-[var(--brand-text)]">{task.title}</div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{task.status || (isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Not Started')}</span>
                </div>
                <div className="text-[var(--brand-text)] mb-2">{task.description}</div>
                <div className="flex flex-wrap gap-3 text-sm text-[var(--brand-primary)]">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due: {due ? due.toLocaleDateString() : '—'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {task.estimatedTime}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {task.points} pts</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-[var(--brand-warning)]" /> {task.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.skills && task.skills.map((skill: string) => (
                    <span key={skill} className="bg-[var(--brand-bg)] text-[var(--brand-text)] px-2 py-1 rounded text-xs">{skill}</span>
                  ))}
                </div>
                <button
                  className="mt-4 bg-[var(--brand-primary)] text-white py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center"
                  onClick={() => { setSelectedTask(task); setShowModal(true); }}
                >
                  <Send className="h-4 w-4 mr-2" /> Submit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for submission */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--brand-bg-alt)] p-8 rounded-2xl shadow-2xl w-full max-w-lg relative border border-[var(--brand-bg)] transition-all">
            <button
              className="absolute top-3 right-3 text-[var(--brand-text)] hover:text-[var(--brand-primary)] text-2xl"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4 text-[var(--brand-text)]">Submit Task: <span className="text-[var(--brand-primary)]">{selectedTask.title}</span></h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--brand-text)]">Description <span className="text-[var(--brand-danger)]">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[var(--brand-bg-alt)] rounded-lg bg-[var(--brand-bg)] text-[var(--brand-text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition"
                  rows={3}
                  placeholder="Describe your solution, approach, and any challenges you faced..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--brand-text)]">Live URL</label>
                  <input
                    name="liveUrl"
                    value={form.liveUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--brand-bg-alt)] rounded-lg bg-[var(--brand-bg)] text-[var(--brand-text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition"
                    type="url"
                    placeholder="https://your-demo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--brand-text)]">GitHub URL</label>
                  <input
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--brand-bg-alt)] rounded-lg bg-[var(--brand-bg)] text-[var(--brand-text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition"
                    type="url"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--brand-text)]">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--brand-bg-alt)] rounded-lg bg-[var(--brand-bg)] text-[var(--brand-text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition"
                  rows={2}
                  placeholder="Any additional information, challenges faced, or future improvements..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--brand-text)]">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[var(--brand-text)] border border-[var(--brand-bg-alt)] rounded-lg cursor-pointer bg-[var(--brand-bg)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition"
                />
                {form.files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-[var(--brand-bg)] p-2 rounded">
                        <span className="text-xs text-[var(--brand-text)]">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button type="button" className="text-[var(--brand-danger)] ml-2" onClick={() => handleRemoveFile(idx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--brand-primary)] text-white py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Task'}
              </button>
              {submitError && <div className="text-[var(--brand-danger)] text-sm mt-2">{submitError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks; 