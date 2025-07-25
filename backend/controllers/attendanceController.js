import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// POST /api/attendance/mark
export const markAttendance = async (req, res) => {
  try {
    const { userId, date, status } = req.body;
    if (!userId || !date) {
      return res.status(400).json({ success: false, message: 'userId and date are required' });
    }
    // Normalize date to midnight UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    const record = await Attendance.findOneAndUpdate(
      { user: userId, date: normalizedDate },
      { status: status || 'present' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/:userId
export const getAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.find({ user: userId }).sort({ date: 1 });
    console.log(`[ATTENDANCE DEBUG] getAttendance for userId: ${userId}, records found: ${records.length}`);
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/mark-absences
export const markAbsences = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);
    
    console.log(`[ATTENDANCE DEBUG] Marking absences for date: ${targetDate.toISOString()}`);
    
    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`[ATTENDANCE DEBUG] Found ${students.length} students`);
    
    let markedAbsences = 0;
    let skipped = 0;
    
    for (const student of students) {
      // Check if attendance already exists for this date
      const existingAttendance = await Attendance.findOne({
        user: student._id,
        date: targetDate
      });
      
      if (existingAttendance) {
        console.log(`[ATTENDANCE DEBUG] Attendance already exists for student ${student.name} on ${targetDate.toISOString()}`);
        skipped++;
        continue;
      }
      
      // Mark as absent
      await Attendance.create({
        user: student._id,
        date: targetDate,
        status: 'absent'
      });
      
      console.log(`[ATTENDANCE DEBUG] Marked absent for student ${student.name} on ${targetDate.toISOString()}`);
      markedAbsences++;
    }
    
    res.json({ 
      success: true, 
      message: `Marked ${markedAbsences} absences, skipped ${skipped} existing records`,
      data: { markedAbsences, skipped, date: targetDate }
    });
  } catch (error) {
    console.error('[ATTENDANCE ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/mark-absences-range
export const markAbsencesForRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'startDate and endDate are required in YYYY-MM-DD format' 
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);
    
    console.log(`[ATTENDANCE DEBUG] Marking absences for date range: ${start.toISOString()} to ${end.toISOString()}`);
    
    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`[ATTENDANCE DEBUG] Found ${students.length} students`);
    
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
      
      console.log(`[ATTENDANCE DEBUG] Date ${date.toISOString()}: marked ${markedForDate}, skipped ${skippedForDate}`);
    }
    
    res.json({ 
      success: true, 
      message: `Marked ${totalMarked} absences across ${dates.length} days, skipped ${totalSkipped} existing records`,
      data: { totalMarked, totalSkipped, dateRange: { start, end }, daysProcessed: dates.length }
    });
  } catch (error) {
    console.error('[ATTENDANCE ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/stats/:userId
export const getAttendanceStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { user: userId };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    
    const records = await Attendance.find(query).sort({ date: 1 });
    
    const stats = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      attendanceRate: records.length > 0 ? 
        Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 