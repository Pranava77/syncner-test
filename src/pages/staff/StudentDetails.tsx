import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  TargetIcon, 
  StarIcon,
  RocketIcon,
  IdCardIcon,
  HomeIcon,
  CalendarIcon as CalendarDaysIcon
} from '@radix-ui/react-icons';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useStaff } from '../../hooks/useStaff';
import EnhancedLearningTimeline from '../../components/EnhancedLearningTimeline';

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  
  const { 
    selectedStudent, 
    studentDetailsLoading, 
    error, 
    getStudentDetails, 
    clearSelectedStudent 
  } = useStaff();
  
  // State for enhanced timeline
  const [enhancedTimeline, setEnhancedTimeline] = useState<any[]>([]);
  
  // Use selectedStudent data from backend
  const studentData = selectedStudent;

  // Fetch student details when component mounts
  useEffect(() => {
    if (studentId) {
      getStudentDetails(studentId);
    }
    
    // Cleanup when component unmounts
    return () => {
      clearSelectedStudent();
    };
  }, [studentId, getStudentDetails, clearSelectedStudent]);

  // Transform portfolio data for enhanced timeline
  useEffect(() => {
    if (studentData && studentData.careerTrack && studentData.learningLevels) {
      const enhancedData = studentData.learningLevels.map((level: any) => ({
        level: level.level || level.order || 1,
        courseName: level.courseName || level.title || `Level ${level.level || level.order || 1}`,
        description: level.description || 'Learning level',
        status: level.status || 'not-started',
        learn: {
          completed: level.learn?.completed || false,
          startTime: level.learn?.startTime || null,
          endTime: level.learn?.endTime || null,
          timeSpent: level.learn?.timeSpent || 0,
          title: level.learn?.title || 'Learning Materials',
          status: level.learn?.status || 'not-started',
          materials: level.learn?.materials || level.learn?.content || []
        },
        test: {
          completed: level.test?.completed || false,
          score: level.test?.score || 0,
          attempts: level.test?.attempts || 0,
          startTime: level.test?.startTime || null,
          endTime: level.test?.endTime || null,
          title: level.test?.title || 'Assessment',
          status: level.test?.status || 'not-started',
          questions: level.test?.questions || level.test?.content || []
        },
        exercise: {
          completed: level.exercise?.completed || false,
          startTime: level.exercise?.startTime || null,
          endTime: level.exercise?.endTime || null,
          timeSpent: level.exercise?.timeSpent || 0,
          title: level.exercise?.title || 'Practice Exercise',
          status: level.exercise?.status || 'not-started',
          tasks: level.exercise?.tasks || level.exercise?.content || []
        }
      }));
      
      setEnhancedTimeline(enhancedData);
      console.log('📚 Enhanced timeline data from portfolio:', enhancedData);
      
      // Debug: Log enrollment date data
      console.log('📅 Enrollment Date Debug:', {
        createdAt: studentData.createdAt,
        enrolledDate: studentData.enrolledDate,
        formattedCreatedAt: studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString('en-GB') : null
      });
      
      // Debug: Log learning levels data
      console.log('📚 Learning Levels Debug:', {
        hasLearningLevels: !!studentData.learningLevels,
        learningLevelsCount: studentData.learningLevels?.length || 0,
        learningLevels: studentData.learningLevels
      });
    }
  }, [studentData?.careerTrack, studentData?.learningLevels]);










  
  // Show loading state while data is being fetched
  if (studentDetailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>Loading student details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Error Loading Student</h2>
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          <button 
            onClick={() => getStudentDetails(studentId!)}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Show message if no student data is available
  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No Student Data</h2>
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-muted)' }}>Student information not found.</p>
          <button 
            onClick={() => navigate('/staff/students')}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  // Radar chart data for performance overview using real endpoint data
  const radarData = [
    { metric: 'Attendance', value: studentData.attendancePercentage || 0 },
    { metric: 'Leaderboard', value: studentData.leaderboardScore || 0 },
    { metric: 'Progress', value: studentData.progress || 0 }
  ];

  const getAttendanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const getProgressLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const getLeaderboardLabel = (score: number) => {
    if (score >= 90) return 'Top Performer';
    if (score >= 80) return 'High Achiever';
    if (score >= 70) return 'Good Standing';
    return 'Room for Growth';
  };

  return (
    <div 
      className="min-h-screen p-4 lg:p-8"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/students')}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 
              className="text-3xl font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Student Details
            </h1>
            <p 
              className="mt-1 font-label"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Comprehensive view of student performance and progress
            </p>
          </div>
        </div>
        

      </div>

      {/* Top Section: Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Student ID Card */}
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <IdCardIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Student ID</p>
            <p 
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData._id}</p>
          </div>
        </div>

        {/* Department Card */}
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <HomeIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Department</p>
            <p 
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData.department}</p>
          </div>
        </div>

        {/* Batch Card */}
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <CalendarDaysIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Batch</p>
            <p 
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData.batch}</p>
          </div>
        </div>

        {/* Career Track Card */}
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <RocketIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Career Track</p>
            <p 
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData.careerTrack}</p>
          </div>
        </div>
      </div>

      {/* Middle Section: Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Student Details */}
        <div 
          className="rounded-xl shadow-sm p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 
            className="text-xl font-heading mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Student Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Full Name
              </span>
              <span 
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {studentData.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Email
              </span>
              <span 
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {studentData.email}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Enrollment Date
              </span>
              <span 
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString('en-GB') : 
                 studentData?.enrolledDate || 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Current Level
              </span>
              <span 
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {studentData?.currentLevel || 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span 
                className="text-sm font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Status
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: studentData.status === 'active' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                  color: studentData.status === 'active' ? 'var(--color-success)' : 'var(--color-error)'
                }}
              >
                {studentData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Performance Overview */}
        <div 
          className="rounded-xl shadow-sm p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 
            className="text-xl font-heading mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Performance Overview
          </h2>
          
          {/* Radar Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Student Metrics"
                  dataKey="value"
                  stroke="var(--color-accent-primary)"
                  fill="var(--color-accent-primary)"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div 
            className="text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Attendance, Leaderboard Score, and Progress Overview
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <CalendarIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Attendance</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData.attendancePercentage}%</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getAttendanceLabel(studentData.attendancePercentage)}
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {studentData.presentDays}/{studentData.totalDays} days • Streak: {studentData.currentStreak}
            </p>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <TargetIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Progress</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData.progress}%</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getProgressLabel(studentData.progress)}
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Level {studentData.currentLevel} • {studentData.completedLevels}/{studentData.totalLevels} completed
            </p>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-sm p-6 flex items-center gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
          >
            <StarIcon 
              className="h-6 w-6" 
              style={{ color: 'var(--color-accent-primary)' }}
            />
          </div>
          <div>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >Leaderboard</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >{studentData.leaderboardScore}</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getLeaderboardLabel(studentData.leaderboardScore)}
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {studentData.leaderboardRank ? `Rank: ${studentData.leaderboardRank}` : 'No rank yet'}
            </p>
          </div>
        </div>
      </div>



      {/* Enhanced Learning Journey Section */}
      <div className="mb-12 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 rounded-3xl"></div>
        
        <div className="relative z-10 text-center mb-10">
          {/* Animated icon container */}
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg"
            style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <RocketIcon className="w-10 h-10" style={{ color: 'var(--color-accent-primary)' }} />
          </motion.div>
          
          {/* Enhanced title with gradient and shadow */}
          <motion.h2
            className="text-5xl font-heading mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Learning Journey
          </motion.h2>
          
          {/* Enhanced description */}
          <motion.p
            className="text-xl font-label max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-tertiary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Track your student's learning progress through interactive levels and real-time completion status
          </motion.p>
          
          {/* Decorative line */}
          <motion.div
            className="w-24 h-1 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          ></motion.div>
        </div>



        {/* Enhanced Timeline Display */}
        {enhancedTimeline.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Success indicator */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
                style={{ backgroundColor: 'var(--color-success-bg)', border: '2px solid var(--color-success)' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                  {enhancedTimeline.length} Levels Available
                </span>
              </motion.div>
            </div>
            
            {/* Timeline container with enhanced styling */}
            <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
              {/* Enhanced background patterns */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
              </div>
              
              {/* Content container */}
              <div className="relative z-10 p-8">
                <EnhancedLearningTimeline 
                  timeline={enhancedTimeline}
                />
              </div>
              
              {/* Bottom accent border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-24 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Enhanced background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20 bg-gradient-to-br from-blue-200 to-purple-200 blur-2xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full opacity-20 bg-gradient-to-tl from-purple-200 to-blue-200 blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-10 bg-gradient-to-r from-indigo-200 to-blue-200 blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              {/* Animated icon */}
              <motion.div
                className="text-8xl mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                📚
              </motion.div>
              
              <motion.h3 
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Learning Journey
              </motion.h3>
              
              <motion.p 
                className="text-xl mb-10 max-w-lg mx-auto leading-relaxed"
                style={{ color: 'var(--color-text-tertiary)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your student's learning progress will appear here once they start their journey
              </motion.p>
              
              {/* Enhanced decorative elements */}
              <motion.div 
                className="flex justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ backgroundColor: 'var(--color-accent-primary)' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                ></motion.div>
                <motion.div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ backgroundColor: 'var(--color-accent-secondary)' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                ></motion.div>
                <motion.div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                ></motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Debug: Show timeline data structure */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug: Enhanced Timeline Data</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(enhancedTimeline, null, 2)}
          </pre>
          
          <h4 className="font-semibold mb-2 mt-4">Debug: Student Data</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              careerTrack: studentData.careerTrack,
              progress: studentData.progress,
              currentLevel: studentData.currentLevel,
              createdAt: studentData.createdAt,
              enrolledDate: studentData.enrolledDate,
              attendancePercentage: studentData.attendancePercentage,
              leaderboardScore: studentData.leaderboardScore,
              learningLevels: studentData.learningLevels?.length || 0
            }, null, 2)}
          </pre>
          
          <h4 className="font-semibold mb-2 mt-4">Debug: Raw Learning Levels</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(studentData.learningLevels, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

export default StudentDetails;
