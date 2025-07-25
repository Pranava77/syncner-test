import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for attendance utility');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Mark absences for a specific date
export const markAbsencesForDate = async (date = new Date()) => {
  try {
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    console.log(`[ATTENDANCE UTILITY] Marking absences for date: ${targetDate.toISOString()}`);
    
    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`[ATTENDANCE UTILITY] Found ${students.length} students`);
    
    let markedAbsences = 0;
    let skipped = 0;
    
    for (const student of students) {
      // Check if attendance already exists for this date
      const existingAttendance = await Attendance.findOne({
        user: student._id,
        date: targetDate
      });
      
      if (existingAttendance) {
        console.log(`[ATTENDANCE UTILITY] Attendance already exists for student ${student.name} on ${targetDate.toISOString()}`);
        skipped++;
        continue;
      }
      
      // Mark as absent
      await Attendance.create({
        user: student._id,
        date: targetDate,
        status: 'absent'
      });
      
      console.log(`[ATTENDANCE UTILITY] Marked absent for student ${student.name} on ${targetDate.toISOString()}`);
      markedAbsences++;
    }
    
    console.log(`[ATTENDANCE UTILITY] Completed: marked ${markedAbsences} absences, skipped ${skipped} existing records`);
    return { markedAbsences, skipped, date: targetDate };
  } catch (error) {
    console.error('[ATTENDANCE UTILITY ERROR]', error);
    throw error;
  }
};

// Mark absences for a date range
export const markAbsencesForRange = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);
    
    console.log(`[ATTENDANCE UTILITY] Marking absences for date range: ${start.toISOString()} to ${end.toISOString()}`);
    
    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`[ATTENDANCE UTILITY] Found ${students.length} students`);
    
    let totalMarked = 0;
    let totalSkipped = 0;
    
    // Generate all dates in the range
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    for (const date of dates) {
      let markedForDate = 0;
      let skippedForDate = 0;
      
      for (const student of students) {
        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          user: student._id,
          date: date
        });
        
        if (existingAttendance) {
          skippedForDate++;
          continue;
        }
        
        // Mark as absent
        await Attendance.create({
          user: student._id,
          date: date,
          status: 'absent'
        });
        
        markedForDate++;
      }
      
      totalMarked += markedForDate;
      totalSkipped += skippedForDate;
      
      console.log(`[ATTENDANCE UTILITY] Date ${date.toISOString()}: marked ${markedForDate}, skipped ${skippedForDate}`);
    }
    
    console.log(`[ATTENDANCE UTILITY] Completed: marked ${totalMarked} absences across ${dates.length} days, skipped ${totalSkipped} existing records`);
    return { totalMarked, totalSkipped, dateRange: { start, end }, daysProcessed: dates.length };
  } catch (error) {
    console.error('[ATTENDANCE UTILITY ERROR]', error);
    throw error;
  }
};

// Mark absences for yesterday (useful for daily cron jobs)
export const markAbsencesForYesterday = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return await markAbsencesForDate(yesterday);
};

// Mark absences for the past week
export const markAbsencesForPastWeek = async () => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // Yesterday
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // 7 days ago
  return await markAbsencesForRange(startDate, endDate);
};

// Main function for command line usage
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  await connectDB();
  
  try {
    switch (command) {
      case 'yesterday':
        console.log('Marking absences for yesterday...');
        await markAbsencesForYesterday();
        break;
      case 'date':
        const date = args[1];
        if (!date) {
          console.error('Please provide a date in YYYY-MM-DD format');
          process.exit(1);
        }
        console.log(`Marking absences for date: ${date}`);
        await markAbsencesForDate(date);
        break;
      case 'range':
        const startDate = args[1];
        const endDate = args[2];
        if (!startDate || !endDate) {
          console.error('Please provide start and end dates in YYYY-MM-DD format');
          process.exit(1);
        }
        console.log(`Marking absences for range: ${startDate} to ${endDate}`);
        await markAbsencesForRange(startDate, endDate);
        break;
      case 'week':
        console.log('Marking absences for the past week...');
        await markAbsencesForPastWeek();
        break;
      default:
        console.log('Usage:');
        console.log('  node attendanceUtils.js yesterday');
        console.log('  node attendanceUtils.js date YYYY-MM-DD');
        console.log('  node attendanceUtils.js range YYYY-MM-DD YYYY-MM-DD');
        console.log('  node attendanceUtils.js week');
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 