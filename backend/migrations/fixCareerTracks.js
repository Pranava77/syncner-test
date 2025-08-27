import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import dotenv from 'dotenv';

dotenv.config();

const fixCareerTracks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update User documents
    const userResult = await User.updateMany(
      { careerTrack: 'fullstack' },
      { $set: { careerTrack: 'full-stack' } }
    );
    console.log(`Updated ${userResult.modifiedCount} User documents`);

    // Update UserProgress documents
    const progressResult = await UserProgress.updateMany(
      { careerTrack: 'fullstack' },
      { $set: { careerTrack: 'full-stack' } }
    );
    console.log(`Updated ${progressResult.modifiedCount} UserProgress documents`);

    // Verify the fix
    const remainingFullstackUsers = await User.countDocuments({ careerTrack: 'fullstack' });
    const remainingFullstackProgress = await UserProgress.countDocuments({ careerTrack: 'fullstack' });
    
    console.log(`Remaining 'fullstack' values:`);
    console.log(`- Users: ${remainingFullstackUsers}`);
    console.log(`- UserProgress: ${remainingFullstackProgress}`);

    console.log('Career track normalization completed successfully!');
  } catch (error) {
    console.error('Error fixing career tracks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCareerTracks();
}

export default fixCareerTracks;
