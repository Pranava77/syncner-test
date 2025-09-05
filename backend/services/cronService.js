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
    
    // Mark absences for yesterday every day at 1 AM
    this.scheduleAttendanceMarking();
    
  }

  // Schedule daily attendance marking
  scheduleAttendanceMarking() {
    const job = cron.schedule('0 1 * * *', async () => {
      try {
        const result = await this.markAbsencesForYesterday();
      } catch (error) {
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.jobs.set('attendance', job);
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
      
      
      // Get all students
      const students = await User.find({ role: 'student' });
      
      let markedAbsences = 0;
      let skipped = 0;
      
      for (const student of students) {
        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          user: student._id,
          date: targetDate
        });
        
        if (existingAttendance) {
          skipped++;
          continue;
        }
        
        // Mark as absent
        await Attendance.create({
          user: student._id,
          date: targetDate,
          status: 'absent'
        });
        
        markedAbsences++;
      }
      
      return { markedAbsences, skipped, date: targetDate };
    } catch (error) {
      throw error;
    }
  }

  // Stop all cron jobs
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
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
    try {
      const result = await this.markAbsencesForYesterday();
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default new CronService(); 