import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Track from '../models/Track.js';
import Level from '../models/Level.js';

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
    isActive: true
  },
  {
    name: 'Bob Admin',
    email: 'bob.admin@example.com',
    department: 'Administration',
    isActive: true
  }
];

const sampleStaff = [
  {
    name: 'Diana Staff',
    email: 'diana.staff@example.com',
    department: 'Support',
    isActive: true
  },
  {
    name: 'Ethan Staff',
    email: 'ethan.staff@example.com',
    department: 'IT',
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
    careerTrack: 'fullstack',
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
    difficulty: 'Beginner',
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
    difficulty: 'Intermediate',
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
    difficulty: 'Beginner',
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
    difficulty: 'Intermediate',
    averageSalary: '₹10,00,000',
    careerPaths: ['Data Analyst', 'Data Scientist', 'Business Analyst'],
    skills: ['Python', 'Statistics', 'Data Visualization'],
    prerequisites: [],
    isActive: true,
    order: 4
  }
];

const sampleLevels = [
  {
    title: 'Intro to Web Development',
    description: 'Basics of HTML, CSS, and JavaScript.',
    difficulty: 'Beginner',
    duration: '2 weeks',
    careerTrack: 'fullstack',
    skills: ['HTML', 'CSS', 'JavaScript'],
    prerequisites: [],
    learn: [
      { type: 'reading', title: 'HTML Basics', content: 'Learn HTML structure.', order: 1 },
      { type: 'video', title: 'CSS Introduction', videoUrl: 'https://youtube.com/', order: 2 }
    ],
    test: [
      { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'Home Tool Markup Language'], answer: 'HyperText Markup Language', order: 1 }
    ],
    exercise: [
      { title: 'Build a simple web page', description: 'Create a basic HTML page.', resources: [], order: 1 }
    ],
    order: 1,
    isActive: true,
    estimatedHours: 20
  },
  {
    title: 'Machine Learning Foundations',
    description: 'Core ML concepts and Python libraries.',
    difficulty: 'Intermediate',
    duration: '3 weeks',
    careerTrack: 'ai-ml',
    skills: ['Python', 'Numpy', 'Pandas'],
    prerequisites: [],
    learn: [
      { type: 'reading', title: 'Intro to ML', content: 'What is Machine Learning?', order: 1 }
    ],
    test: [
      { question: 'Which library is used for data manipulation?', options: ['Numpy', 'Pandas'], answer: 'Pandas', order: 1 }
    ],
    exercise: [
      { title: 'Data Cleaning', description: 'Clean a sample dataset.', resources: [], order: 1 }
    ],
    order: 1,
    isActive: true,
    estimatedHours: 30
  },
  {
    title: 'UI/UX Principles',
    description: 'Fundamentals of user interface and experience design.',
    difficulty: 'Beginner',
    duration: '2 weeks',
    careerTrack: 'ui-ux',
    skills: ['Wireframing', 'Prototyping'],
    prerequisites: [],
    learn: [
      { type: 'reading', title: 'Wireframing Basics', content: 'Learn to wireframe.', order: 1 }
    ],
    test: [
      { question: 'What is a wireframe?', options: ['A prototype', 'A sketch of UI'], answer: 'A sketch of UI', order: 1 }
    ],
    exercise: [
      { title: 'Create a wireframe', description: 'Draw a wireframe for a login page.', resources: [], order: 1 }
    ],
    order: 1,
    isActive: true,
    estimatedHours: 15
  },
  {
    title: 'Data Analysis Basics',
    description: 'Introduction to data analysis and visualization.',
    difficulty: 'Intermediate',
    duration: '3 weeks',
    careerTrack: 'data-science',
    skills: ['Python', 'Data Visualization'],
    prerequisites: [],
    learn: [
      { type: 'reading', title: 'Data Analysis Overview', content: 'What is data analysis?', order: 1 }
    ],
    test: [
      { question: 'Which tool is used for data visualization?', options: ['Matplotlib', 'TensorFlow'], answer: 'Matplotlib', order: 1 }
    ],
    exercise: [
      { title: 'Visualize Data', description: 'Create a bar chart.', resources: [], order: 1 }
    ],
    order: 1,
    isActive: true,
    estimatedHours: 25
  }
];

const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

const seedData = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Track.deleteMany({});
    await Level.deleteMany({});
    const createdTracks = await Track.insertMany(sampleTracks);
    const createdLevels = await Level.insertMany(sampleLevels);
    // Link levels to tracks
    for (const track of createdTracks) {
      const levelsForTrack = createdLevels.filter(l => l.careerTrack === track.name);
      track.levels = levelsForTrack.map(l => l._id);
      await track.save();
    }
    const createdAdmins = await User.insertMany(sampleAdmins.map(a => ({...a, role: 'admin'})));
    const createdStaff = await User.insertMany(sampleStaff.map(s => ({...s, role: 'staff'})));
    // Hash student passwords
    const studentsWithHashed = await Promise.all(sampleStudents.map(async s => ({
      ...s,
      password: await hashPassword(s.password)
    })));
    const createdStudents = await User.insertMany(studentsWithHashed);
    console.log(`Seeded ${createdAdmins.length} admins, ${createdStaff.length} staff, ${createdStudents.length} students, ${createdTracks.length} tracks, and ${createdLevels.length} levels!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 