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
import EnhancedLearningTimeline from '../../components/EnhancedLearningTimeline';
import { StudentTimelineService, CombinedTimelineLevel } from '../../services/studentTimelineService';
import apiService from '../../services/api';

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
  const [enhancedTimeline, setEnhancedTimeline] = useState<any[]>([]);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
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
      generateTimelineFromBackendData();
      
      // Transform portfolio data for enhanced timeline
      if (studentData.learningLevels && Array.isArray(studentData.learningLevels)) {
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
      }
      
      // If no backend timeline data, try curriculum data as fallback
      setTimeout(() => {
        if (dynamicTimeline.length === 0) {
          generateTimelineFromCurriculum();
        }
      }, 1000);
      
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
  }, [studentData?.careerTrack]);

  // Function to generate dynamic timeline using StudentTimelineService
  const generateDynamicTimeline = async () => {
    if (!studentId || !studentData?.careerTrack) return;
    
    setIsGeneratingTimeline(true);
    setTimelineError(null);
    
    try {
      const timeline = await StudentTimelineService.generateStudentTimeline(studentId);
      setDynamicTimeline(timeline);
      setLastRefreshTime(new Date());
    } catch (error) {
      setTimelineError(error instanceof Error ? error.message : 'Failed to generate timeline');
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  // Function to manually refresh timeline
  const refreshTimeline = () => {
    if (studentId) {
      // Refresh student data from backend to get latest learningLevels
      getStudentDetails(studentId);
    }
    // Also try to generate dynamic timeline as fallback
    generateDynamicTimeline();
    // Try curriculum data as another fallback
    generateTimelineFromCurriculum();
  };

  // Function to generate timeline from backend data
  const generateTimelineFromBackendData = () => {
    if (!studentData) return;
    
    try {
      // Transform backend learningLevels data to match DetailedLearningTimeline component structure
      let timelineData: any[] = [];
      
      // Check if we have learning levels data from backend
      if (studentData.learningLevels && Array.isArray(studentData.learningLevels)) {
        timelineData = studentData.learningLevels.map((level: any) => ({
          levelOrder: level.level || level.order || 1,
          levelTitle: level.courseName || level.title || `Level ${level.level || level.order || 1}`,
          levelDescription: level.description || 'Learning level',
          overallStatus: level.status || 'not-started',
          sections: {
            learn: {
              status: level.learn?.completed ? 'completed' : level.learn?.startTime ? 'in-progress' : 'not-started',
              details: {
                startDate: level.learn?.startTime || null,
                endDate: level.learn?.endTime || null,
                timeSpent: level.learn?.timeSpent || 0,
                isCompleted: level.learn?.completed || false
              },
              title: 'Learning Materials'
            },
            test: {
              status: level.test?.completed ? 'completed' : level.test?.startTime ? 'in-progress' : 'not-started',
              details: {
                startDate: level.test?.startTime || null,
                endDate: level.test?.startTime || null, // Use startTime as endTime for tests
                score: level.test?.score || 0,
                attempts: level.test?.attempts || 0,
                isCompleted: level.test?.completed || false
              },
              title: 'Assessment'
            },
            exercise: {
              status: level.exercise?.completed ? 'completed' : level.exercise?.startTime ? 'in-progress' : 'not-started',
              details: {
                startDate: level.exercise?.startTime || null,
                endDate: level.exercise?.startTime || null, // Use startTime as endTime for exercises
                timeSpent: level.exercise?.timeSpent || 0,
                isCompleted: level.exercise?.completed || false
              },
              title: 'Practice Exercise'
            }
          }
        }));
      }
      
      // If we have backend timeline data, use it
      if (timelineData.length > 0) {
        setDynamicTimeline(timelineData);
        setLastRefreshTime(new Date());
        setTimelineError(null);
        console.log('📚 Generated timeline from backend data:', timelineData);
      }
    } catch (error) {
      console.error('Error generating timeline from backend data:', error);
      setTimelineError('Failed to generate timeline from backend data');
    }
  };

  // Function to generate timeline from curriculum data (fallback when backend doesn't provide progress)
  const generateTimelineFromCurriculum = async () => {
    if (!studentData?.careerTrack) return;
    
    try {
      // Get curriculum data for this career track
      const curriculumResponse = await fetch(`/api/training/levels?track=${studentData.careerTrack}`);
      const curriculumData = await curriculumResponse.json();
      
      if (curriculumData.success && curriculumData.data) {
        const timelineData = curriculumData.data.map((level: any) => ({
          levelOrder: level.order || 1,
          levelTitle: level.title || `Level ${level.order || 1}`,
          levelDescription: level.description || 'Learning level',
          overallStatus: 'not-started', // Default status since we don't have progress data
          sections: {
            learn: {
              status: 'not-started',
              details: {
                startDate: null,
                endDate: null,
                timeSpent: 0,
                isCompleted: false
              },
              title: 'Learning Materials',
              content: level.learn || []
            },
            test: {
              status: 'not-started',
              details: {
                startDate: null,
                endDate: null,
                score: 0,
                attempts: 0,
                isCompleted: false
              },
              title: 'Assessment',
              content: level.test || []
            },
            exercise: {
              status: 'not-started',
              details: {
                startDate: null,
                endDate: null,
                timeSpent: 0,
                isCompleted: false
              },
              title: 'Practice Exercise',
              content: level.exercise || []
            }
          }
        }));
        
        if (timelineData.length > 0) {
          setDynamicTimeline(timelineData);
          setLastRefreshTime(new Date());
          setTimelineError(null);
          console.log('📚 Generated timeline from curriculum data:', timelineData);
        }
      }
    } catch (error) {
      console.error('Error generating timeline from curriculum:', error);
      setTimelineError('Failed to generate timeline from curriculum data');
    }
  };


  
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



      {/* Dynamic Learning Timeline Section */}
         <div className="mb-8">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h2
                 className="text-3xl font-heading mb-3"
                 style={{ color: 'var(--color-text-primary)' }}
               >
                 🚀 Learning Journey
               </h2>
               <p
                 className="font-label text-lg"
                 style={{ color: 'var(--color-text-tertiary)' }}
               >
                 Real-time progress tracking with completion timestamps
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
                 className="px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105 active:scale-95"
                 style={{
                   backgroundColor: 'var(--color-accent-primary)',
                   color: 'var(--color-text-inverse)'
                 }}
               >
                 <div className={`w-5 h-5 ${isGeneratingTimeline ? 'animate-spin' : ''}`}>
                   {isGeneratingTimeline ? (
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                   ) : (
                     <ArrowUpIcon className="w-5 h-5" />
                   )}
                 </div>
                 <span className="text-base">{isGeneratingTimeline ? 'Generating...' : '🔄 Refresh Data'}</span>
               </button>
          </div>
        </div>

                   {/* Timeline Error Display */}
           {timelineError && (
             <motion.div 
               className="mb-6 p-6 rounded-2xl border-2 shadow-lg"
               style={{
                 backgroundColor: 'var(--color-error-bg)',
                 borderColor: 'var(--color-error)',
                 color: 'var(--color-error)'
               }}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3 }}
             >
               <div className="flex items-center gap-3 mb-3">
                 <span className="text-2xl">⚠️</span>
                 <div>
                   <h4 className="font-semibold text-lg">Timeline Generation Failed</h4>
                   <p className="text-sm opacity-90">{timelineError}</p>
                 </div>
               </div>
               <button
                 onClick={refreshTimeline}
                 className="px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 font-medium"
               >
                 🔄 Try Again
               </button>
             </motion.div>
           )}

           {/* Dynamic Timeline Display */}
           {dynamicTimeline.length > 0 ? (
             <div>
               {/* Success Message */}
               <motion.div 
                 className="mb-6 p-4 rounded-2xl border-2 shadow-lg"
                 style={{
                   backgroundColor: 'var(--color-success-bg)',
                   borderColor: 'var(--color-success)',
                   color: 'var(--color-success)'
                 }}
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
               >
                 <div className="flex items-center gap-3">
                   <span className="text-2xl">🎉</span>
                   <div>
                     <h4 className="font-semibold text-lg">Learning Journey Loaded!</h4>
                     <p className="text-sm opacity-90">Displaying {dynamicTimeline.length} levels from backend progress data</p>
                   </div>
                 </div>
               </motion.div>
            
            <EnhancedLearningTimeline 
              timeline={enhancedTimeline}
              fromDate={fromDate}
              toDate={toDate}
              onDateChange={(from, to) => {
                setFromDate(from);
                setToDate(to);
              }}
            />
          </div>
                   ) : (
             <motion.div 
               className="text-center py-16"
               style={{ color: 'var(--color-text-muted)' }}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
             >
               {isGeneratingTimeline ? (
                 <div className="flex flex-col items-center justify-center gap-4">
                   <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--color-accent-primary)' }}></div>
                   <div className="text-center">
                     <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                       Generating Your Timeline
                     </h3>
                     <p className="text-lg">Fetching curriculum data and progress information...</p>
                   </div>
                 </div>
               ) : (
                 <div>
                   <div className="text-8xl mb-6">🚀</div>
                   <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                     Learning Journey Ready
                   </h3>
                   <p className="text-lg mb-6">Click refresh to load the latest progress data from backend</p>
                   <button
                     onClick={refreshTimeline}
                     className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                     style={{
                       backgroundColor: 'var(--color-accent-primary)',
                       color: 'var(--color-text-inverse)'
                     }}
                   >
                     🔄 Refresh Data
                   </button>
                 </div>
               )}
             </motion.div>
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
