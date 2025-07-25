import express from 'express';
import { 
  markAttendance, 
  getAttendance, 
  markAbsences, 
  markAbsencesForRange, 
  getAttendanceStats 
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/:userId', getAttendance);
router.post('/mark-absences', markAbsences);
router.post('/mark-absences-range', markAbsencesForRange);
router.get('/stats/:userId', getAttendanceStats);

export default router; 