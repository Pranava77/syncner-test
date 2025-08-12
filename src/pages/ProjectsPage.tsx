import React, { useState } from 'react';

const projects = [
  {
    id: 1,
    title: 'Personal Portfolio Website',
    description: 'Create a personal portfolio using React and Tailwind CSS to showcase your projects and skills.',
    points: 100,
    difficulty: 'Beginner',
    status: 'In-progress',
    optional: false,
    selected: true,
    details: 'This project will help you build a personal brand and demonstrate your skills to potential employers. Include sections for About, Projects, Contact, and a blog if you wish.'
  },
  {
    id: 2,
    title: 'E-commerce Product Page',
    description: 'Build a responsive product page for an e-commerce site with cart functionality.',
    points: 150,
    difficulty: 'Intermediate',
    status: 'Not Started',
    optional: false,
    selected: false,
    details: 'Focus on product images, details, price, and add-to-cart functionality. Responsive design is a must.'
  },
  {
    id: 3,
    title: 'Chat Application',
    description: 'Develop a real-time chat app using Socket.io and Node.js.',
    points: 200,
    difficulty: 'Intermediate',
    status: 'Not Started',
    optional: false,
    selected: false,
    details: 'Implement user authentication, real-time messaging, and chat rooms. Bonus: add emojis or file sharing.'
  },
  {
    id: 4,
    title: 'Blog Platform (Optional)',
    description: 'Create a full-stack blog platform with authentication and markdown support.',
    points: 250,
    difficulty: 'Hard',
    status: 'Not Started',
    optional: true,
    selected: false,
    details: 'Allow users to register, write, edit, and delete posts. Support markdown formatting and comments.'
  },
  {
    id: 5,
    title: 'AI Image Generator (Optional)',
    description: 'Build an app that generates images from text prompts using an AI API.',
    points: 500,
    difficulty: 'Extreme',
    status: 'Not Started',
    optional: true,
    selected: false,
    details: 'Integrate with an AI image generation API. Let users enter prompts and display generated images.'
  },
];

const statusColor = (status: string) => {
  if (status === 'In-progress') return 'text-trueturquoise';
  return 'text-teallight';
};

const ProjectsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [submission, setSubmission] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const openModal = (project: typeof projects[0]) => {
    setSelectedProject(project);
    setModalOpen(true);
    setSubmission('');
    setSubmitted(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
    setSubmission('');
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // No backend, just show a success message or clear field
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-12"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`rounded-xl border transition-all shadow-lg flex flex-col justify-between p-6 group
              ${project.selected ? 'border-2 border-trueturquoise' : 'hover:scale-[1.025] hover:shadow-xl'}
            `}
            style={{
              backgroundColor: project.selected 
                ? 'var(--color-accent-tertiary)' 
                : 'var(--color-surface)',
              borderColor: project.selected 
                ? 'var(--color-accent-primary)' 
                : 'var(--color-border)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-teallight font-medium">
                {project.optional ? '(optional)' : ''}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${statusColor(project.status)}`}>{project.status}</span>
            </div>
            <h2 
              className="text-xl font-bold mb-1 leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {project.title}
            </h2>
            <p 
              className="text-sm mb-4 leading-relaxed"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {project.description}
            </p>
            <div className="flex items-center justify-between text-sm mb-6">
              <span className="font-semibold text-trueturquoise">Points: {project.points}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold uppercase tracking-wide">{project.difficulty}</span>
            </div>
            <button
              className="mt-auto bg-trueturquoise text-offblack px-6 py-2 rounded-lg font-bold shadow hover:bg-teallight transition-colors"
              onClick={() => openModal(project)}
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-offblack rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-paperwhite/20">
            <button
              className="absolute top-4 right-4 text-paperwhite hover:text-trueturquoise text-xl font-bold"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-paperwhite mb-2">{selectedProject.title}</h2>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xs px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold uppercase tracking-wide">{selectedProject.difficulty}</span>
              <span className="text-xs font-semibold text-trueturquoise">Points: {selectedProject.points}</span>
              <span className={`text-xs font-semibold ${statusColor(selectedProject.status)}`}>{selectedProject.status}</span>
            </div>
            <p className="text-teallight mb-4 text-sm leading-relaxed">{selectedProject.description}</p>
            <div className="mb-6 text-paperwhite/80 text-sm leading-relaxed">{selectedProject.details}</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-paperwhite text-sm font-medium" htmlFor="submission">Submission Link (e.g., GitHub):</label>
              <input
                id="submission"
                type="url"
                className="bg-paperwhite/10 border border-paperwhite/20 rounded-lg px-4 py-2 text-paperwhite focus:outline-none focus:ring-2 focus:ring-trueturquoise"
                placeholder="https://github.com/your-repo"
                value={submission}
                onChange={e => setSubmission(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-trueturquoise text-offblack px-6 py-2 rounded-lg font-bold shadow hover:bg-teallight transition-colors"
              >
                Submit
              </button>
              {submitted && <div className="text-trueturquoise font-semibold text-center">Submission received!</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 