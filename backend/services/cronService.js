import cron from 'node-cron';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  // Initialize all cron jobs
  init() {
    console.log('[CRON SERVICE] Initializing cron jobs...');
    
    // Mark absences for yesterday every day at 1 AM
    this.scheduleAttendanceMarking();
    
    console.log('[CRON SERVICE] Cron jobs initialized successfully');
  }

  // Schedule daily attendance marking
  scheduleAttendanceMarking() {
    const job = cron.schedule('0 1 * * *', async () => {
      console.log('[CRON SERVICE] Running daily attendance marking job...');
      try {
        const result = await this.markAbsencesForYesterday();
        console.log(`[CRON SERVICE] Attendance marking completed: ${result.markedAbsences} absences marked, ${result.skipped} skipped`);
      } catch (error) {
        console.error('[CRON SERVICE] Error in attendance marking job:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.jobs.set('attendance', job);
    console.log('[CRON SERVICE] Daily attendance marking scheduled for 1:00 AM UTC');
  }

  // Mark absences for yesterday
  async markAbsencesForYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return await this.markAbsencesForDate(yesterday);
  }

  // Mark absences for a specific date
  async markAbsencesForDate(date = new Date()) {
    try {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      
      console.log(`[CRON SERVICE] Marking absences for date: ${targetDate.toISOString()}`);
      
      // Get all students
      const students = await User.find({ role: 'student' });
      console.log(`[CRON SERVICE] Found ${students.length} students`);
      
      let markedAbsences = 0;
      let skipped = 0;
      
      for (const student of students) {
        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          user: student._id,
          date: targetDate
        });
        
        if (existingAttendance) {
          console.log(`[CRON SERVICE] Attendance already exists for student ${student.name} on ${targetDate.toISOString()}`);
          skipped++;
          continue;
        }
        
        // Mark as absent
        await Attendance.create({
          user: student._id,
          date: targetDate,
          status: 'absent'
        });
        
        console.log(`[CRON SERVICE] Marked absent for student ${student.name} on ${targetDate.toISOString()}`);
        markedAbsences++;
      }
      
      console.log(`[CRON SERVICE] Completed: marked ${markedAbsences} absences, skipped ${skipped} existing records`);
      return { markedAbsences, skipped, date: targetDate };
    } catch (error) {
      console.error('[CRON SERVICE ERROR]', error);
      throw error;
    }
  }

  // Stop all cron jobs
  stop() {
    console.log('[CRON SERVICE] Stopping all cron jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[CRON SERVICE] Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  // Get status of all jobs
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate(),
        lastDate: job.lastDate()
      };
    });
    return status;
  }

  // Manually trigger attendance marking
  async triggerAttendanceMarking() {
    console.log('[CRON SERVICE] Manually triggering attendance marking...');
    try {
      const result = await this.markAbsencesForYesterday();
      console.log(`[CRON SERVICE] Manual attendance marking completed: ${result.markedAbsences} absences marked, ${result.skipped} skipped`);
      return result;
    } catch (error) {
      console.error('[CRON SERVICE] Error in manual attendance marking:', error);
      throw error;
    }
  }
}

export default new CronService(); 