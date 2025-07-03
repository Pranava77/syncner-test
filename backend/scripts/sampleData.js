import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Module from '../models/Module.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Progress from '../models/Progress.js';

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

      // Create 2 tasks per track with realistic data
      const tasks = await Task.insertMany([
        {
          title: track.id === 'ai-ml' ? 'Image Classifier with TensorFlow' :
                 track.id === 'fullstack' ? 'REST API with Node.js' :
                 track.id === 'ui-ux' ? 'Design a Mobile App UI' : 'Data Cleaning Project',
          description: track.id === 'ai-ml' ? 'Build and train an image classifier using TensorFlow.' :
                       track.id === 'fullstack' ? 'Build a RESTful API for a todo app using Node.js and Express.' :
                       track.id === 'ui-ux' ? 'Design a mobile app UI for a food delivery service.' : 'Clean and preprocess a public dataset.',
          category: track.id === 'ai-ml' ? 'data' :
                    track.id === 'fullstack' ? 'fullstack' :
                    track.id === 'ui-ux' ? 'design' : 'data',
          difficulty: 'Beginner',
          points: 120 + trackIdx * 10,
          careerTrack: track.id,
          requirements: [
            track.id === 'ai-ml' ? 'Use a public image dataset' :
            track.id === 'fullstack' ? 'CRUD endpoints' :
            track.id === 'ui-ux' ? 'Wireframes' : 'Remove nulls',
            track.id === 'ai-ml' ? 'Train a CNN model' :
            track.id === 'fullstack' ? 'MongoDB integration' :
            track.id === 'ui-ux' ? 'Clickable prototype' : 'Normalize columns'
          ],
          deliverables: [
            track.id === 'ai-ml' ? 'Jupyter notebook' :
            track.id === 'fullstack' ? 'API documentation' :
            track.id === 'ui-ux' ? 'Figma file' : 'CSV file'
          ],
          skills: [
            track.id === 'ai-ml' ? 'TensorFlow' :
            track.id === 'fullstack' ? 'Node.js' :
            track.id === 'ui-ux' ? 'Figma' : 'Pandas',
            'Git'
          ],
          estimatedTime: '8 hours',
          isActive: true,
          order: 1,
          dueDate: futureDate(3 + trackIdx),
          createdBy: createdAdmins[trackIdx % createdAdmins.length]._id,
          assignedTo: students.map(s => s._id)
        },
        {
          title: track.id === 'ai-ml' ? 'Sentiment Analysis with NLP' :
                 track.id === 'fullstack' ? 'Frontend with React' :
                 track.id === 'ui-ux' ? 'Usability Testing' : 'Data Visualization',
          description: track.id === 'ai-ml' ? 'Perform sentiment analysis on a text dataset using NLP.' :
                       track.id === 'fullstack' ? 'Build a todo app frontend using React.' :
                       track.id === 'ui-ux' ? 'Conduct usability testing for your app design.' : 'Create visualizations for a dataset.',
          category: track.id === 'ai-ml' ? 'data' :
                    track.id === 'fullstack' ? 'frontend' :
                    track.id === 'ui-ux' ? 'design' : 'data',
          difficulty: 'Intermediate',
          points: 140 + trackIdx * 10,
          careerTrack: track.id,
          requirements: [
            track.id === 'ai-ml' ? 'Use a public text dataset' :
            track.id === 'fullstack' ? 'React components' :
            track.id === 'ui-ux' ? 'Test with 3 users' : 'Bar and line charts',
            track.id === 'ai-ml' ? 'Preprocess data' :
            track.id === 'fullstack' ? 'State management' :
            track.id === 'ui-ux' ? 'Collect feedback' : 'Interactive dashboard'
          ],
          deliverables: [
            track.id === 'ai-ml' ? 'Python script' :
            track.id === 'fullstack' ? 'GitHub repo' :
            track.id === 'ui-ux' ? 'Test report' : 'Jupyter notebook'
          ],
          skills: [
            track.id === 'ai-ml' ? 'NLP' :
            track.id === 'fullstack' ? 'React' :
            track.id === 'ui-ux' ? 'User Testing' : 'Matplotlib',
            'Git'
          ],
          estimatedTime: '10 hours',
          isActive: true,
          order: 2,
          dueDate: futureDate(6 + trackIdx),
          createdBy: createdAdmins[(trackIdx + 1) % createdAdmins.length]._id,
          assignedTo: students.map(s => s._id)
        }
      ]);
      allTasks = allTasks.concat(tasks);

      // Create 2 submissions per student (for their track's tasks) with realistic data
      for (let s = 0; s < students.length; s++) {
        const student = students[s];
        for (let t = 0; t < tasks.length; t++) {
          const task = tasks[t];
          const isReviewed = t === 1;
          allSubmissions.push({
            task: task._id,
            student: student._id,
            description: `${student.name}'s submission for ${task.title}`,
            liveUrl: '',
            githubUrl: `https://github.com/${student.github}/${task.title.replace(/ /g, '-').toLowerCase()}`,
            notes: `Notes for ${task.title}`,
            status: isReviewed ? 'reviewed' : 'pending',
            score: isReviewed ? 85 + s * 3 + t * 2 : undefined,
            feedback: isReviewed ? 'Great job! Well structured and accurate.' : 'Submission received, pending review.',
            submittedAt: new Date(now.getTime() - (t * 2 + s) * 24 * 60 * 60 * 1000),
            files: [
              { filename: `${task.title.replace(/ /g, '_').toLowerCase()}_${student.github}.zip`, originalName: `${task.title.replace(/ /g, '_')}.zip` }
            ],
            reviewedAt: isReviewed ? new Date(now.getTime() - (t * 2 + s - 1) * 24 * 60 * 60 * 1000) : undefined,
            reviewedBy: isReviewed ? createdAdmins[(trackIdx + 1) % createdAdmins.length]._id : undefined
          });
        }
      }
    }

    // Insert all submissions
    await Submission.insertMany(allSubmissions);
    console.log('Created modules, tasks, students, and submissions for all tracks');
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
    // Update progress
    const progress = await Progress.findOne({ user: students[i]._id });
    if (progress) {
      // Mark first module as completed with timeSpent
      if (progress.moduleProgress && progress.moduleProgress.length > 0) {
        progress.moduleProgress[0].status = 'COMPLETED';
        progress.moduleProgress[0].timeSpent = 180 + i * 10; // 3+ hours
      }
      // Add a completed task with a score
      if (progress.taskProgress && progress.taskProgress.length > 0) {
        progress.taskProgress[0].status = 'COMPLETED';
        progress.taskProgress[0].score = 80 + (i % 5) * 4; // 80-96
      }
      progress.overallProgress = 50 + i * 5;
      await progress.save();
    }
  }
  console.log('Enhanced demo data for analytics!');
}

seedData(); 