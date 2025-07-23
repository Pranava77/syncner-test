import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Track from '../models/Track.js';
import Curriculum from '../models/Curriculum.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleAdmins = [
  {
    name: 'Alice Admin',
    email: 'alice.admin@example.com',
    department: 'Administration',
    college: 'Tech University',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Bob Admin',
    email: 'bob.admin@example.com',
    department: 'Administration',
    college: 'Tech University',
    role: 'admin',
    isActive: true
  }
];

const sampleStaff = [
  {
    name: 'Diana Staff',
    email: 'diana.staff@example.com',
    department: 'Support',
    college: 'Tech University',
    role: 'staff',
    isActive: true
  },
  {
    name: 'Ethan Staff',
    email: 'ethan.staff@example.com',
    department: 'IT',
    college: 'Tech University',
    role: 'staff',
    isActive: false
  }
];

const sampleStudents = [
  {
    name: 'Fullstack Student',
    email: 'fullstack.student@example.com',
    password: 'StudentPass123',
    role: 'student',
    college: 'Tech University',
    department: 'Computer Science',
    careerTrack: 'full-stack',
    profileComplete: true,
    isActive: true,
    phone: '+91-9000000001',
    location: 'Bangalore',
    gpa: '8.5'
  },
  {
    name: 'AI/ML Student',
    email: 'aiml.student@example.com',
    password: 'StudentPass456',
    role: 'student',
    college: 'Tech University',
    department: 'AI & ML',
    careerTrack: 'ai-ml',
    profileComplete: true,
    isActive: true,
    phone: '+91-9000000002',
    location: 'Hyderabad',
    gpa: '8.7'
  },
  {
    name: 'UI/UX Student',
    email: 'uiux.student@example.com',
    password: 'StudentPass789',
    role: 'student',
    college: 'Tech University',
    department: 'Design',
    careerTrack: 'ui-ux',
    profileComplete: true,
    isActive: true,
    phone: '+91-9000000003',
    location: 'Delhi',
    gpa: '8.9'
  },
  {
    name: 'Data Science Student',
    email: 'datascience.student@example.com',
    password: 'StudentPass321',
    role: 'student',
    college: 'Tech University',
    department: 'Data Science',
    careerTrack: 'data-science',
    profileComplete: true,
    isActive: true,
    phone: '+91-9000000004',
    location: 'Mumbai',
    gpa: '9.0'
  }
];

const sampleTracks = [
  {
    name: 'Full Stack Development',
    description: 'Learn to build complete web applications using front-end and back-end technologies.',
    duration: '6 months',
    difficulty: 'beginner',
    averageSalary: '₹8,00,000',
    careerPaths: ['Web Developer', 'Backend Developer', 'Frontend Developer'],
    skills: ['JavaScript', 'Node.js', 'React', 'Databases'],
    prerequisites: [],
    isActive: true,
    order: 1
  },
  {
    name: 'AI/ML Engineering',
    description: 'Dive into artificial intelligence and machine learning concepts and applications.',
    duration: '8 months',
    difficulty: 'intermediate',
    averageSalary: '₹12,00,000',
    careerPaths: ['ML Engineer', 'Data Scientist', 'AI Researcher'],
    skills: ['Python', 'TensorFlow', 'Machine Learning'],
    prerequisites: [],
    isActive: true,
    order: 2
  },
  {
    name: 'UI/UX Design',
    description: 'Master the art of designing user interfaces and experiences.',
    duration: '4 months',
    difficulty: 'beginner',
    averageSalary: '₹7,00,000',
    careerPaths: ['UI Designer', 'UX Researcher', 'Product Designer'],
    skills: ['Figma', 'Wireframing', 'Prototyping'],
    prerequisites: [],
    isActive: true,
    order: 3
  },
  {
    name: 'Data Science',
    description: 'Analyze and interpret complex data to help companies make decisions.',
    duration: '7 months',
    difficulty: 'intermediate',
    averageSalary: '₹10,00,000',
    careerPaths: ['Data Analyst', 'Data Scientist', 'Business Analyst'],
    skills: ['Python', 'Statistics', 'Data Visualization'],
    prerequisites: [],
    isActive: true,
    order: 4
  }
];

