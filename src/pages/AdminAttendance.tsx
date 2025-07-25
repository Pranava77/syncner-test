import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchAllUsers } from '../redux/slices/userSlice';
import {
  CalendarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  PlayIcon,
  StopIcon
} from '@radix-ui/react-icons';
import apiService from '../services/api';

const AdminAttendance: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading } = useAppSelector((state) => state.users);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendanceStats, setAttendanceStats] = useState<any>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await dispatch(fetchAllUsers({ role: 'student' })).unwrap();
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, [dispatch]);

  const students = users.filter((user: any) => user.role === 'student');

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleMarkAbsencesForDate = async () => {
    if (!selectedDate) {
      showMessage('error', 'Please select a date');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await apiService.markAbsences(selectedDate);
      showMessage('success', `Successfully marked ${result.data.markedAbsences} absences for ${selectedDate}`);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to mark absences');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAbsencesForRange = async () => {
    if (!startDate || !endDate) {
      showMessage('error', 'Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showMessage('error', 'Start date must be before end date');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await apiService.markAbsencesForRange(startDate, endDate);
      showMessage('success', `Successfully marked ${result.data.totalMarked} absences across ${result.data.daysProcessed} days`);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to mark absences for range');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAbsencesForYesterday = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    setIsProcessing(true);
    try {
      const result = await apiService.markAbsences(yesterdayStr);
      showMessage('success', `Successfully marked ${result.data.markedAbsences} absences for yesterday (${yesterdayStr})`);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to mark absences for yesterday');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetAttendanceStats = async () => {
    if (!startDate || !endDate) {
      showMessage('error', 'Please select both start and end dates for statistics');
      return;
    }

    setIsProcessing(true);
    try {
      // Get stats for all students
      const allStats = [];
      for (const student of students) {
        try {
          const stats = await apiService.getAttendanceStats(student._id || student.id, startDate, endDate);
          allStats.push({
            student: student.name,
            ...stats.data
          });
        } catch (error) {
          console.error(`Failed to get stats for ${student.name}:`, error);
        }
      }
      setAttendanceStats(allStats);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to get attendance statistics');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-offblack p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-paperwhite font-heading">Attendance Management</h1>
          <p className="text-teallight mt-1 font-label">Manage student attendance and mark absences automatically</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Mark Absences for Yesterday */}
          <div className="bg-paperwhite/10 rounded-xl p-6 border border-paperwhite/20">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="h-6 w-6 text-trueturquoise" />
              <h3 className="text-lg font-semibold text-paperwhite">Yesterday's Absences</h3>
            </div>
            <p className="text-teallight text-sm mb-4">
              Mark all students as absent for yesterday if they didn't log in
            </p>
            <button
              onClick={handleMarkAbsencesForYesterday}
              disabled={isProcessing}
              className="w-full bg-trueturquoise text-offblack py-2 px-4 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Mark Yesterday's Absences
                </>
              )}
            </button>
          </div>

          {/* Mark Absences for Specific Date */}
          <div className="bg-paperwhite/10 rounded-xl p-6 border border-paperwhite/20">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="h-6 w-6 text-trueturquoise" />
              <h3 className="text-lg font-semibold text-paperwhite">Specific Date</h3>
            </div>
            <div className="space-y-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise"
              />
              <button
                onClick={handleMarkAbsencesForDate}
                disabled={isProcessing || !selectedDate}
                className="w-full bg-trueturquoise text-offblack py-2 px-4 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Mark Absences
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mark Absences for Date Range */}
          <div className="bg-paperwhite/10 rounded-xl p-6 border border-paperwhite/20">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="h-6 w-6 text-trueturquoise" />
              <h3 className="text-lg font-semibold text-paperwhite">Date Range</h3>
            </div>
            <div className="space-y-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise"
              />
              <button
                onClick={handleMarkAbsencesForRange}
                disabled={isProcessing || !startDate || !endDate}
                className="w-full bg-trueturquoise text-offblack py-2 px-4 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Mark Range Absences
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-paperwhite/10 rounded-xl p-6 border border-paperwhite/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-paperwhite">Attendance Statistics</h3>
              <p className="text-teallight text-sm">View attendance statistics for a date range</p>
            </div>
            <button
              onClick={handleGetAttendanceStats}
              disabled={isProcessing || !startDate || !endDate}
              className="bg-paperwhite/20 text-paperwhite py-2 px-4 rounded-lg hover:bg-trueturquoise/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ReloadIcon className="h-4 w-4" />
              Get Stats
            </button>
          </div>

          {attendanceStats && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-paperwhite/20">
                    <th className="text-left py-3 px-4 text-teallight font-medium">Student</th>
                    <th className="text-left py-3 px-4 text-teallight font-medium">Total Days</th>
                    <th className="text-left py-3 px-4 text-teallight font-medium">Present</th>
                    <th className="text-left py-3 px-4 text-teallight font-medium">Absent</th>
                    <th className="text-left py-3 px-4 text-teallight font-medium">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceStats.map((stat: any, index: number) => (
                    <tr key={index} className="border-b border-paperwhite/10">
                      <td className="py-3 px-4 text-paperwhite font-medium">{stat.student}</td>
                      <td className="py-3 px-4 text-paperwhite">{stat.total}</td>
                      <td className="py-3 px-4 text-green-400 flex items-center gap-2">
                        <CheckCircledIcon className="h-4 w-4" />
                        {stat.present}
                      </td>
                      <td className="py-3 px-4 text-red-400 flex items-center gap-2">
                        <CrossCircledIcon className="h-4 w-4" />
                        {stat.absent}
                      </td>
                      <td className="py-3 px-4 text-paperwhite">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stat.attendanceRate >= 80 ? 'bg-green-500/20 text-green-400' :
                          stat.attendanceRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {stat.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student List */}
        <div className="bg-paperwhite/10 rounded-xl p-6 border border-paperwhite/20">
          <h3 className="text-xl font-semibold text-paperwhite mb-4">Student List ({students.length})</h3>
          {loading ? (
            <div className="text-center py-8">
              <ReloadIcon className="h-8 w-8 text-trueturquoise animate-spin mx-auto mb-2" />
              <p className="text-teallight">Loading students...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student: any) => (
                <div key={student._id || student.id} className="bg-offblack p-4 rounded-lg border border-paperwhite/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-trueturquoise p-2 rounded-full">
                      <span className="text-offblack font-bold text-sm">
                        {student.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="text-paperwhite font-medium">{student.name}</p>
                      <p className="text-teallight text-sm">{student.email}</p>
                      {student.careerTrack && (
                        <p className="text-teallight text-xs">{student.careerTrack}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance; 