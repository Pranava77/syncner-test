import bcrypt from 'bcryptjs';
import { USER_ROLES, CAREER_TRACKS, DIFFICULTY_LEVELS } from '../utils/constants.js';

// Test users data
export const testUsers = [
  {
    name: 'Platform Owner',
    email: 'owner@owner.com',
    password: '123456',
    role: USER_ROLES.ADMIN,
    college: 'Syncner Platform',
    department: 'Administration',
    profileComplete: true,
    isActive: true,
    streakDays: 30,
    totalPoints: 5000
  },
  {
    name: 'John Student',
    email: 'student@university.edu',
    password: 'password',
    role: USER_ROLES.STUDENT,
    college: 'Tech University',
    department: 'Computer Science',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    level: DIFFICULTY_LEVELS.INTERMEDIATE,
    interests: ['Web Development', 'Mobile Apps', 'AI'],
    profileComplete: true,
    isActive: true,
    streakDays: 7,
    totalPoints: 1250
  },
  {
    name: 'Sarah Admin',
    email: 'admin@university.edu',
    password: 'password',
    role: USER_ROLES.ADMIN,
    college: 'Tech University',
    department: 'Computer Science',
    profileComplete: true,
    isActive: true,
    streakDays: 15,
    totalPoints: 2500
  },
  {
    name: 'Mike Instructor',
    email: 'instructor@university.edu',
    password: 'password',
    role: USER_ROLES.INSTRUCTOR,
    college: 'Tech University',
    department: 'Computer Science',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    profileComplete: true,
    isActive: true,
    streakDays: 20,
    totalPoints: 3000
  }
];

// Career tracks data
export const careerTracksData = [
  {
    id: CAREER_TRACKS.FULLSTACK,
    name: 'Full Stack Development',
    description: 'Master both frontend and backend technologies to build complete web applications',
    duration: '6-8 months',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    averageSalary: '$75,000 - $120,000',
    careerPaths: [
      'Full Stack Developer',
      'Web Developer',
      'Software Engineer',
      'Technical Lead'
    ],
    skills: [
      'JavaScript', 'React', 'Node.js', 'Express',
      'MongoDB', 'PostgreSQL', 'HTML/CSS', 'Git'
    ],
    prerequisites: [],
    isActive: true,
    order: 1
  },
  {
    id: CAREER_TRACKS.AI_ML,
    name: 'AI/ML Engineering',
    description: 'Build intelligent systems using machine learning and artificial intelligence',
    duration: '8-12 months',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    averageSalary: '$90,000 - $150,000',
    careerPaths: [
      'ML Engineer',
      'Data Scientist',
      'AI Researcher',
      'Computer Vision Engineer'
    ],
    skills: [
      'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn',
      'Pandas', 'NumPy', 'Statistics', 'Deep Learning'
    ],
    prerequisites: ['python-basics', 'statistics'],
    isActive: true,
    order: 2
  },
  {
    id: CAREER_TRACKS.UI_UX,
    name: 'UI/UX Design',
    description: 'Create beautiful and intuitive user experiences for digital products',
    duration: '4-6 months',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    averageSalary: '$60,000 - $100,000',
    careerPaths: [
      'UI Designer',
      'UX Designer',
      'Product Designer',
      'Design Systems Lead'
    ],
    skills: [
      'Figma', 'Adobe XD', 'Sketch', 'Prototyping',
      'User Research', 'Wireframing', 'Design Systems'
    ],
    prerequisites: [],
    isActive: true,
    order: 3
  },
  {
    id: CAREER_TRACKS.DATA_SCIENCE,
    name: 'Data Science',
    description: 'Extract insights from data to drive business decisions',
    duration: '6-10 months',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    averageSalary: '$80,000 - $130,000',
    careerPaths: [
      'Data Scientist',
      'Data Analyst',
      'Business Intelligence Analyst',
      'Research Scientist'
    ],
    skills: [
      'Python', 'R', 'SQL', 'Tableau',
      'Statistics', 'Machine Learning', 'Data Visualization'
    ],
    prerequisites: ['statistics', 'python-basics'],
    isActive: true,
    order: 4
  }
];

