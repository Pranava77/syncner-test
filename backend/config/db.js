import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    
    // Log all registered models
    Object.keys(mongoose.models).forEach(modelName => {
    });
    
  } catch (error) {
    process.exit(1);
  }
};

export default connectDB;