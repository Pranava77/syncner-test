import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  TargetIcon, 
  CheckCircledIcon,
  StarIcon,
  FileTextIcon,
  RocketIcon,
  ArrowUpIcon,
  PersonIcon,
  IdCardIcon,
  HomeIcon,
  CalendarIcon as CalendarDaysIcon
} from '@radix-ui/react-icons';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useStaff } from '../../hooks/useStaff';
import DetailedLearningTimeline from '../../components/DetailedLearningTimeline';
import { StudentTimelineService, CombinedTimelineLevel } from '../../services/studentTimelineService';

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
  
  // State for dynamic timeline generation
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [dynamicTimeline, setDynamicTimeline] = useState<CombinedTimelineLevel[]>([]);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
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

  // Dynamic timeline generation when student data changes
  useEffect(() => {
    if (studentData && studentData.careerTrack) {
      generateDynamicTimeline();
    }
  }, [studentData?.careerTrack]);

  // Function to generate dynamic timeline using StudentTimelineService
  const generateDynamicTimeline = async () => {
    if (!studentId || !studentData?.careerTrack) return;
    
    setIsGeneratingTimeline(true);
    setTimelineError(null);
    
    try {
      console.log('🔄 Generating dynamic timeline for student:', studentData.name);
      const timeline = await StudentTimelineService.generateStudentTimeline(studentId);
      setDynamicTimeline(timeline);
      setLastRefreshTime(new Date());
      console.log('✅ Dynamic timeline generated successfully:', timeline.length, 'levels');
    } catch (error) {
      console.error('❌ Failed to generate dynamic timeline:', error);
      setTimelineError(error instanceof Error ? error.message : 'Failed to generate timeline');
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  // Function to manually refresh timeline
  const refreshTimeline = () => {
    generateDynamicTimeline();
  };

  // Debug logging
  useEffect(() => {
    if (import.meta.env.DEV && studentData) {
      console.log('StudentDetails - selectedStudent:', selectedStudent);
      console.log('StudentDetails - studentData:', studentData);
      console.log('StudentDetails - learningTimeline:', studentData?.learningTimeline);
      console.log('StudentDetails - learningLevels:', studentData?.learningLevels);
      console.log('StudentDetails - careerTrack:', studentData?.careerTrack);
      console.log('StudentDetails - Timeline length:', studentData?.learningTimeline?.length || 0);
      
      // Log each level in detail
      if (studentData?.learningTimeline) {
        studentData.learningTimeline.forEach((level: any, index: number) => {
          console.log(`StudentDetails - Level ${index + 1}:`, {
            order: level.levelOrder,
            title: level.levelTitle,
            status: level.overallStatus,
            sections: {
              learn: { status: level.sections?.learn?.status, completed: level.sections?.learn?.details?.isCompleted },
              test: { status: level.sections?.test?.status, completed: level.sections?.test?.details?.isCompleted },
              exercise: { status: level.sections?.exercise?.status, completed: level.sections?.exercise?.details?.isCompleted }
            }
          });
        });
      }
    }
  }, [studentData, selectedStudent]);
  
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
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => studentId && getStudentDetails(studentId)}
            disabled={studentDetailsLoading}
            className="px-5 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)' 
            }}
          >
            <div className={`w-4 h-4 ${studentDetailsLoading ? 'animate-spin' : ''}`}>
              {studentDetailsLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <ArrowUpIcon className="w-4 h-4" />
              )}
            </div>
            <span>{studentDetailsLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          {studentData && (
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
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
                {studentData.enrolledDate}
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
                {studentData.level}
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
            >{studentData.leaderboardScore}%</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getLeaderboardLabel(studentData.leaderboardScore)}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Learning Timeline Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 
              className="text-2xl font-heading mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Learning Timeline
            </h2>
            <p 
              className="font-label"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Real-time progress tracking with curriculum data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastRefreshTime && (
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </div>
            )}
            
            <button
              onClick={refreshTimeline}
              disabled={isGeneratingTimeline}
              className="px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)' 
              }}
            >
              <div className={`w-4 h-4 ${isGeneratingTimeline ? 'animate-spin' : ''}`}>
                {isGeneratingTimeline ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
              </div>
              <span>{isGeneratingTimeline ? 'Generating...' : 'Refresh Timeline'}</span>
            </button>
          </div>
        </div>

        {/* Timeline Error Display */}
        {timelineError && (
          <div className="mb-4 p-4 rounded-lg border" style={{ 
            backgroundColor: 'var(--color-error-bg)', 
            borderColor: 'var(--color-error)',
            color: 'var(--color-error)' 
          }}>
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Timeline Error: {timelineError}</span>
            </div>
            <button
              onClick={refreshTimeline}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dynamic Timeline Display */}
        {dynamicTimeline.length > 0 ? (
          <div>
            {/* Success Message */}
            <div className="mb-4 p-3 rounded-lg border" style={{ 
              backgroundColor: 'var(--color-success-bg)', 
              borderColor: 'var(--color-success)',
              color: 'var(--color-success)' 
            }}>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Timeline generated successfully with {dynamicTimeline.length} levels</span>
              </div>
            </div>
            
            <DetailedLearningTimeline timeline={dynamicTimeline} />
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            {isGeneratingTimeline ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Generating timeline...</span>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📚</div>
                <p>No timeline data available</p>
                <p className="text-sm mt-1">Click the button below to generate a dynamic timeline</p>
                <button
                  onClick={refreshTimeline}
                  className="mt-3 px-4 py-2 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'var(--color-text-inverse)' 
                  }}
                >
                  Generate Timeline
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Debug: Show timeline data structure */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug: Dynamic Timeline Data</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(dynamicTimeline, null, 2)}
          </pre>
          
          <h4 className="font-semibold mb-2 mt-4">Debug: Student Data</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              careerTrack: studentData.careerTrack,
              progress: studentData.progress,
              learningLevels: studentData.learningLevels
            }, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

export default StudentDetails;
