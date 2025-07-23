import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const fixCareerTracks = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking for users with incorrect career track values...');
    
    // Find users with incorrect career track values
    const usersToFix = await User.find({
      careerTrack: { $in: ['fullstack', 'aiml', 'uiux', 'datascience'] }
    });
    
    console.log(`Found ${usersToFix.length} users with incorrect career track values:`);
    
    if (usersToFix.length === 0) {
      console.log('✅ No users found with incorrect career track values.');
      return;
    }
    
    // Define the mapping of incorrect to correct values
    const careerTrackMapping = {
      'fullstack': 'full-stack',
      'aiml': 'ai-ml',
      'uiux': 'ui-ux',
      'datascience': 'data-science'
    };
    
    // Update each user
    for (const user of usersToFix) {
      const oldTrack = user.careerTrack;
      const newTrack = careerTrackMapping[oldTrack];
      
      console.log(`📝 Updating user ${user.email}: ${oldTrack} → ${newTrack}`);
      
      user.careerTrack = newTrack;
      await user.save();
    }
    
    console.log('✅ Successfully updated all users with incorrect career track values.');
    
    // Verify the fix
    const remainingIncorrectUsers = await User.find({
      careerTrack: { $in: ['fullstack', 'aiml', 'uiux', 'datascience'] }
    });
    
    if (remainingIncorrectUsers.length === 0) {
      console.log('✅ Verification passed: No users remain with incorrect career track values.');
    } else {
      console.log(`⚠️  Warning: ${remainingIncorrectUsers.length} users still have incorrect career track values.`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing career tracks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
fixCareerTracks(); 