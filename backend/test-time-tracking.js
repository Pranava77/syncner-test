import mongoose from 'mongoose';
import UserProgress from './models/UserProgress.js';

// Test script for time tracking functionality
async function testTimeTracking() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect('mongodb://localhost:27017/syncner-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create a test user progress document
    const testProgress = new UserProgress({
      user: new mongoose.Types.ObjectId(),
      careerTrack: 'full-stack',
      completedLevels: [{
        levelId: 'test-level-1',
        levelOrder: 1,
        completedSections: {
          learn: false,
          exercise: false,
          test: false
        },
        learnProgress: {
          startTime: new Date(),
          endTime: null,
          timeSpent: 0,
          linksAccessed: [],
          isCompleted: false
        },
        testProgress: {
          startTime: null,
          endTime: null,
          timeSpent: 0,
          attempts: [],
          isCompleted: false
        },
        exerciseSubmissions: []
      }]
    });

    // Test the enhanced methods
    console.log('\n=== Testing Enhanced Methods ===');

    // Test learn progress update with time tracking
    testProgress.updateLearnProgress(
      'test-level-1',
      300, // 5 minutes in seconds
      ['https://example.com/learn'],
      new Date(Date.now() - 300000), // 5 minutes ago
      new Date()
    );

    // Test test attempt submission with time tracking
    testProgress.submitTestAttempt(
      'test-level-1',
      85,
      [{ questionIndex: 0, selectedOption: 1 }],
      new Date(Date.now() - 180000), // 3 minutes ago
      new Date(),
      180 // 3 minutes in seconds
    );

    // Test exercise submission with time tracking
    testProgress.submitExercise(
      'test-level-1',
      'Test Exercise',
      ['https://github.com/test-repo'],
      new Date(Date.now() - 600000), // 10 minutes ago
      new Date(),
      600 // 10 minutes in seconds
    );

    console.log('✅ All methods executed successfully');

    // Display the updated progress
    console.log('\n=== Updated Progress Data ===');
    const level = testProgress.completedLevels[0];
    
    console.log('Learn Section:');
    console.log(`  Start Time: ${level.learnProgress.startTime}`);
    console.log(`  End Time: ${level.learnProgress.endTime}`);
    console.log(`  Time Spent: ${level.learnProgress.timeSpent} seconds`);
    console.log(`  Is Completed: ${level.learnProgress.isCompleted}`);

    console.log('\nTest Section:');
    console.log(`  Start Time: ${level.testProgress.startTime}`);
    console.log(`  End Time: ${level.testProgress.endTime}`);
    console.log(`  Time Spent: ${level.testProgress.timeSpent} seconds`);
    console.log(`  Is Completed: ${level.testProgress.isCompleted}`);

    console.log('\nExercise Section:');
    const exercise = level.exerciseSubmissions[0];
    console.log(`  Start Time: ${exercise.startTime}`);
    console.log(`  End Time: ${exercise.endTime}`);
    console.log(`  Time Spent: ${exercise.timeSpent} seconds`);
    console.log(`  Status: ${exercise.status}`);

    console.log('\n✅ Time tracking test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testTimeTracking();
