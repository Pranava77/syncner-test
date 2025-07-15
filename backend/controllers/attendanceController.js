import Attendance from '../models/Attendance.js';

// POST /api/attendance/mark
export const markAttendance = async (req, res) => {
  try {
    const { userId, date, status } = req.body;
    if (!userId || !date) {
      return res.status(400).json({ success: false, message: 'userId and date are required' });
    }
    const record = await Attendance.findOneAndUpdate(
      { user: userId, date: new Date(date).setHours(0,0,0,0) },
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
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 