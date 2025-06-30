import React, { useState } from 'react';
import { useUpcomingTasks, useTasks } from '../hooks/useTasks';

const dummyTasks = [
  {
    id: '1',
    title: 'Build a Portfolio Website',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Create a personal portfolio using React.',
    status: 'Not Started',
    category: 'frontend',
    difficulty: 'Beginner',
    points: 100,
    estimatedTime: '8 hours',
    requirements: ['Responsive design', 'Navigation menu', 'About, Skills, Projects, Contact sections'],
    skills: ['React', 'HTML', 'CSS'],
  },
  {
    id: '2',
    title: 'Todo App with React',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Build a todo application using React.',
    status: 'Not Started',
    category: 'frontend',
    difficulty: 'Intermediate',
    points: 150,
    estimatedTime: '10 hours',
    requirements: ['Add, edit, delete todos', 'Filter by status'],
    skills: ['React', 'JavaScript'],
  },
];

const UpcomingTasks: React.FC = () => {
  const { tasks, loading, error, refetch } = useUpcomingTasks();
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

  const tasksToShow = !loading && tasks.length === 0 ? dummyTasks : tasks;

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
      await refetch();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upcoming Tasks</h2>
      <ul>
        {tasksToShow.map(task => (
          <li key={task.id} className="mb-4 p-4 border rounded">
            <div className="font-semibold">{task.title}</div>
            <div>Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}</div>
            <div>Status: <span className="font-medium">{task.status || 'Not Started'}</span></div>
            <div>{task.description}</div>
          </li>
        ))}
      </ul>
      {tasksToShow.length === 0 && <div>No upcoming tasks!</div>}

      {/* Modal for submission */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={closeModal}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4">Submit Task: {selectedTask.title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Live URL</label>
                <input
                  name="liveUrl"
                  value={form.liveUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  type="url"
                  placeholder="https://your-demo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <input
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  type="url"
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white dark:bg-gray-700 dark:text-white"
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
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks; 