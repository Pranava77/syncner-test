import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Track from '../models/Track.js';
import Module from '../models/Module.js';
import Task from '../models/Task.js';
import Progress from '../models/Progress.js';
import { testUsers, careerTracksData, modulesData, tasksData } from '../data/seedData.js';

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
    const adminUser = createdUsers.find(user => user.email === 'owner@owner.com');
    const tasksWithCreator = tasksData.map(task => ({
      ...task,
      createdBy: adminUser._id
    }));
    const createdTasks = await Task.create(tasksWithCreator);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Create progress records for students
    console.log('📈 Creating progress records...');
    const studentUsers = createdUsers.filter(user => user.role === 'student');
    const progressRecords = studentUsers.map(user => ({
      user: user._id,
      careerTrack: user.careerTrack || 'fullstack',
      overallProgress: Math.floor(Math.random() * 50) + 10, // 10-60%
      totalPoints: user.totalPoints || 0,
      streakDays: user.streakDays || 0,
      moduleProgress: [],
      taskProgress: [],
      achievements: []
    }));
    await Progress.create(progressRecords);
    console.log(`✅ Created ${progressRecords.length} progress records`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('🔑 Platform Owner: owner@owner.com / 12345');
    console.log('👨‍🎓 Student: student@university.edu / password');
    console.log('👨‍💼 Admin: admin@university.edu / password');
    console.log('👨‍🏫 Instructor: instructor@university.edu / password');

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