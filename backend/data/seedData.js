import bcrypt from 'bcryptjs';
import { USER_ROLES, CAREER_TRACKS, DIFFICULTY_LEVELS, MODULE_STATUS, TASK_STATUS, SUBMISSION_STATUS } from '../utils/constants.js';

// Test users data
export const testUsers = [
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
  },
  {
    name: 'Emily Chen',
    email: 'emily@statecollege.edu',
    password: 'password',
    role: USER_ROLES.STUDENT,
    college: 'State College',
    department: 'Data Science',
    careerTrack: CAREER_TRACKS.DATA_SCIENCE,
    level: DIFFICULTY_LEVELS.BEGINNER,
    interests: ['Data Analysis', 'Machine Learning', 'Statistics'],
    profileComplete: true,
    isActive: true,
    streakDays: 12,
    totalPoints: 800
  },
  {
    name: 'Alex Rodriguez',
    email: 'alex@designinstitute.edu',
    password: 'password',
    role: USER_ROLES.STUDENT,
    college: 'Design Institute',
    department: 'Digital Arts',
    careerTrack: CAREER_TRACKS.UI_UX,
    level: DIFFICULTY_LEVELS.BEGINNER,
    interests: ['UI Design', 'User Research', 'Prototyping'],
    profileComplete: true,
    isActive: true,
    streakDays: 5,
    totalPoints: 600
  },
  {
    name: 'Dr. Lisa Wang',
    email: 'lisa@techuniversity.edu',
    password: 'password',
    role: USER_ROLES.INSTRUCTOR,
    college: 'Tech University',
    department: 'Computer Science',
    careerTrack: CAREER_TRACKS.AI_ML,
    profileComplete: true,
    isActive: true,
    streakDays: 25,
    totalPoints: 4000
  },
  {
    name: 'David Kim',
    email: 'david@statecollege.edu',
    password: 'password',
    role: USER_ROLES.ADMIN,
    college: 'State College',
    department: 'Information Technology',
    profileComplete: true,
    isActive: true,
    streakDays: 18,
    totalPoints: 2800
  }
];

