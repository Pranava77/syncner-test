import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon,
  TargetIcon,
  BarChartIcon,
  RocketIcon,
  FileTextIcon
} from '@radix-ui/react-icons';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StudentDetails: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('dd-mm-yyyy');
  const [toDate, setToDate] = useState('dd-mm-yyyy');

  // Mock student data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setStudentData({
        rollNumber: '713315104704',
        studentName: 'Ramesh',
        courseDept: 'B.E IT',
        batch: '2023-2027',
        enrolledCareerTrack: 'Full Stack Development',
        enrolledDate: '21-03-2025',
        profileInitial: 'M',
        performance: {
          performance: 85,
          potential: 90,
          contribution: 78,
          creativity: 82,
          skill: 88,
          teamwork: 80
        },
        summaryStats: {
          avgAttendance: 80,
          progress: 80,
          leaderboard: 80
        },
        learningTimeline: [
          {
            level: 3,
            courseName: 'Introduction to HTML',
            status: 'in-progress',
            learn: { completed: true, startTime: 'Start date and time', endTime: 'End Date and Time' },
            test: { completed: true, score: 80, attempts: 2, startTime: 'Start date and time', endTime: 'End Date and Time' },
            exercise: { completed: false, startTime: '14/08/2025 09:03 PM', endTime: 'In-Progress' }
          },
          {
            level: 2,
            courseName: 'Introduction to HTML',
            status: 'completed',
            learn: { completed: true, startTime: 'Start date and time', endTime: 'End Date and Time' },
            test: { completed: true, score: 80, attempts: 2, startTime: 'Start date and time', endTime: 'End Date and Time' },
            exercise: { completed: true, startTime: 'Start date and time', endTime: 'End Date and Time' }
          },
          {
            level: 1,
            courseName: 'Introduction to HTML',
            status: 'completed',
            learn: { completed: true, startTime: 'Start date and time', endTime: 'End Date and Time' },
            test: { completed: true, score: 80, attempts: 2, startTime: 'Start date and time', endTime: 'End Date and Time' },
            exercise: { completed: true, startTime: 'Start date and time', endTime: 'End Date and Time' }
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const radarData = [
    { subject: 'Performance', A: studentData?.performance?.performance || 0, fullMark: 100 },
    { subject: 'Potential', A: studentData?.performance?.potential || 0, fullMark: 100 },
    { subject: 'Contribution', A: studentData?.performance?.contribution || 0, fullMark: 100 },
    { subject: 'Creativity', A: studentData?.performance?.creativity || 0, fullMark: 100 },
    { subject: 'Skill', A: studentData?.performance?.skill || 0, fullMark: 100 },
    { subject: 'Teamwork', A: studentData?.performance?.teamwork || 0, fullMark: 100 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircledIcon className="w-5 h-5" style={{ color: '#10B981' }} />;
      case 'in-progress':
        return <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>;
      default:
        return <ClockIcon className="w-5 h-5" style={{ color: '#6B7280' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Loading student details...
          </p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            No student data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-heading font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Student Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Details */}
          <div className="lg:col-span-2">
            {/* Student Details Card */}
            <div 
              className="p-6 rounded-xl shadow-lg mb-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Student Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Roll number:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{studentData.rollNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Student Name:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{studentData.studentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Course & Dept:</span>
                  <span className="font-semibold opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{studentData.courseDept}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Batch:</span>
                  <span className="font-semibold opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{studentData.batch}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Enrolled Career Track:</span>
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{ 
                      backgroundColor: '#8B5CF6',
                      color: 'white'
                    }}
                  >
                    {studentData.enrolledCareerTrack}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Enrolled Date:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{studentData.enrolledDate}</span>
                </div>
              </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Avg Attendance', value: studentData.summaryStats.avgAttendance, subtitle: 'Great/Good/Poor' },
                { label: 'Progress', value: studentData.summaryStats.progress, subtitle: 'Great/Good/Poor' },
                { label: 'Leaderboard', value: studentData.summaryStats.leaderboard, subtitle: '(Career Track Specific)' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-2xl font-bold mb-1">{stat.value}%</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs opacity-70">{stat.subtitle}</div>
                </motion.div>
              ))}
            </div>

            {/* Learning Timeline */}
            <div 
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Learning Timeline:
                </h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>From:</span>
                    <select
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-secondary-bg)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="dd-mm-yyyy">dd-mm-yyyy</option>
                      <option value="01-01-2025">01-01-2025</option>
                      <option value="01-02-2025">01-02-2025</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>To:</span>
                    <select
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-secondary-bg)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="dd-mm-yyyy">dd-mm-yyyy</option>
                      <option value="31-12-2025">31-12-2025</option>
                      <option value="31-01-2026">31-01-2026</option>
                    </select>
                  </div>
                </div>
              </div>

                             <div className="space-y-6">
                 {studentData.learningTimeline.map((level: any, index: number) => (
                   <motion.div
                     key={level.level}
                     className="relative"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                   >
                    {/* Vertical Line */}
                    {index < studentData.learningTimeline.length - 1 && (
                      <div 
                        className="absolute left-6 top-8 w-0.5 h-16"
                        style={{ backgroundColor: 'var(--color-border)' }}
                      />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Level Icon */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(level.status)}
                      </div>

                      {/* Level Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 
                            className="text-lg font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            Level {level.level}: {level.courseName}
                          </h3>
                        </div>

                        <div className="space-y-2">
                                                     {/* Learn */}
                           <div className="flex items-center gap-2">
                             <FileTextIcon className="w-4 h-4" style={{ color: getStatusColor(level.learn.completed ? 'completed' : 'pending') }} />
                             <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                               <strong>Learn:</strong> {level.learn.startTime} -- {level.learn.endTime}
                             </span>
                           </div>

                          {/* Test */}
                          <div className="flex items-center gap-2">
                            <TargetIcon className="w-4 h-4" style={{ color: getStatusColor(level.test.completed ? 'completed' : 'pending') }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              <strong>Test ({level.test.score}% - {level.test.attempts} attempts):</strong> {level.test.startTime} -- {level.test.endTime}
                            </span>
                          </div>

                          {/* Exercise */}
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="w-4 h-4" style={{ color: getStatusColor(level.exercise.completed ? 'completed' : 'in-progress') }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              <strong>Exercise:</strong> {level.exercise.startTime} -- {level.exercise.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Performance and Portfolio */}
          <div className="lg:col-span-1">
            {/* Profile Icon */}
            <div 
              className="p-6 rounded-xl shadow-lg mb-6 text-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                style={{ 
                  backgroundColor: '#F97316',
                  color: 'white'
                }}
              >
                {studentData.profileInitial}
              </div>
            </div>

            {/* Radar Chart */}
            <div 
              className="p-6 rounded-xl shadow-lg mb-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 text-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Performance Analysis
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                    />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm opacity-70 mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                (Optional)
              </p>
            </div>

            {/* View Portfolio Button */}
            <div 
              className="p-6 rounded-xl shadow-lg text-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <button 
                className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#6B7280',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4B5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6B7280';
                }}
              >
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetails;
