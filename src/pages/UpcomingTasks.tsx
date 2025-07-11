import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { fetchUpcomingTasks } from '../redux/slices/upcomingTasksSlice';
import { useTasks } from '../hooks/useTasks';
import { CalendarIcon, ClockIcon, StarFilledIcon, PaperPlaneIcon, FileTextIcon, CodeIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
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

  if (loading || isSubmitting) {
    return <LoadingScreen message={isSubmitting ? "Submitting your task..." : "Loading upcoming tasks..."} />;
  }

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-paper-white dark:bg-offblack min-h-screen transition-colors">
      <h2 className="text-3xl font-bold mb-6 text-offblack dark:text-paper-white">Upcoming Tasks</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-teal-light">No upcoming tasks!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task: any) => {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = due && due < new Date();
            const isDueSoon = due && due > new Date() && (due.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
            const statusColor = isOverdue
              ? 'bg-rust/10 text-rust border border-rust/40'
              : isDueSoon
                ? 'bg-teal-light/20 text-teal-light border border-teal-light/40'
                : 'bg-true-turquoise/10 text-true-turquoise border border-true-turquoise/40';
            const categoryIcon = task.category === 'frontend' ? <CodeIcon className="h-5 w-5 text-true-turquoise" /> : <FileTextIcon className="h-5 w-5 text-teal-light" />;
            return (
              <div key={task.id} className={`bg-paper-white dark:bg-offblack p-6 rounded-2xl shadow-xl border transition-all ${statusColor} hover:shadow-2xl hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 mb-2">
                  {categoryIcon}
                  <div className="font-semibold text-lg text-offblack dark:text-paper-white">{task.title}</div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${statusColor} transition-colors`}>{task.status || (isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Not Started')}</span>
                </div>
                <div className="text-offblack/80 dark:text-paper-white/80 mb-2">{task.description}</div>
                <div className="flex flex-wrap gap-3 text-sm text-offblack/70 dark:text-paper-white/70">
                  <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> Due: {due ? due.toLocaleDateString() : '\u2014'}</span>
                  <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {task.estimatedTime}</span>
                  <span className="flex items-center gap-1"><StarFilledIcon className="h-4 w-4 text-yellow-500" /> {task.points} pts</span>
                  <span className="flex items-center gap-1"><ExclamationTriangleIcon className="h-4 w-4 text-rust" /> {task.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.skills && task.skills.map((skill: string) => (
                    <span key={skill} className="bg-true-turquoise/10 text-true-turquoise px-2 py-1 rounded text-xs">{skill}</span>
                  ))}
                </div>
                <button
                  className="mt-4 bg-true-turquoise text-paper-white py-2 rounded-lg hover:bg-teal-light hover:text-offblack transition-colors font-medium flex items-center justify-center shadow-sm"
                  onClick={() => { setSelectedTask(task); setShowModal(true); }}
                >
                  <PaperPlaneIcon className="h-4 w-4 mr-2" /> Submit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for submission */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50">
          <div className="bg-paper-white dark:bg-offblack p-8 rounded-2xl shadow-2xl w-full max-w-lg relative border border-true-turquoise transition-all">
            <button
              className="absolute top-3 right-3 text-offblack/40 hover:text-true-turquoise text-2xl transition-colors"
              onClick={closeModal}
              aria-label="Close modal"
            >
              \u00d7
            </button>
            <h3 className="text-2xl font-bold mb-4 text-offblack dark:text-paper-white">Submit Task: <span className="text-true-turquoise">{selectedTask.title}</span></h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1 text-offblack dark:text-paper-white">Description <span className="text-rust">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                  rows={3}
                  placeholder="Describe your solution, approach, and any challenges you faced..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-offblack dark:text-paper-white">Live URL</label>
                  <input
                    name="liveUrl"
                    value={form.liveUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                    type="url"
                    placeholder="https://your-demo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-offblack dark:text-paper-white">GitHub URL</label>
                  <input
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                    type="url"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-offblack dark:text-paper-white">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-true-turquoise/30 rounded-lg bg-paper-white dark:bg-offblack text-offblack dark:text-paper-white focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                  rows={2}
                  placeholder="Any additional information, challenges faced, or future improvements..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-offblack dark:text-paper-white">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-offblack dark:text-paper-white border border-true-turquoise/30 rounded-lg cursor-pointer bg-paper-white dark:bg-offblack focus:ring-2 focus:ring-true-turquoise focus:border-true-turquoise transition"
                />
                {form.files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-teal-light/10 p-2 rounded">
                        <span className="text-xs text-offblack dark:text-paper-white">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button type="button" className="text-rust ml-2" onClick={() => handleRemoveFile(idx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {submitError && <div className="text-rust text-sm">{submitError}</div>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-true-turquoise text-paper-white py-2 rounded-lg hover:bg-teal-light hover:text-offblack disabled:opacity-50 font-semibold flex items-center justify-center mt-2 transition shadow-sm"
              >
                <span className="flex items-center"><PaperPlaneIcon className="h-4 w-4 mr-2" />Submit Task</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;