// College data
export const collegesData = [
  {
    name: 'Tech University',
    code: 'TU',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    type: 'university',
    departments: [
      { name: 'Computer Science', code: 'CS', isActive: true },
      { name: 'Information Technology', code: 'IT', isActive: true },
      { name: 'Software Engineering', code: 'SE', isActive: true },
      { name: 'Data Science', code: 'DS', isActive: true }
    ],
    settings: {
      allowStudentRegistration: true,
      requireApproval: false,
      maxStudents: 2000,
      allowSelfRegistration: true,
      requireEmailVerification: true,
      defaultCareerTrack: 'fullstack'
    },
    isActive: true,
    establishedYear: 1995,
    website: 'https://techuniversity.edu',
    logo: 'tu-logo.png'
  },
  {
    name: 'State College',
    code: 'SC',
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA'
    },
    type: 'college',
    departments: [
      { name: 'Computer Science', code: 'CS', isActive: true },
      { name: 'Information Technology', code: 'IT', isActive: true },
      { name: 'Data Science', code: 'DS', isActive: true },
      { name: 'Business Analytics', code: 'BA', isActive: true }
    ],
    settings: {
      allowStudentRegistration: true,
      requireApproval: true,
      maxStudents: 1500,
      allowSelfRegistration: false,
      requireEmailVerification: true,
      defaultCareerTrack: 'data-science'
    },
    isActive: true,
    establishedYear: 1980,
    website: 'https://statecollege.edu',
    logo: 'sc-logo.png'
  },
  {
    name: 'Design Institute',
    code: 'DI',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    type: 'institute',
    departments: [
      { name: 'Digital Arts', code: 'DA', isActive: true },
      { name: 'Graphic Design', code: 'GD', isActive: true },
      { name: 'User Experience Design', code: 'UXD', isActive: true },
      { name: 'Interactive Media', code: 'IM', isActive: true }
    ],
    settings: {
      allowStudentRegistration: true,
      requireApproval: false,
      maxStudents: 800,
      allowSelfRegistration: true,
      requireEmailVerification: true,
      defaultCareerTrack: 'ui-ux'
    },
    isActive: true,
    establishedYear: 2005,
    website: 'https://designinstitute.edu',
    logo: 'di-logo.png'
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

// Resume data
export const resumesData = [
  {
    personalInfo: {
      name: 'John Student',
      email: 'student@university.edu',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      careerTrack: CAREER_TRACKS.FULLSTACK,
      linkedin: 'https://linkedin.com/in/johnstudent',
      portfolio: 'https://johnstudent.dev'
    },
    summary: 'Passionate full-stack developer with experience in React, Node.js, and modern web technologies. Committed to creating scalable and user-friendly applications with clean code and best practices.',
    education: {
      degree: 'Bachelor of Science in Computer Science',
      school: 'Tech University',
      year: '2024',
      gpa: '3.8/4.0',
      relevantCourses: ['Web Development', 'Database Systems', 'Software Engineering', 'Data Structures']
    },
    skills: {
      technical: ['JavaScript', 'TypeScript', 'Python', 'Java'],
      frameworks: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
      tools: ['Git', 'Docker', 'AWS', 'VS Code', 'Postman'],
      languages: ['English', 'Spanish'],
      soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Time Management']
    },
    projects: [
      {
        title: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with React frontend and Node.js backend',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        liveUrl: 'https://ecommerce-demo.com',
        githubUrl: 'https://github.com/johnstudent/ecommerce',
        completedAt: new Date('2024-01-15'),
        score: 95,
        highlights: ['Implemented payment processing', 'Real-time inventory management', 'Responsive design']
      },
      {
        title: 'Task Management App',
        description: 'Created a collaborative task management application with real-time updates',
        technologies: ['React', 'Socket.io', 'Express', 'MongoDB'],
        liveUrl: 'https://task-app-demo.com',
        githubUrl: 'https://github.com/johnstudent/task-app',
        completedAt: new Date('2024-02-20'),
        score: 88,
        highlights: ['Real-time collaboration', 'Drag-and-drop interface', 'User authentication']
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023',
        credentialId: 'AWS-DEV-12345',
        url: 'https://aws.amazon.com/certification',
        skills: ['AWS', 'Cloud Computing', 'Serverless']
      },
      {
        name: 'MongoDB Developer',
        issuer: 'MongoDB University',
        date: '2023',
        credentialId: 'MDB-DEV-67890',
        url: 'https://university.mongodb.com',
        skills: ['MongoDB', 'NoSQL', 'Database Design']
      }
    ],
    experience: [
      {
        title: 'Junior Developer Intern',
        company: 'TechStart Inc.',
        location: 'San Francisco, CA',
        startDate: '2023-06',
        endDate: '2023-08',
        current: false,
        description: 'Developed and maintained web applications using React and Node.js',
        achievements: ['Reduced page load time by 40%', 'Implemented automated testing', 'Mentored new interns']
      }
    ],
    template: 'professional',
    isPublic: true,
    downloadCount: 15
  },
  {
    personalInfo: {
      name: 'Emily Chen',
      email: 'emily@statecollege.edu',
      phone: '+1 (555) 987-6543',
      location: 'Austin, TX',
      careerTrack: CAREER_TRACKS.DATA_SCIENCE,
      linkedin: 'https://linkedin.com/in/emilychen',
      portfolio: 'https://emilychen-ds.com'
    },
    summary: 'Data scientist with strong analytical skills and experience in machine learning, statistical analysis, and data visualization. Passionate about turning data into actionable insights.',
    education: {
      degree: 'Master of Science in Data Science',
      school: 'State College',
      year: '2024',
      gpa: '3.9/4.0',
      relevantCourses: ['Machine Learning', 'Statistical Analysis', 'Data Mining', 'Big Data Processing']
    },
    skills: {
      technical: ['Python', 'R', 'SQL', 'Scala'],
      frameworks: ['Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch'],
      tools: ['Jupyter', 'Tableau', 'Power BI', 'Git', 'Docker'],
      languages: ['English', 'Mandarin'],
      soft: ['Analytical Thinking', 'Problem Solving', 'Data Storytelling', 'Collaboration']
    },
    projects: [
      {
        title: 'Customer Churn Prediction',
        description: 'Developed a machine learning model to predict customer churn with 85% accuracy',
        technologies: ['Python', 'Scikit-learn', 'Pandas', 'Matplotlib'],
        liveUrl: 'https://churn-prediction-demo.com',
        githubUrl: 'https://github.com/emilychen/churn-prediction',
        completedAt: new Date('2024-01-10'),
        score: 92,
        highlights: ['Feature engineering', 'Model optimization', 'Business impact analysis']
      }
    ],
    certifications: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        date: '2023',
        credentialId: 'GOOGLE-DA-12345',
        url: 'https://coursera.org',
        skills: ['Data Analysis', 'Google Analytics', 'SQL', 'R']
      }
    ],
    experience: [
      {
        title: 'Data Analyst Intern',
        company: 'DataCorp',
        location: 'Austin, TX',
        startDate: '2023-09',
        endDate: '2023-12',
        current: false,
        description: 'Analyzed customer behavior data and created dashboards for business stakeholders',
        achievements: ['Improved data accuracy by 25%', 'Created automated reporting system', 'Presented findings to executive team']
      }
    ],
    template: 'professional',
    isPublic: true,
    downloadCount: 8
  }
];

