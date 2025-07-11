import React, { useState } from 'react';
import TaskReview from '../components/TaskReview';
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
import { useStudents, useSubmissions } from '../hooks/useAdmin';
import logo from '../assets/syncner-logo.png';
import { useAppSelector, useAppDispatch } from '../redux/store';
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
  const { submissions, loading: submissionsLoading, reviewSubmission } = useSubmissions();
  const analyticsState = useSelector((state: { analytics: any }) => state.analytics);
  const analytics = analyticsState.data;
  const analyticsLoading = analyticsState.loading;
  const dispatch = useAppDispatch();
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'active': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

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

  const handleReviewSubmission = async (submissionId: string, score: number, feedback: string, status: string) => {
    await reviewSubmission(submissionId, { score, feedback, status });
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
    (activeTab === 'overview' && analyticsLoading) ||
    (activeTab === 'submissions' && submissionsLoading)
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
    (activeTab === 'overview' && !analytics) ||
    (activeTab === 'submissions' && !submissions)
  );

  if (hasError) {
    console.error('AdminDashboard: Missing data for active tab', { activeTab, students, analytics, submissions });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load {activeTab} data.</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Please check your network connection or try reloading the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* DEBUG BANNER */}
      <div style={{ background: '#ff0', color: '#000', padding: '8px', textAlign: 'center', fontWeight: 'bold', zIndex: 9999 }}>
        DEBUG: AdminDashboard is rendering
      </div>
      {/* DEBUG DATA INFO */}
      <div style={{ background: '#eee', color: '#222', padding: '8px', fontSize: '14px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <div>students: {Array.isArray(students) ? students.length : 'null'}</div>
        <div>submissions: {Array.isArray(submissions) ? submissions.length : 'null'}</div>
        <div>analytics: {analytics ? Object.keys(analytics).join(', ') : 'null'}</div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor student progress and performance</p>
        </div>
        <button
          onClick={exportData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'submissions', label: 'Task Reviews', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.totalStudents || 0}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.activeStudents || 0}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.completionRate || 0}%</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.avgProgress || 0}%</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Weekly Attendance</h2>
            <div className="flex items-end space-x-4 h-40">
              {analytics?.attendanceData?.map((data: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t w-full"
                    style={{ height: `${(data.students / 350) * 100}%` }}
                  ></div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{data.students}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{data.day}</p>
                  </div>
                </div>
              )) || (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  No attendance data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Management</h2>
              <button
                onClick={handleAddStudent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Student
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Students</option>
                <option value="active">Active</option>
                <option value="at-risk">At Risk</option>
                <option value="inactive">Inactive</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {(() => {
                          switch(student.careerTrack) {
                            case 'fullstack': return 'Full Stack Development';
                            case 'ai-ml': return 'AI/ML Engineering';
                            case 'ui-ux': return 'UI/UX Design';
                            case 'data-science': return 'Data Science';
                            default: return student.careerTrack;
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${student.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status || 'active')}`}>
                        {getStatusIcon(student.status || 'active')}
                        <span className="ml-1 capitalize">{(student.status || 'active') ? (student.status || 'active').replace('-', ' ') : 'Active'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No students match your search criteria.' : 'No students have been added yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <TaskReview submissions={submissions} onReview={handleReviewSubmission} />
      )}

      {/* Student Detail/Edit Modal */}
      {showStudentModal && (selectedStudent || editingStudent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingStudent ? (showAddStudent ? 'Add New Student' : 'Edit Student') : 'Student Details'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              {editingStudent ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editingStudent.email}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editingStudent.location}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <select
                        value={editingStudent.department}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Design">Design</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Career Track
                      </label>
                      <select
                        value={editingStudent.careerTrack}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, careerTrack: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="fullstack">Full Stack Development</option>
                        <option value="ai-ml">AI/ML Engineering</option>
                        <option value="ui-ux">UI/UX Design</option>
                        <option value="data-science">Data Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        College
                      </label>
                      <input
                        type="text"
                        value={editingStudent.college}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, college: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={editingStudent.gpa}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, gpa: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., 3.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password {showAddStudent && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="password"
                        value={editingStudent.password || ''}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={showAddStudent ? "Enter password (min 6 chars)" : "Leave blank to keep current password"}
                        required={showAddStudent}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="profileComplete"
                      checked={editingStudent.profileComplete}
                      onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, profileComplete: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="profileComplete" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Profile Complete
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveStudent}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {showAddStudent ? 'Add Student' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                      <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent?.name}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Mail className="h-4 w-4 mr-2" />
                          {selectedStudent?.email}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Phone className="h-4 w-4 mr-2" />
                          {selectedStudent?.phone}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FileText className="h-4 w-4 mr-2" />
                          {selectedStudent?.location}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
                          {selectedStudent?.department} • {selectedStudent?.college}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStudent?.status || 'active')}`}>
                      {getStatusIcon(selectedStudent?.status || 'active')}
                      <span className="ml-1 capitalize">{(selectedStudent?.status || 'active') ? (selectedStudent?.status || 'active').replace('-', ' ') : 'Active'}</span>
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent?.progress}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent?.tasksCompleted}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent?.gpa}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">GPA</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Career Track</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {(() => {
                              switch(selectedStudent?.careerTrack) {
                                case 'fullstack': return 'Full Stack Development';
                                case 'ai-ml': return 'AI/ML Engineering';
                                case 'ui-ux': return 'UI/UX Design';
                                case 'data-science': return 'Data Science';
                                default: return selectedStudent?.careerTrack;
                              }
                            })()}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Join Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedStudent?.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Last Active</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedStudent?.lastActive}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Profile Status</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedStudent?.profileComplete ? 'Complete' : 'Incomplete'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditStudent(selectedStudent)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Student
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminDashboard;