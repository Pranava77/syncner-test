import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

export const trackActivity = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'student') return next();

    const user = await User.findById(req.user._id);
    if (!user) return next();

    const now = new Date();
    const lastActive = user.lastActive || now;
    const lastDate = user.activeTodayDate ? user.activeTodayDate.toDateString() : null;
    const today = now.toDateString();

    let minutes = 0;
    if (lastDate === today) {
      minutes = Math.floor((now - lastActive) / 60000);
      if (minutes > 0 && minutes < 60) {
        user.activeTodayMinutes = (user.activeTodayMinutes || 0) + minutes;
      }
    } else {
      user.activeTodayMinutes = 0;
      user.activeTodayDate = now;
    }

    user.lastActive = now;
    await user.save();
    req.user = user; // Attach updated user to request

    console.log(`[ATTENDANCE DEBUG] User: ${user.name} (${user._id}), activeTodayMinutes: ${user.activeTodayMinutes}`);
    // Auto-mark attendance if activeTodayMinutes >= 3 and not already marked for today
    if (user.activeTodayMinutes >= 3) {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const attendanceExists = await Attendance.findOne({
        user: user._id,
        date: { $gte: startOfDay, $lt: endOfDay }
      });
      if (!attendanceExists) {
        await Attendance.create({
          user: user._id,
          date: now,
          status: 'present'
        });
        console.log(`[ATTENDANCE DEBUG] Attendance marked for user: ${user.name} (${user._id}) on ${now.toISOString()}`);
      } else {
        console.log(`[ATTENDANCE DEBUG] Attendance already exists for user: ${user.name} (${user._id}) on ${now.toISOString()}`);
      }
    }

    next();
  } catch (err) {
    next();
  }
}; 