// Enhanced progress data with realistic module and task progress
export const progressData = [
  {
    careerTrack: CAREER_TRACKS.FULLSTACK,
    overallProgress: 65,
    totalPoints: 1250,
    streakDays: 7,
    level: 'Intermediate',
    moduleProgress: [
      {
        module: 'react-fundamentals',
        status: MODULE_STATUS.COMPLETED,
        completedLessons: [
          { lessonId: 'intro-to-react', completedAt: new Date('2024-01-15') },
          { lessonId: 'components-and-jsx', completedAt: new Date('2024-01-16') },
          { lessonId: 'props-and-state', completedAt: new Date('2024-01-17') },
          { lessonId: 'react-quiz', completedAt: new Date('2024-01-18') }
        ],
        startedAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-18'),
        timeSpent: 180
      },
      {
        module: 'node-js-basics',
        status: MODULE_STATUS.IN_PROGRESS,
        completedLessons: [
          { lessonId: 'what-is-nodejs', completedAt: new Date('2024-01-20') },
          { lessonId: 'npm-and-modules', completedAt: new Date('2024-01-21') }
        ],
        startedAt: new Date('2024-01-20'),
        timeSpent: 120
      }
    ],
    taskProgress: [
      {
        task: null, // Will be set during seeding
        status: TASK_STATUS.COMPLETED,
        startedAt: new Date('2024-01-25'),
        submittedAt: new Date('2024-01-28'),
        completedAt: new Date('2024-01-30'),
        score: 95,
        attempts: 1
      },
      {
        task: null, // Will be set during seeding
        status: TASK_STATUS.IN_PROGRESS,
        startedAt: new Date('2024-02-01'),
        attempts: 0
      }
    ],
    achievements: [
      {
        id: 'first-module',
        title: 'First Module Complete',
        description: 'Completed your first learning module',
        earnedAt: new Date('2024-01-18'),
        icon: '🎯'
      },
      {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        earnedAt: new Date('2024-01-25'),
        icon: '🔥'
      }
    ],
    weeklyGoal: {
      target: 5,
      current: 3.5,
      weekStart: new Date('2024-02-05')
    }
  },
  {
    careerTrack: CAREER_TRACKS.DATA_SCIENCE,
    overallProgress: 35,
    totalPoints: 800,
    streakDays: 12,
    level: 'Beginner',
    moduleProgress: [
      {
        module: 'ds-intro',
        status: MODULE_STATUS.COMPLETED,
        completedLessons: [
          { lessonId: 'ds-lesson-1', completedAt: new Date('2024-01-10') },
          { lessonId: 'ds-lesson-2', completedAt: new Date('2024-01-12') }
        ],
        startedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-12'),
        timeSpent: 90
      }
    ],
    taskProgress: [
      {
        task: null, // Will be set during seeding
        status: TASK_STATUS.COMPLETED,
        startedAt: new Date('2024-01-15'),
        submittedAt: new Date('2024-01-18'),
        completedAt: new Date('2024-01-20'),
        score: 88,
        attempts: 1
      }
    ],
    achievements: [
      {
        id: 'first-task',
        title: 'First Task Complete',
        description: 'Successfully completed your first project task',
        earnedAt: new Date('2024-01-20'),
        icon: '✅'
      }
    ],
    weeklyGoal: {
      target: 5,
      current: 2.5,
      weekStart: new Date('2024-02-05')
    }
  },
  {
    careerTrack: CAREER_TRACKS.UI_UX,
    overallProgress: 20,
    totalPoints: 600,
    streakDays: 5,
    level: 'Beginner',
    moduleProgress: [
      {
        module: 'uiux-fundamentals',
        status: MODULE_STATUS.IN_PROGRESS,
        completedLessons: [
          { lessonId: 'uiux-intro', completedAt: new Date('2024-01-30') }
        ],
        startedAt: new Date('2024-01-30'),
        timeSpent: 45
      }
    ],
    taskProgress: [
      {
        task: null, // Will be set during seeding
        status: TASK_STATUS.IN_PROGRESS,
        startedAt: new Date('2024-02-01'),
        attempts: 0
      }
    ],
    achievements: [],
    weeklyGoal: {
      target: 5,
      current: 1.0,
      weekStart: new Date('2024-02-05')
    }
  }
];

