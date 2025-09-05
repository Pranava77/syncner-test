#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fixUserProgressLevelOrders, checkUserProgressLevelOrders } from '../utils/fixUserProgressLevelOrders.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
};

const runMigration = async () => {
  
  try {
    // Connect to database
    await connectDB();
    
    // First, check the current status
    const status = await checkUserProgressLevelOrders();
    
    if (status.needingFix === 0) {
      process.exit(0);
    }
    
    
    // Run the fix
    const result = await fixUserProgressLevelOrders();
    
    
    // Check status again
    const finalStatus = await checkUserProgressLevelOrders();
    
    if (finalStatus.needingFix === 0) {
    } else {
    }
    
  } catch (error) {
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the migration
runMigration();
