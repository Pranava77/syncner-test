import React from 'react';
import { useStudentSubmissions } from '../hooks/useTasks';

const StudentSubmissions: React.FC = () => {
  const { submissions, loading, error } = useStudentSubmissions();

  const dummySubmissions = [
    {
      id: '1',
      taskTitle: 'Portfolio Website',
      status: 'Submitted',
      score: 85,
      feedback: 'Great job! Well structured and responsive.',
      submittedAt: new Date().toISOString(),
    },
    {
      id: '2',
      taskTitle: 'Todo App with React',
      status: 'Reviewed',
      score: 92,
      feedback: 'Excellent use of hooks and clean code.',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const submissionsToShow = !loading && submissions.length === 0 ? dummySubmissions : submissions;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Submissions</h2>
      <ul>
        {submissionsToShow.map(sub => (
          <li key={sub.id} className="mb-4 p-4 border rounded">
            <div className="font-semibold">{sub.taskTitle}</div>
            <div>Status: <span className="font-medium">{sub.status}</span></div>
            <div>Score: {sub.score !== undefined ? sub.score + '/100' : 'Not graded'}</div>
            <div>Feedback: {sub.feedback || 'No feedback yet'}</div>
            <div>Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
      {submissionsToShow.length === 0 && <div>No submissions yet!</div>}
    </div>
  );
};

export default StudentSubmissions; 