import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import dotenv from 'dotenv';

dotenv.config();

const fixCareerTracks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Update User documents
    const userResult = await User.updateMany(
      { careerTrack: 'fullstack' },
      { $set: { careerTrack: 'full-stack' } }
    );

    // Update UserProgress documents
    const progressResult = await UserProgress.updateMany(
      { careerTrack: 'fullstack' },
      { $set: { careerTrack: 'full-stack' } }
    );

    // Verify the fix
    const remainingFullstackUsers = await User.countDocuments({ careerTrack: 'fullstack' });
    const remainingFullstackProgress = await UserProgress.countDocuments({ careerTrack: 'fullstack' });
    

  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCareerTracks();
}

export default fixCareerTracks;