// Sample modules data
export const modulesData = [
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    description: 'Learn the core concepts of React including components, props, and state',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    duration: '2-3 weeks',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    skills: ['React', 'JavaScript', 'JSX', 'Components'],
    prerequisites: ['javascript-basics'],
    estimatedHours: 20,
    order: 1,
    isActive: true,
    lessons: [
      {
        id: 'intro-to-react',
        title: 'Introduction to React',
        type: 'video',
        duration: '45 min',
        content: 'Learn what React is and why it\'s popular for building user interfaces.',
        order: 1
      },
      {
        id: 'components-and-jsx',
        title: 'Components and JSX',
        type: 'video',
        duration: '60 min',
        content: 'Understand how to create components and write JSX.',
        order: 2
      },
      {
        id: 'props-and-state',
        title: 'Props and State',
        type: 'video',
        duration: '75 min',
        content: 'Learn how to pass data between components and manage component state.',
        order: 3
      },
      {
        id: 'react-quiz',
        title: 'React Knowledge Check',
        type: 'quiz',
        duration: '15 min',
        content: 'Test your understanding of React fundamentals.',
        order: 4
      }
    ]
  },
  {
    id: 'node-js-basics',
    title: 'Node.js Basics',
    description: 'Introduction to server-side JavaScript with Node.js',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    duration: '2-3 weeks',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    skills: ['Node.js', 'JavaScript', 'NPM', 'Express'],
    prerequisites: ['javascript-basics'],
    estimatedHours: 25,
    order: 2,
    isActive: true,
    lessons: [
      {
        id: 'what-is-nodejs',
        title: 'What is Node.js?',
        type: 'video',
        duration: '30 min',
        content: 'Introduction to Node.js and its ecosystem.',
        order: 1
      },
      {
        id: 'npm-and-modules',
        title: 'NPM and Modules',
        type: 'video',
        duration: '45 min',
        content: 'Learn about NPM package manager and Node.js modules.',
        order: 2
      },
      {
        id: 'express-framework',
        title: 'Express Framework',
        type: 'video',
        duration: '90 min',
        content: 'Build web servers with Express.js framework.',
        order: 3
      }
    ]
  },
  {
    id: 'ml-basics',
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning concepts and algorithms.',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    duration: '3 weeks',
    careerTrack: CAREER_TRACKS.AI_ML,
    skills: ['Machine Learning', 'Python'],
    prerequisites: ['python-basics'],
    estimatedHours: 25,
    order: 1,
    isActive: true,
    lessons: [
      {
        id: 'ml-intro',
        title: 'What is Machine Learning?',
        type: 'video',
        duration: '30 min',
        content: 'Overview of ML concepts.',
        order: 1
      },
      {
        id: 'ml-algorithms',
        title: 'Types of ML Algorithms',
        type: 'video',
        duration: '45 min',
        content: 'Supervised, unsupervised, and reinforcement learning.',
        order: 2
      }
    ]
  },
  {
    id: 'uiux-fundamentals',
    title: 'UI/UX Fundamentals',
    description: 'Learn the basics of user interface and user experience design.',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    duration: '2 weeks',
    careerTrack: CAREER_TRACKS.UI_UX,
    skills: ['UI Design', 'UX Research'],
    prerequisites: [],
    estimatedHours: 15,
    order: 1,
    isActive: true,
    lessons: [
      {
        id: 'uiux-intro',
        title: 'Introduction to UI/UX',
        type: 'video',
        duration: '30 min',
        content: 'What is UI/UX and why does it matter?',
        order: 1
      },
      {
        id: 'wireframing',
        title: 'Wireframing Basics',
        type: 'video',
        duration: '40 min',
        content: 'How to create wireframes for digital products.',
        order: 2
      }
    ]
  },
  {
    id: 'ds-intro',
    title: 'Introduction to Data Science',
    description: 'Learn the basics of data science, data wrangling, and visualization.',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    duration: '2 weeks',
    careerTrack: CAREER_TRACKS.DATA_SCIENCE,
    skills: ['Python', 'Pandas', 'Data Visualization'],
    prerequisites: ['python-basics'],
    estimatedHours: 15,
    order: 1,
    isActive: true,
    lessons: [
      {
        id: 'ds-lesson-1',
        title: 'Data Science Overview',
        type: 'video',
        duration: '30 min',
        content: 'What is data science?',
        order: 1
      },
      {
        id: 'ds-lesson-2',
        title: 'Data Wrangling',
        type: 'video',
        duration: '45 min',
        content: 'Cleaning and preparing data for analysis.',
        order: 2
      }
    ]
  }
];

