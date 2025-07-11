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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Upcoming Tasks</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No upcoming tasks!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task: any) => {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = due && due < new Date();
            const isDueSoon = due && due > new Date() && (due.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
            const statusColor = isOverdue
              ? 'bg-red-100 text-red-700'
              : isDueSoon
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700';
            const categoryIcon = task.category === 'frontend' ? <CodeIcon className="h-5 w-5 text-blue-500" /> : <FileTextIcon className="h-5 w-5 text-purple-500" />;
                <div className="flex items-center gap-3 mb-2">
                  {categoryIcon}
                  <div className="font-semibold text-lg text-gray-900 dark:text-white">{task.title}</div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{task.status || (isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Not Started')}</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 mb-2">{task.description}</div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due: {due ? due.toLocaleDateString() : '—'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {task.estimatedTime}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {task.points} pts</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-orange-500" /> {task.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.skills && task.skills.map((skill: string) => (
                    <span key={skill} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs">{skill}</span>
                  ))}
                </div>
                <button
                  className="mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
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
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative border border-gray-200 dark:border-gray-700 transition-all">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Submit Task: <span className="text-blue-600 dark:text-blue-400">{selectedTask.title}</span></h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  rows={3}
                  placeholder="Describe your solution, approach, and any challenges you faced..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Live URL</label>
                  <input
                    name="liveUrl"
                    value={form.liveUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    type="url"
                    placeholder="https://your-demo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">GitHub URL</label>
                  <input
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    type="url"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  rows={2}
                  placeholder="Any additional information, challenges faced, or future improvements..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                {form.files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        <span className="text-xs text-gray-700 dark:text-gray-200">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button type="button" className="text-red-500 ml-2" onClick={() => handleRemoveFile(idx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center mt-2 transition"
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