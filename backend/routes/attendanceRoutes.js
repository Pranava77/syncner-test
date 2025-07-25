import express from 'express';
import { 
  markAttendance, 
  getAttendance, 
  markAbsences, 
  markAbsencesForRange, 
  getAttendanceStats,
  triggerAttendanceMarking,
  getCronStatus
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/:userId', getAttendance);
router.post('/mark-absences', markAbsences);
router.post('/mark-absences-range', markAbsencesForRange);
router.get('/stats/:userId', getAttendanceStats);
router.post('/trigger-marking', triggerAttendanceMarking);
router.get('/cron-status', getCronStatus);

export default router; 