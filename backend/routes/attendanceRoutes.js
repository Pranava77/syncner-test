import express from 'express';
import { 
  markAttendance, 
  getAttendance, 
  getAttendanceStats
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/:userId', getAttendance);
router.get('/stats/:userId', getAttendanceStats);

export default router; 