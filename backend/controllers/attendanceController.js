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
    
    // Check if attendance already exists for this user and date
    const existingAttendance = await Attendance.findOne({
      user: userId,
      date: normalizedDate
    });
    
    let record;
    try {
      if (existingAttendance) {
        // Update existing record
        record = await Attendance.findByIdAndUpdate(
          existingAttendance._id,
          { status: status || 'present' },
          { new: true }
        );
      } else {
        // Create new record
        record = await Attendance.create({
          user: userId,
          date: normalizedDate,
          status: status || 'present'
        });
      }
      
      res.json({ success: true, data: record });
    } catch (createError) {
      // Handle any remaining duplicate key errors
      if (createError.code === 11000) {
        // Try to find the existing record that was created by another request
        const existingRecord = await Attendance.findOne({
          user: userId,
          date: normalizedDate
        });
        
        if (existingRecord) {
          // Update the existing record
          record = await Attendance.findByIdAndUpdate(
            existingRecord._id,
            { status: status || 'present' },
            { new: true }
          );
          res.json({ success: true, data: record });
        } else {
          throw createError;
        }
      } else {
        throw createError;
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/:userId
export const getAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.find({ user: userId }).sort({ date: 1 });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: records });
  } catch (error) {
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