import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

export const trackActivity = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'student') return next();

    const user = await User.findById(req.user._id);
    if (!user) return next();

    const now = new Date();
    const lastActive = user.lastActive || now;
    
    // Use consistent date comparison with UTC to avoid timezone issues
    const getDateKey = (date) => {
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    };
    
    const lastDateKey = user.activeTodayDate ? getDateKey(user.activeTodayDate) : null;
    const todayKey = getDateKey(now);

    let minutes = 0;
    if (lastDateKey === todayKey) {
      minutes = Math.floor((now - lastActive) / 60000);
      if (minutes > 0 && minutes <= 30) {
        user.activeTodayMinutes = (user.activeTodayMinutes || 0) + minutes;
      } else if (minutes > 30) {
        // If more than 30 minutes have passed, add a small amount to indicate activity
        user.activeTodayMinutes = (user.activeTodayMinutes || 0) + 1;
      }
    } else {
      user.activeTodayMinutes = 0;
      user.activeTodayDate = now;
    }

    user.lastActive = now;
    await user.save();
    req.user = user; // Attach updated user to request

    console.log(`[ATTENDANCE DEBUG] User: ${user.name} (${user._id}), activeTodayMinutes: ${user.activeTodayMinutes}, dateKey: ${todayKey}`);
    
    // Auto-mark attendance if activeTodayMinutes >= 2 and not already marked for today
    if (user.activeTodayMinutes >= 2) {
      const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      
      const attendanceExists = await Attendance.findOne({
        user: user._id,
        date: { $gte: startOfDay, $lt: endOfDay }
      });
      
      if (!attendanceExists) {
        await Attendance.create({
          user: user._id,
          date: startOfDay, // Use start of day for consistency
          status: 'present'
        });
        console.log(`[ATTENDANCE DEBUG] Attendance marked for user: ${user.name} (${user._id}) on ${startOfDay.toISOString()}`);
      } else {
        console.log(`[ATTENDANCE DEBUG] Attendance already exists for user: ${user.name} (${user._id}) on ${startOfDay.toISOString()}`);
      }
    }

    next();
  } catch (err) {
    console.error('[ATTENDANCE ERROR]', err);
    next();
  }
}; 