// Submission data
export const submissionsData = [
  {
    description: 'I created a responsive personal portfolio website using HTML, CSS, and JavaScript. The website includes three main sections: About, Projects, and Contact. I implemented a clean, professional design that works well on both desktop and mobile devices. The contact form is functional and sends emails through a simple form submission.',
    liveUrl: 'https://johnstudent-portfolio.netlify.app',
    githubUrl: 'https://github.com/johnstudent/portfolio-website',
    notes: 'I focused on making the design clean and professional while ensuring good accessibility. The website is fully responsive and loads quickly.',
    files: [
      {
        filename: 'portfolio-screenshots.zip',
        originalName: 'portfolio-screenshots.zip',
        path: '/uploads/submissions/portfolio-screenshots.zip',
        size: 2048576,
        mimetype: 'application/zip'
      }
    ],
    status: SUBMISSION_STATUS.APPROVED,
    score: 95,
    feedback: 'Excellent work! The portfolio is well-designed, responsive, and professional. Great attention to detail with the contact form implementation. Consider adding more interactive elements in future iterations.',
    submittedAt: new Date('2024-01-28')
  },
  {
    description: 'I built a task management application using React with local storage for data persistence. The app includes all CRUD operations: adding, editing, deleting, and marking tasks as complete. I implemented filtering functionality to show all, active, or completed tasks. The UI is intuitive and user-friendly.',
    liveUrl: 'https://task-manager-demo.netlify.app',
    githubUrl: 'https://github.com/johnstudent/task-manager',
    notes: 'I used React hooks for state management and localStorage for data persistence. The app is fully functional and ready for production use.',
    files: [
      {
        filename: 'task-manager-demo.mp4',
        originalName: 'task-manager-demo.mp4',
        path: '/uploads/submissions/task-manager-demo.mp4',
        size: 52428800,
        mimetype: 'video/mp4'
      }
    ],
    status: SUBMISSION_STATUS.PENDING,
    submittedAt: new Date('2024-02-01')
  },
  {
    description: 'I performed exploratory data analysis on a dataset of customer transactions. I cleaned the data, handled missing values, and created visualizations to identify key patterns and insights. The analysis revealed interesting trends in customer behavior and purchasing patterns.',
    liveUrl: 'https://data-analysis-notebook.com',
    githubUrl: 'https://github.com/emilychen/customer-analysis',
    notes: 'I used Python with Pandas and Matplotlib for the analysis. The notebook includes detailed explanations of each step.',
    files: [
      {
        filename: 'customer-analysis.ipynb',
        originalName: 'customer-analysis.ipynb',
        path: '/uploads/submissions/customer-analysis.ipynb',
        size: 1048576,
        mimetype: 'application/x-ipynb+json'
      }
    ],
    status: SUBMISSION_STATUS.APPROVED,
    score: 88,
    feedback: 'Great analysis! The data cleaning process was thorough and the visualizations effectively communicate the insights. Consider adding more statistical analysis in future projects.',
    submittedAt: new Date('2024-01-18')
  }
];

export default {
  testUsers,
  collegesData,
  careerTracksData,
  modulesData,
  tasksData,
  resumeTemplatesData,
  resumesData,
  progressData,
  submissionsData
};