const sampleCurriculum = [
  // Full Stack Development - Level 1
  {
    title: 'HTML Fundamentals',
    description: 'Learn the basics of HTML markup language',
    type: 'learn',
    content: 'HTML is the standard markup language for creating web pages. Learn about elements, tags, and document structure.',
    order: 1,
    isActive: true,
    careerTrack: 'full-stack',
    difficulty: 'beginner',
    estimatedDuration: 60,
    tags: ['HTML', 'Web Development', 'Markup'],
    prerequisites: [],
    learningObjectives: ['Understand HTML structure', 'Use basic HTML tags', 'Create simple web pages'],
    metadata: {
      createdBy: null, // Will be set during seeding
      version: 1
    }
  },
  {
    title: 'HTML Quiz',
    description: 'Test your HTML knowledge',
    type: 'test',
    content: 'What does HTML stand for?',
    order: 2,
    isActive: true,
    careerTrack: 'full-stack',
    difficulty: 'beginner',
    estimatedDuration: 15,
    tags: ['HTML', 'Quiz', 'Assessment'],
    prerequisites: ['HTML Fundamentals'],
    learningObjectives: ['Assess HTML knowledge'],
    metadata: {
      createdBy: null,
      version: 1
    }
  },
  {
    title: 'Build Your First Webpage',
    description: 'Create a simple HTML webpage',
    type: 'exercise',
    content: 'Create a personal webpage using HTML with your name, bio, and favorite hobbies.',
    order: 3,
    isActive: true,
    careerTrack: 'full-stack',
    difficulty: 'beginner',
    estimatedDuration: 90,
    tags: ['HTML', 'Practice', 'Project'],
    prerequisites: ['HTML Fundamentals'],
    learningObjectives: ['Apply HTML knowledge', 'Create a complete webpage'],
    resources: [
      {
        title: 'HTML Reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        type: 'external',
        description: 'Complete HTML reference guide'
      }
    ],
    metadata: {
      createdBy: null,
      version: 1
    }
  },
  
  // AI/ML Track
  {
    title: 'Python Basics for ML',
    description: 'Learn Python fundamentals for machine learning',
    type: 'learn',
    content: 'Python is the most popular language for machine learning. Learn variables, data types, and basic operations.',
    order: 1,
    isActive: true,
    careerTrack: 'ai-ml',
    difficulty: 'beginner',
    estimatedDuration: 120,
    tags: ['Python', 'Programming', 'ML'],
    prerequisites: [],
    learningObjectives: ['Write Python code', 'Understand data types', 'Use basic operations'],
    metadata: {
      createdBy: null,
      version: 1
    }
  },
  {
    title: 'Python Quiz',
    description: 'Test your Python knowledge',
    type: 'test',
    content: 'Which Python library is most commonly used for data manipulation?',
    order: 2,
    isActive: true,
    careerTrack: 'ai-ml',
    difficulty: 'beginner',
    estimatedDuration: 15,
    tags: ['Python', 'Quiz'],
    prerequisites: ['Python Basics for ML'],
    learningObjectives: ['Assess Python knowledge'],
    metadata: {
      createdBy: null,
      version: 1
    }
  },
  
  // UI/UX Track
  {
    title: 'Design Principles',
    description: 'Learn fundamental design principles',
    type: 'learn',
    content: 'Understand the core principles of design including balance, contrast, hierarchy, and alignment.',
    order: 1,
    isActive: true,
    careerTrack: 'ui-ux',
    difficulty: 'beginner',
    estimatedDuration: 90,
    tags: ['Design', 'UI/UX', 'Principles'],
    prerequisites: [],
    learningObjectives: ['Understand design principles', 'Apply visual hierarchy', 'Create balanced layouts'],
    metadata: {
      createdBy: null,
      version: 1
    }
  },
  
  // Data Science Track
  {
    title: 'Data Analysis Fundamentals',
    description: 'Introduction to data analysis concepts',
    type: 'learn',
    content: 'Learn the basics of data analysis including data types, descriptive statistics, and data visualization.',
    order: 1,
    isActive: true,
    careerTrack: 'data-science',
    difficulty: 'beginner',
    estimatedDuration: 150,
    tags: ['Data Analysis', 'Statistics', 'Visualization'],
    prerequisites: [],
    learningObjectives: ['Understand data types', 'Calculate basic statistics', 'Create simple visualizations'],
    metadata: {
      createdBy: null,
      version: 1
    }
  }
];

const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

const seedData = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Track.deleteMany({});
    await Curriculum.deleteMany({}); // Changed from Level.deleteMany
    const createdTracks = await Track.insertMany(sampleTracks);
    // Hash admin and staff passwords
    const adminsWithHashed = await Promise.all(sampleAdmins.map(async a => ({
      ...a,
      password: await hashPassword('AdminPass123')
    })));
    const staffWithHashed = await Promise.all(sampleStaff.map(async s => ({
      ...s,
      password: await hashPassword('StaffPass123')
    })));
    const createdAdmins = await User.insertMany(adminsWithHashed);
    const createdStaff = await User.insertMany(staffWithHashed);
    // Hash student passwords
    const studentsWithHashed = await Promise.all(sampleStudents.map(async s => ({
      ...s,
      password: await hashPassword(s.password)
    })));
    const createdStudents = await User.insertMany(studentsWithHashed);
    
    // Set createdBy for curriculum items
    const adminId = createdAdmins[0]._id;
    const curriculumWithCreator = sampleCurriculum.map(item => ({
      ...item,
      metadata: {
        ...item.metadata,
        createdBy: adminId
      }
    }));
    const createdCurriculum = await Curriculum.insertMany(curriculumWithCreator);
    // Link curriculum to tracks
    for (const track of createdTracks) {
      const curriculumForTrack = createdCurriculum.filter(c => c.careerTrack === track.name.toLowerCase().replace(' ', '-'));
      track.curriculum = curriculumForTrack.map(c => c._id);
      await track.save();
    }
    console.log(`Seeded ${createdAdmins.length} admins, ${createdStaff.length} staff, ${createdStudents.length} students, ${createdTracks.length} tracks, and ${createdCurriculum.length} curriculum items!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 