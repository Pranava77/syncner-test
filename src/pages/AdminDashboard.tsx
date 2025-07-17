import React, { useState } from 'react';
import {
  BarChartIcon as BarChart3,
  GroupIcon as Users,
  FileTextIcon as FileText,
  ArrowTopRightIcon as TrendingUp,
  ReaderIcon as BookOpen,
  MagnifyingGlassIcon as Search,
  Pencil1Icon as Edit3,
  TrashIcon as Trash2,
  EnvelopeClosedIcon as Mail,
  MobileIcon as Phone,
  Cross1Icon as X,
  EyeOpenIcon as Eye,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  ClockIcon,
  DownloadIcon,
  PlusIcon
} from '@radix-ui/react-icons';
import { useStudents } from '../hooks/useAdmin';
import logo from '../assets/syncner-logo.png';
import {  useAppDispatch } from '../redux/store';
import { useSelector } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';

const AdminDashboard: React.FC = () => {
  console.log('AdminDashboard rendered');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Use real API data instead of mock data
  const { students, loading: studentsLoading, updateStudent, deleteStudent, addStudent, refetch } = useStudents();
  const analyticsState = useSelector((state: { analytics: any }) => state.analytics);
  const analytics = analyticsState.data;
  const analyticsLoading = analyticsState.loading;
  const dispatch = useAppDispatch();
  

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'excellent': return 'bg-trueturquoise/20 text-trueturquoise';
  //     case 'active': return 'bg-trueturquoise/20 text-trueturquoise';
  //     case 'at-risk': return 'bg-trueturquoise/20 text-trueturquoise';
  //     case 'inactive': return 'bg-trueturquoise/20 text-trueturquoise';
  //     default: return 'bg-paperwhite/10 text-teallight';
  //   }
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircledIcon className="h-4 w-4" />;
      case 'active': return <CheckCircledIcon className="h-4 w-4" />;
      case 'at-risk': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'inactive': return <CrossCircledIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const exportData = () => {
    alert('CSV export functionality would be implemented here');
  };

  // Modal state management helpers
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setEditingStudent(null);
    setShowStudentModal(true);
    setShowAddStudent(false);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent({ ...student });
    setSelectedStudent(null);
    setShowStudentModal(true);
    setShowAddStudent(false);
  };

  const handleAddStudent = () => {
    setEditingStudent({
      name: '',
      email: '',
      phone: '',
      location: '',
      department: '',
      college: 'Tech University',
      careerTrack: 'fullstack',
      gpa: '',
      profileComplete: false,
      password: ''
    });
    setSelectedStudent(null);
    setShowAddStudent(true);
    setShowStudentModal(true);
  };

  const handleCloseModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
    setEditingStudent(null);
    setShowAddStudent(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(studentId);
        alert('Student deleted successfully!');
      } catch (error) {
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const handleSaveStudent = async () => {
    if (editingStudent) {
      const isNew = !editingStudent._id;
      if (
        !editingStudent.name ||
        !editingStudent.email ||
        !editingStudent.college ||
        (isNew && (!editingStudent.password || editingStudent.password.length < 6))
      ) {
        alert('Please fill all required fields: Name, Email, College, and Password (min 6 chars for new students).');
        return;
      }
      try {
        if (editingStudent._id) {
          // Update existing student
          await updateStudent(editingStudent._id, editingStudent);
          alert('Student updated successfully!');
        } else {
          // Add new student
          await addStudent(editingStudent);
          await refetch();
          alert('Student added successfully!');
        }
        setEditingStudent(null);
        setShowStudentModal(false);
        setShowAddStudent(false);
      } catch (error) {
        alert('Failed to save student. Please try again.');
      }
    }
  };

  const filteredStudents = (students ?? [])
    .filter(student => student.role === 'student')
    .filter(student => {
      const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter;
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

  // Debug: Log all students and filtered students
  console.log('All students from backend:', students);
  console.log('Filtered students:', filteredStudents);

  React.useEffect(() => {
    // Always fetch analytics when the component mounts or activeTab changes to 'overview'
    if (activeTab === 'overview') {
      dispatch(fetchAnalytics());
    }
  }, [dispatch, activeTab]);

  // Determine overall loading state
  const overallLoading = (
    (activeTab === 'students' && studentsLoading) ||
    (activeTab === 'overview' && analyticsLoading)
  );

  if (overallLoading) {
    return (
      <LoadingScreen 
        message={`Loading ${activeTab} data...`}
        showProgress={true}
        progressDuration={1600}
      />
    );
  }

  // Error fallback for missing data after loading completes
  const hasError = (
    (activeTab === 'students' && !students) ||
    (activeTab === 'overview' && !analytics)
  );

  if (hasError) {
    console.error('AdminDashboard: Missing data for active tab', { activeTab, students, analytics });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-rust mb-4">Failed to load {activeTab} data.</h2>
          <p className="text-teallight mb-4">Please check your network connection or try reloading the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offblack p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl  text-paperwhite font-heading">Admin Dashboard</h1>
          <p className="text-teallight mt-1 font-label">Monitor student progress and performance</p>
        </div>
        <button
          onClick={exportData}
          className="bg-trueturquoise text-offblack px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
        >
          <DownloadIcon className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-paperwhite/10 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 }
            // Removed Students tab
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-lg font-medium rounded-t-lg transition-colors duration-150
                  ${isActive
                    ? 'text-trueturquoise border-b-2 border-trueturquoise bg-offblack'
                    : 'text-paperwhite/60 hover:text-trueturquoise border-b-2 border-transparent bg-offblack/80'}
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teallight text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-paperwhite">{analytics?.totalStudents || 0}</p>
                  </div>
                  <div className="bg-trueturquoise/20 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-trueturquoise" />
                  </div>
                </div>
              </div>
              <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teallight text-sm">Active Students</p>
                    <p className="text-3xl font-bold text-paperwhite">{analytics?.activeStudents || 0}</p>
                  </div>
                  <div className="bg-trueturquoise/20 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-trueturquoise" />
                  </div>
                </div>
              </div>
              <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teallight text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold text-paperwhite">{analytics?.completionRate || 0}%</p>
                  </div>
                  <div className="bg-trueturquoise/20 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-trueturquoise" />
                  </div>
                </div>
              </div>
              <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teallight text-sm">Avg Progress</p>
                    <p className="text-3xl font-bold text-paperwhite">{analytics?.avgProgress || 0}%</p>
                  </div>
                  <div className="bg-trueturquoise/20 p-3 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-trueturquoise" />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-paperwhite mb-6">Weekly Attendance</h2>
              <div className="flex items-end space-x-4 h-40">
                {analytics?.attendanceData?.map((data: any, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-trueturquoise rounded-t w-full"
                      style={{ height: `${(data.students / 350) * 100}%` }}
                    ></div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-paperwhite">{data.students}</p>
                      <p className="text-xs text-teallight">{data.day}</p>
                    </div>
                  </div>
                )) || (
                  <div className="flex-1 flex items-center justify-center text-teallight">
                    No attendance data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      {/* Remove students tab content and student modals */}


    </div>
  );
};

export default AdminDashboard;