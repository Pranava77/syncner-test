import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Module from '../models/Module.js';
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

const tracks = [
  { id: 'fullstack', name: 'Full Stack Development' },
  { id: 'ai-ml', name: 'AI/ML Engineering' },
  { id: 'ui-ux', name: 'UI/UX Design' },
  { id: 'data-science', name: 'Data Science' },
];

const now = new Date();
const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

const sampleAdmins = [
  {
    name: 'Alice Admin',
    email: 'alice.admin@example.com',
    password: 'AdminPass123',
    college: 'Tech University',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Bob Admin',
    email: 'bob.admin@example.com',
    password: 'AdminPass456',
    college: 'Tech University',
    role: 'admin',
    isActive: true
  }
];

const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

const seedData = async () => {
  try {
    await connectDB();
    await Module.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Hash admin passwords
    const hashedAdmins = await Promise.all(sampleAdmins.map(async admin => ({
      ...admin,
      password: await hashPassword(admin.password)
    })));
    // Create admins
    const createdAdmins = await User.insertMany(hashedAdmins);
    console.log(`Created ${createdAdmins.length} admins`);

    let allStudents = [];
    let allModules = [];

    for (const [trackIdx, track] of tracks.entries()) {
      // Create 2 students per track with realistic data
      const studentTemplates = [
        {
          name: `${track.name} Student 1`,
          email: `${track.id}.student1@example.com`,
          password: 'StudentPass123',
          college: 'Tech University',
          role: 'student',
          careerTrack: track.id,
          isActive: true,
          profileComplete: true,
          phone: `+91-9000${trackIdx}001`,
          location: 'Bangalore',
          gpa: (8.0 + trackIdx * 0.2).toFixed(2),
          github: `${track.id}student1`,
        },
        {
          name: `${track.name} Student 2`,
          email: `${track.id}.student2@example.com`,
          password: 'StudentPass456',
          college: 'Tech University',
          role: 'student',
          careerTrack: track.id,
          isActive: true,
          profileComplete: true,
          phone: `+91-9000${trackIdx}002`,
          location: 'Bangalore',
          gpa: (8.2 + trackIdx * 0.2).toFixed(2),
          github: `${track.id}student2`,
        }
      ];
      // Hash student passwords
      const studentsWithHashed = await Promise.all(studentTemplates.map(async s => ({
        ...s,
        password: await hashPassword(s.password)
      })));
      const students = await User.insertMany(studentsWithHashed);
      allStudents = allStudents.concat(students);

      // Create 2 modules per track with realistic skills/lessons
      const modules = await Module.insertMany([
        {
          id: `module_${track.id}_1`,
          title: `${track.name} Module 1`,
          description: `Introductory module for ${track.name}`,
          difficulty: 'Beginner',
          duration: '3 hours',
          careerTrack: track.id,
          skills: [
            track.id === 'ai-ml' ? 'Python' : track.id === 'fullstack' ? 'JavaScript' : 'Design Basics',
            'Problem Solving'
          ],
          prerequisites: [],
          lessons: [
            {
              id: `lesson_${track.id}_1_1`,
              title: 'Lesson 1',
              type: 'reading',
              duration: '45 minutes',
              content: 'Lesson 1 content',
              order: 1
            }
          ],
          order: 1,
          isActive: true,
          estimatedHours: 3
        },
        {
          id: `module_${track.id}_2`,
          title: `${track.name} Module 2`,
          description: `Advanced module for ${track.name}`,
          difficulty: 'Intermediate',
          duration: '4 hours',
          careerTrack: track.id,
          skills: [
            track.id === 'ai-ml' ? 'TensorFlow' : track.id === 'fullstack' ? 'Node.js' : 'UI Prototyping',
            'Collaboration'
          ],
          prerequisites: [],
          lessons: [
            {
              id: `lesson_${track.id}_2_1`,
              title: 'Lesson 2',
              type: 'video',
              duration: '60 minutes',
              videoUrl: 'https://youtube.com/',
              content: 'Video lesson content',
              order: 1
            }
          ],
          order: 2,
          isActive: true,
          estimatedHours: 4
        }
      ]);
      allModules = allModules.concat(modules);
    }

    console.log('Created modules and students for all tracks');
    console.log('Sample data seeded successfully!');

    // Enhance demo data
    await enhanceDemoData();

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

async function enhanceDemoData() {
  // Get all students
  const students = await User.find({ role: 'student' });
  const now = new Date();
  for (let i = 0; i < students.length; i++) {
    // Set lastActive to today or recent days
    students[i].lastActive = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    await students[i].save();
  }
  console.log('Enhanced demo data for analytics!');
}

seedData(); 