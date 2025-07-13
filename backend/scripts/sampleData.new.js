import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

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

const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

const seedData = async () => {
  try {
    await connectDB();
    await Admin.deleteMany({});
    await Staff.deleteMany({});
    await User.deleteMany({});
    const createdAdmins = await Admin.insertMany(sampleAdmins);
    const createdStaff = await Staff.insertMany(sampleStaff);
    // Hash student passwords
    const studentsWithHashed = await Promise.all(sampleStudents.map(async s => ({
      ...s,
      password: await hashPassword(s.password)
    })));
    const createdStudents = await User.insertMany(studentsWithHashed);
    console.log(`Seeded ${createdAdmins.length} admins, ${createdStaff.length} staff, and ${createdStudents.length} students!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 