import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Track from '../models/Track.js';
import Module from '../models/Module.js';
import Task from '../models/Task.js';
import Progress from '../models/Progress.js';
import College from '../models/College.js';
import Resume from '../models/Resume.js';
import Submission from '../models/Submission.js';
import { 
  testUsers, 
  careerTracksData, 
  modulesData, 
  tasksData, 
  collegesData,
  resumesData,
  progressData,
  submissionsData
} from '../data/seedData.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Track.deleteMany({});
    await Module.deleteMany({});
    await Task.deleteMany({});
    await Progress.deleteMany({});
    await College.deleteMany({});
    await Resume.deleteMany({});
    await Submission.deleteMany({});

    // Seed colleges first
    console.log('🏫 Seeding colleges...');
    const createdColleges = await College.create(collegesData);
    console.log(`✅ Created ${createdColleges.length} colleges`);

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = await User.create(testUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed career tracks
    console.log('🎯 Seeding career tracks...');
    const createdTracks = await Track.create(careerTracksData);
    console.log(`✅ Created ${createdTracks.length} career tracks`);

    // Seed modules
    console.log('📚 Seeding modules...');
    const createdModules = await Module.create(modulesData);
    console.log(`✅ Created ${createdModules.length} modules`);

    // Seed tasks with creator reference
    console.log('📋 Seeding tasks...');
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const tasksWithCreator = tasksData.map(task => ({
      ...task,
      createdBy: adminUser._id
    }));
    const createdTasks = await Task.create(tasksWithCreator);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Create progress records for students with enhanced data
    console.log('📈 Creating progress records...');
    const studentUsers = createdUsers.filter(user => user.role === 'student');
    
    // Map progress data to actual users
    const progressRecords = studentUsers.map((user, index) => {
      const progressTemplate = progressData[index] || progressData[0];
      
      // Find tasks for this user's career track
      const userTasks = createdTasks.filter(task => task.careerTrack === user.careerTrack);
      
      // Map task progress with actual task IDs
      const taskProgress = progressTemplate.taskProgress.map(tp => ({
        ...tp,
        task: userTasks[tp.task === null ? 0 : 1]?._id // Assign first or second task based on index
      }));

      return {
        user: user._id,
        careerTrack: user.careerTrack || 'fullstack',
        overallProgress: progressTemplate.overallProgress,
        totalPoints: progressTemplate.totalPoints,
        streakDays: progressTemplate.streakDays,
        level: progressTemplate.level,
        moduleProgress: progressTemplate.moduleProgress,
        taskProgress: taskProgress,
        achievements: progressTemplate.achievements,
        weeklyGoal: progressTemplate.weeklyGoal
      };
    });
    
    await Progress.create(progressRecords);
    console.log(`✅ Created ${progressRecords.length} progress records`);

    // Seed resumes
    console.log('📄 Seeding resumes...');
    const resumeRecords = resumesData.map((resume, index) => {
      const user = createdUsers.find(u => u.email === resume.personalInfo.email);
      return {
        ...resume,
        user: user._id
      };
    });
    const createdResumes = await Resume.create(resumeRecords);
    console.log(`✅ Created ${createdResumes.length} resumes`);

    // Seed submissions
    console.log('📤 Seeding submissions...');
    const submissionRecords = submissionsData.map((submission, index) => {
      const user = createdUsers.find(u => u.email === (index === 0 ? 'student@university.edu' : index === 1 ? 'student@university.edu' : 'emily@statecollege.edu'));
      const task = createdTasks.find(t => t.title.includes(submission.description.includes('portfolio') ? 'Portfolio' : submission.description.includes('task management') ? 'Task Management' : 'Dataset'));
      
      return {
        ...submission,
        student: user._id,
        task: task._id,
        reviewedBy: index === 0 || index === 2 ? createdUsers.find(u => u.role === 'instructor')._id : undefined
      };
    });
    const createdSubmissions = await Submission.create(submissionRecords);
    console.log(`✅ Created ${createdSubmissions.length} submissions`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('👨‍🎓 Student: student@university.edu / password');
    console.log('👨‍💼 Admin: admin@university.edu / password');
    console.log('👨‍🏫 Instructor: instructor@university.edu / password');
    console.log('👩‍🎓 Data Science Student: emily@statecollege.edu / password');
    console.log('👨‍🎨 UI/UX Student: alex@designinstitute.edu / password');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();