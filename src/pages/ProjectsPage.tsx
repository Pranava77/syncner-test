import React from 'react';

const projects = [
  {
    id: 1,
    title: 'Build a To-do Application',
    description: 'Build a end to end To-do app in MERN Stack',
    points: 100,
    difficulty: 'Beginner',
    status: 'In-progress',
    optional: false,
    selected: true,
  },
  {
    id: 2,
    title: 'Build a To-do Application',
    description: 'Build a end to end To-do app in MERN Stack',
    points: 150,
    difficulty: 'Intermediate',
    status: 'Not Started',
    optional: false,
    selected: false,
  },
  {
    id: 3,
    title: 'Build a To-do Application',
    description: 'Build a end to end To-do app in MERN Stack',
    points: 150,
    difficulty: 'Intermediate',
    status: 'Not Started',
    optional: false,
    selected: false,
  },
  {
    id: 4,
    title: 'Build a To-do Application',
    description: 'Build a end to end To-do app in MERN Stack',
    points: 250,
    difficulty: 'Hard',
    status: 'Not Started',
    optional: true,
    selected: false,
  },
  {
    id: 5,
    title: 'Build a To-do Application',
    description: 'Build a end to end To-do app in MERN Stack',
    points: 500,
    difficulty: 'Extreme',
    status: 'Not Started',
    optional: true,
    selected: false,
  },
];

const statusColor = (status: string) => {
  if (status === 'In-progress') return 'text-trueturquoise';
  return 'text-teallight';
};

const ProjectsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-offblack w-full flex flex-col items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className={`bg-paperwhite/10 rounded-xl shadow p-6 flex flex-col justify-between border transition-all
              ${project.selected ? 'border-2 border-trueturquoise' : 'border border-paperwhite/10'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-teallight font-medium">
                {project.optional ? '(optional)' : ''}
              </span>
              <span className={`text-xs font-medium ${statusColor(project.status)}`}>{project.status}</span>
            </div>
            <div className="mb-2">
              <span className="block font-bold text-sm text-paperwhite mb-1">Project title</span>
              <h2 className="text-xl font-bold text-paperwhite mb-1">{project.title}</h2>
              <p className="text-teallight text-sm mb-2">{project.description}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-paperwhite mb-4">
              <span>Points: {project.points}</span>
              <span>{project.difficulty}</span>
            </div>
            <button className="mt-auto bg-paperwhite text-offblack px-6 py-2 rounded-lg font-medium hover:bg-trueturquoise hover:text-offblack transition-colors">View</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage; 