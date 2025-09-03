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
  
  // Debug: Log the student data to see what we're receiving
  useEffect(() => {
    if (studentData) {
      console.log('🔍 StudentDetails received data:', {
        name: studentData.name,
        careerTrack: studentData.careerTrack,
        progress: studentData.progress,
        currentLevel: studentData.currentLevel,
        completedLevels: studentData.completedLevels,
        totalLevels: studentData.totalLevels,
        hasLearningLevels: !!studentData.learningLevels,
        learningLevelsCount: studentData.learningLevels?.length || 0,
        hasLearningTimeline: !!studentData.learningTimeline,
        learningTimelineCount: studentData.learningTimeline?.length || 0
      });
    }
  }, [studentData]);

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
    if (studentData && studentData.careerTrack) {
      // Use learningLevels if available, otherwise use learningTimeline
      const levelsData = studentData.learningLevels || studentData.learningTimeline || [];
      
      const enhancedData = levelsData.map((level: any) => {
        // Handle both learningLevels format and learningTimeline format
        const isTimelineFormat = level.sections !== undefined;
        
        let learnCompleted, testCompleted, exerciseCompleted;
        let learnProgress, testProgress, exerciseProgress;
        
        if (isTimelineFormat) {
          // Using learningTimeline format
          learnCompleted = level.sections?.learn?.status === 'completed';
          testCompleted = level.sections?.test?.status === 'completed';
          exerciseCompleted = level.sections?.exercise?.status === 'completed';
          
          learnProgress = learnCompleted ? 100 : 0;
          testProgress = level.sections?.test?.details?.bestScore || 0;
          exerciseProgress = exerciseCompleted ? 100 : 0;
        } else {
          // Using learningLevels format
          learnCompleted = level.learn?.completed || false;
          testCompleted = level.test?.completed || false;
          exerciseCompleted = level.exercise?.completed || false;
          
          learnProgress = learnCompleted ? 100 : 
            level.learn?.materials?.filter((m: any) => m.completed).length / (level.learn?.materials?.length || 1) * 100 || 0;
          
          testProgress = testCompleted ? 100 : level.test?.score || 0;
          
          exerciseProgress = exerciseCompleted ? 100 :
            level.exercise?.tasks?.filter((t: any) => t.completed).length / (level.exercise?.tasks?.length || 1) * 100 || 0;
        }
        
        // Calculate overall level status based on section completion
        let status = 'not-started';
        if (learnCompleted && testCompleted && exerciseCompleted) {
          status = 'completed';
        } else if (learnCompleted || testCompleted || exerciseCompleted) {
          status = 'in-progress';
        }

        // Get level number from either format
        const levelNumber = isTimelineFormat ? level.levelOrder : level.level;
        const levelTitle = isTimelineFormat ? level.levelTitle : level.courseName;
        const levelDescription = isTimelineFormat ? level.levelDescription : level.description;

        // Get submission links and scores from the API response
        const exerciseTasks = level.exercise?.tasks?.map((task: any) => ({
          ...task,
          submissionLink: task.submissionLinks?.[0] || task.submissionLink || null,
          score: task.score || 0,
          attempts: task.attempts || 0,
          lastAttemptAt: task.lastAttemptAt || null,
          feedback: task.feedback || '',
          status: task.status || 'not-submitted'
        })) || [];

        return {
          level: levelNumber,
          courseName: levelTitle,
          description: levelDescription,
          status: status as 'completed' | 'in-progress' | 'not-started',
          learn: {
            completed: learnCompleted,
            startTime: isTimelineFormat ? level.sections?.learn?.details?.startDate : level.learn?.startTime || null,
            endTime: isTimelineFormat ? level.sections?.learn?.details?.endDate : level.learn?.endTime || null,
            timeSpent: isTimelineFormat ? level.sections?.learn?.details?.timeSpent : level.learn?.timeSpent || 0,
            title: level.learn?.title || 'Learning Materials',
            status: level.learn?.status || 'not-started',
            materials: level.learn?.materials || [],
            progress: learnProgress
          },
          test: {
            completed: testCompleted,
            score: level.test?.score || 0,
            attempts: isTimelineFormat ? level.sections?.test?.details?.attempts?.length || 0 : level.test?.attempts || 0,
            startTime: isTimelineFormat ? level.sections?.test?.details?.startDate : level.test?.startTime || null,
            endTime: isTimelineFormat ? level.sections?.test?.details?.endDate : level.test?.endTime || null,
            title: level.test?.title || 'Assessment',
            status: level.test?.status || 'not-started',
            questions: level.test?.questions || [],
            progress: testProgress
          },
          exercise: {
            completed: exerciseCompleted,
            startTime: isTimelineFormat ? level.sections?.exercise?.details?.startDate : level.exercise?.startTime || null,
            endTime: isTimelineFormat ? level.sections?.exercise?.details?.endDate : level.exercise?.endTime || null,
            timeSpent: isTimelineFormat ? level.sections?.exercise?.details?.timeSpent : level.exercise?.timeSpent || 0,
            title: level.exercise?.title || 'Practice Exercise',
            status: level.exercise?.status || 'not-started',
            tasks: exerciseTasks,
            progress: exerciseProgress
          }
        };
      });
      
      setEnhancedTimeline(enhancedData);
    }
  }, [studentData]);

  // Listen for progress updates from other components
  useEffect(() => {
    const handleProgressUpdate = () => {
      // Refetch student details when progress is updated
      if (studentId) {
        getStudentDetails(studentId);
      }
    };

    // Listen for progress update events
    window.addEventListener('progress-updated', handleProgressUpdate);
    window.addEventListener('level-completed', handleProgressUpdate);
    window.addEventListener('section-completed', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
      window.removeEventListener('level-completed', handleProgressUpdate);
      window.removeEventListener('section-completed', handleProgressUpdate);
    };
  }, [studentId, getStudentDetails]);

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
    { metric: 'Attendance', value: studentData?.attendancePercentage || 0 },
    { metric: 'Leaderboard', value: studentData?.leaderboardScore || 0 },
    { metric: 'Progress', value: studentData?.progress || 0 }
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
            >{studentData?.attendancePercentage || 0}%</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getAttendanceLabel(studentData?.attendancePercentage || 0)}
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
            >{studentData?.progress || 0}%</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getProgressLabel(studentData?.progress || 0)}
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
            >{studentData?.leaderboardScore || 0}</p>
            <p 
              className="text-xs flex items-center mt-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {getLeaderboardLabel(studentData?.leaderboardScore || 0)}
            </p>
          </div>
        </div>
      </div>



      {/* Dynamic Learning Timeline Section */}
         <div className="mb-8">
           <div className="flex items-center justify-between mb-8">
             <div>
               <h2
                 className="text-2xl font-bold mb-2"
                 style={{ color: 'var(--color-text-primary)' }}
               >
                 Learning Journey
               </h2>
               <p
                 className="text-sm"
                 style={{ color: 'var(--color-text-secondary)' }}
               >
                 Track student progress across all learning levels
               </p>
             </div>
             
             {/* Portfolio Button */}
             <button
               className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
               style={{
                 backgroundColor: 'var(--color-accent-primary)',
                 color: 'var(--color-text-inverse)',
                 border: '1px solid var(--color-accent-primary)'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
               }}
               onClick={() => {
                 console.log('Portfolio button clicked, navigating to:', `/staff/portfolio/${studentId}`);
                 navigate(`/staff/portfolio/${studentId}`);
               }}
             >
               View Portfolio
             </button>
           </div>



           {/* Enhanced Timeline Display */}
           {enhancedTimeline.length > 0 ? (
            <EnhancedLearningTimeline 
              timeline={enhancedTimeline}
            />
                   ) : (
             <motion.div 
               className="text-center py-16"
               style={{ color: 'var(--color-text-muted)' }}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
             >
               {false ? (
                 <div className="flex flex-col items-center justify-center gap-4">
                   <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--color-accent-primary)' }}></div>
                   <div className="text-center">
                     <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                       Loading Learning Journey
                     </h3>
                     <p className="text-lg">Fetching portfolio data and progress information...</p>
                   </div>
                 </div>
               ) : (
                 <div 
                   className="rounded-xl border-2 border-dashed p-12 text-center"
                   style={{ 
                     borderColor: 'var(--color-border)',
                     backgroundColor: 'var(--color-secondary-bg)'
                   }}
                 >
                   <div 
                     className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
                   >
                     <TargetIcon className="w-8 h-8" style={{ color: 'var(--color-accent-primary)' }} />
                   </div>
                   <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                     Learning Journey
                   </h3>
                   <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                     Learning progress will be displayed when available
                   </p>
                 </div>
               )}
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
