import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Module from '../models/Module.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';

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
    await Task.deleteMany({});
    await User.deleteMany({});
    await Submission.deleteMany({});
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
    let allTasks = [];
    let allModules = [];
    let allSubmissions = [];

    for (const [trackIdx, track] of tracks.entries()) {
      // Create 2 students per track
      const studentTemplates = [
        {
          name: `${track.name} Student 1`,
          email: `${track.id}.student1@example.com`,
          password: 'StudentPass123',
          college: 'Tech University',
          role: 'student',
          careerTrack: track.id,
          isActive: true
        },
        {
          name: `${track.name} Student 2`,
          email: `${track.id}.student2@example.com`,
          password: 'StudentPass456',
          college: 'Tech University',
          role: 'student',
          careerTrack: track.id,
          isActive: true
        }
      ];
      // Hash student passwords
      const studentsWithHashed = await Promise.all(studentTemplates.map(async s => ({
        ...s,
        password: await hashPassword(s.password)
      })));
      const students = await User.insertMany(studentsWithHashed);
      allStudents = allStudents.concat(students);

      // Create 2 modules per track
      const modules = await Module.insertMany([
        {
          id: `module_${track.id}_1`,
          title: `${track.name} Module 1`,
          description: `Introductory module for ${track.name}`,
          difficulty: 'Beginner',
          duration: '3 hours',
          careerTrack: track.id,
          skills: ['Skill A', 'Skill B'],
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
          skills: ['Skill C', 'Skill D'],
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

      // Create 2 tasks per track, assigned to both students and the track
      const tasks = await Task.insertMany([
        {
          title: `${track.name} Task 1`,
          description: `First task for ${track.name}`,
          category: trackIdx % 2 === 0 ? 'frontend' : 'backend',
          difficulty: 'Beginner',
          points: 100 + trackIdx * 10,
          careerTrack: track.id,
          requirements: ['Requirement 1', 'Requirement 2'],
          deliverables: ['Deliverable 1'],
          skills: ['Skill X'],
          estimatedTime: '5 hours',
          isActive: true,
          order: 1,
          dueDate: futureDate(3 + trackIdx),
          createdBy: createdAdmins[trackIdx % createdAdmins.length]._id,
          assignedTo: students.map(s => s._id)
        },
        {
          title: `${track.name} Task 2`,
          description: `Second task for ${track.name}`,
          category: trackIdx % 2 === 0 ? 'design' : 'data',
          difficulty: 'Intermediate',
          points: 120 + trackIdx * 10,
          careerTrack: track.id,
          requirements: ['Requirement 3', 'Requirement 4'],
          deliverables: ['Deliverable 2'],
          skills: ['Skill Y'],
          estimatedTime: '6 hours',
          isActive: true,
          order: 2,
          dueDate: futureDate(5 + trackIdx),
          createdBy: createdAdmins[(trackIdx + 1) % createdAdmins.length]._id,
          assignedTo: students.map(s => s._id)
        }
      ]);
      allTasks = allTasks.concat(tasks);

      // Create 2 submissions per student (for their track's tasks)
      for (let s = 0; s < students.length; s++) {
        const student = students[s];
        for (let t = 0; t < tasks.length; t++) {
          const task = tasks[t];
          allSubmissions.push({
            task: task._id,
            student: student._id,
            description: `${student.name}'s submission for ${task.title}`,
            liveUrl: '',
            githubUrl: `https://github.com/${student.name.replace(/ /g, '').toLowerCase()}/${task.title.replace(/ /g, '').toLowerCase()}`,
            notes: `Notes for ${task.title}`,
            status: t === 0 ? 'pending' : 'reviewed',
            score: 80 + s * 5 + t * 2,
            feedback: t === 0 ? 'Good start!' : 'Well done!',
            submittedAt: now
          });
        }
      }
    }

    // Insert all submissions
    await Submission.insertMany(allSubmissions);
    console.log('Created modules, tasks, students, and submissions for all tracks');
    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 