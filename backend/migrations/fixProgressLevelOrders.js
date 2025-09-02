#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fixUserProgressLevelOrders, checkUserProgressLevelOrders } from '../utils/fixUserProgressLevelOrders.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.error('Make sure MONGODB_URI environment variable is set');
    process.exit(1);
  }
};

const runMigration = async () => {
  console.log('🚀 Starting UserProgress levelOrder migration...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // First, check the current status
    console.log('📊 Checking current status...');
    const status = await checkUserProgressLevelOrders();
    
    if (status.needingFix === 0) {
      console.log('✅ No UserProgress records need fixing!');
      process.exit(0);
    }
    
    console.log(`\n🔧 Found ${status.needingFix} records that need fixing. Proceeding...\n`);
    
    // Run the fix
    const result = await fixUserProgressLevelOrders();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`   Fixed: ${result.fixedCount} records`);
    console.log(`   Errors: ${result.errorCount} records`);
    console.log(`   Total processed: ${result.totalProcessed} records\n`);
    
    // Check status again
    console.log('📊 Checking final status...');
    const finalStatus = await checkUserProgressLevelOrders();
    console.log(`   Records still needing fix: ${finalStatus.needingFix}`);
    
    if (finalStatus.needingFix === 0) {
      console.log('✅ All UserProgress records have been fixed!');
    } else {
      console.log(`⚠️ ${finalStatus.needingFix} records still need attention`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the migration
runMigration();