// Sample tasks data
export const tasksData = [
  {
    title: 'Personal Portfolio Website',
    description: 'Create a responsive personal portfolio website showcasing your skills and projects',
    category: 'frontend',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    points: 100,
    estimatedTime: '3-5 hours',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    requirements: [
      'Responsive design that works on mobile and desktop',
      'At least 3 sections: About, Projects, Contact',
      'Clean and professional styling',
      'Working contact form or contact information'
    ],
    deliverables: [
      'Live website URL',
      'Source code repository',
      'Screenshots of mobile and desktop views'
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    resources: [
      'MDN Web Docs - HTML/CSS',
      'CSS Grid and Flexbox guides',
      'Free hosting platforms: Netlify, Vercel'
    ],
    isActive: true,
    order: 1
  },
  {
    title: 'Task Management Application',
    description: 'Build a full-featured task management app with CRUD operations',
    category: 'fullstack',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    points: 200,
    estimatedTime: '8-12 hours',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    requirements: [
      'Add, edit, delete, and mark tasks as complete',
      'Filter tasks by status (all, active, completed)',
      'Persistent data storage (localStorage or database)',
      'Clean and intuitive user interface'
    ],
    deliverables: [
      'Working application with all CRUD features',
      'Source code with clear documentation',
      'Demo video showing all features'
    ],
    skills: ['React', 'JavaScript', 'State Management', 'Local Storage'],
    resources: [
      'React Documentation',
      'State management patterns',
      'Local storage API guide'
    ],
    isActive: true,
    order: 2
  },
  {
    title: 'RESTful API Development',
    description: 'Create a RESTful API for a blog application with authentication',
    category: 'backend',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    points: 300,
    estimatedTime: '12-16 hours',
    careerTrack: CAREER_TRACKS.FULLSTACK,
    requirements: [
      'CRUD operations for blog posts',
      'User authentication and authorization',
      'Input validation and error handling',
      'API documentation',
      'Database integration'
    ],
    deliverables: [
      'Deployed API with all endpoints working',
      'API documentation (Postman collection or similar)',
      'Source code repository',
      'Database schema documentation'
    ],
    skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'API Design'],
    resources: [
      'Express.js documentation',
      'MongoDB tutorials',
      'JWT authentication guide',
      'API design best practices'
    ],
    isActive: true,
    order: 3
  },
  {
    title: 'Build a Linear Regression Model',
    description: 'Implement a linear regression model from scratch using Python.',
    category: 'data',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    points: 120,
    estimatedTime: '4-6 hours',
    careerTrack: CAREER_TRACKS.AI_ML,
    requirements: [
      'Load and preprocess a dataset',
      'Implement linear regression logic',
      'Evaluate model performance'
    ],
    deliverables: [
      'Python script or notebook',
      'Performance metrics',
      'Short report'
    ],
    skills: ['Python', 'Numpy', 'Machine Learning'],
    resources: [
      'Scikit-learn documentation',
      'Intro to ML videos'
    ],
    isActive: true,
    order: 1
  },
  {
    title: 'Design a Mobile App Wireframe',
    description: 'Create a wireframe for a mobile app using Figma or Sketch.',
    category: 'design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    points: 80,
    estimatedTime: '2-4 hours',
    careerTrack: CAREER_TRACKS.UI_UX,
    requirements: [
      'Design at least 3 screens (Home, Profile, Settings)',
      'Use consistent spacing and typography',
      'Export wireframe as PDF or image'
    ],
    deliverables: [
      'Wireframe file (Figma/Sketch)',
      'Exported PDF or image',
      'Short design rationale'
    ],
    skills: ['Figma', 'Sketch', 'Wireframing'],
    resources: [
      'Figma tutorials',
      'Mobile design best practices'
    ],
    isActive: true,
    order: 1
  },
  {
    title: 'Analyze a Dataset',
    description: 'Perform exploratory data analysis on a real-world dataset.',
    category: 'data',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    points: 100,
    estimatedTime: '3-5 hours',
    careerTrack: CAREER_TRACKS.DATA_SCIENCE,
    requirements: [
      'Load a dataset',
      'Clean and preprocess data',
      'Visualize key insights'
    ],
    deliverables: [
      'Jupyter notebook',
      'Summary report'
    ],
    skills: ['Python', 'Pandas', 'Matplotlib'],
    resources: [
      'Kaggle datasets',
      'Pandas documentation'
    ],
    isActive: true,
    order: 1
  }
];

// Fix categories for AI/ML, UI/UX, Data Science tasks
for (const task of tasksData) {
  if (task.careerTrack === CAREER_TRACKS.AI_ML || task.careerTrack === CAREER_TRACKS.DATA_SCIENCE) {
    task.category = 'data';
  }
  if (task.careerTrack === CAREER_TRACKS.UI_UX) {
    task.category = 'design';
  }
}

// Ensure modules and tasks are assigned to the correct careerTrack
for (const module of modulesData) {
  if (!module.careerTrack) {
    module.careerTrack = CAREER_TRACKS.FULLSTACK;
  }
}
for (const task of tasksData) {
  if (!task.careerTrack) {
    task.careerTrack = CAREER_TRACKS.FULLSTACK;
  }
}

// Add sample resume templates for each career track
export const resumeTemplatesData = [
  {
    careerTrack: CAREER_TRACKS.FULLSTACK,
    template: 'fullstack-template-1',
    sections: ['Education', 'Projects', 'Skills', 'Experience']
  },
  {
    careerTrack: CAREER_TRACKS.AI_ML,
    template: 'ai-ml-template-1',
    sections: ['Education', 'ML Projects', 'Skills', 'Certifications']
  },
  {
    careerTrack: CAREER_TRACKS.UI_UX,
    template: 'ui-ux-template-1',
    sections: ['Education', 'Design Projects', 'Skills', 'Portfolio']
  },
  {
    careerTrack: CAREER_TRACKS.DATA_SCIENCE,
    template: 'data-science-template-1',
    sections: ['Education', 'Data Projects', 'Skills', 'Certifications']
  }
];

export default {
  testUsers,
  careerTracksData,
  modulesData,
  tasksData,
  resumeTemplatesData
};