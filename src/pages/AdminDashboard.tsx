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
  const analyticsState = useSelector((state: { analytics: any }) => state.analytics);
  const analytics = analyticsState.data;
  const analyticsLoading = analyticsState.loading;
  const dispatch = useAppDispatch();
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-trueturquoise/20 text-trueturquoise';
      case 'active': return 'bg-trueturquoise/20 text-trueturquoise';
      case 'at-risk': return 'bg-trueturquoise/20 text-trueturquoise';
      case 'inactive': return 'bg-trueturquoise/20 text-trueturquoise';
      default: return 'bg-paperwhite/10 text-teallight';
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
          <h1 className="text-3xl font-bold text-paperwhite font-heading">Admin Dashboard</h1>
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
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users }
            // Remove Task Reviews tab
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
      <div className="space-y-8">
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
        {activeTab === 'students' && (
          <>
            {/* Student Management Table */}
            <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
              <div className="p-6 border-b border-paperwhite/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-paperwhite">Student Management</h2>
                  <button
                    onClick={handleAddStudent}
                    className="bg-trueturquoise text-offblack px-4 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold flex items-center gap-2 shadow"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Student
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="h-5 w-5 text-teallight absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite placeholder-teallight"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-paperwhite/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
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
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Track</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-paperwhite/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-paperwhite">{student.name}</div>
                            <div className="text-sm text-teallight">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-paperwhite">{student.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-paperwhite">
                          <span className="text-sm text-paperwhite capitalize">
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
                            <div className="w-16 bg-paperwhite/10 rounded-full h-2 mr-2">
                              <div
                                className="bg-trueturquoise h-2 rounded-full"
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-paperwhite">{student.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-trueturquoise/20 text-trueturquoise">
                            {getStatusIcon(student.status || 'active')}
                            <span className="ml-1 capitalize">{(student.status || 'active') ? (student.status || 'active').replace('-', ' ') : 'Active'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewStudent(student)}
                              className="text-trueturquoise hover:text-trueturquoise/80"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack px-2 py-1 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className="bg-rust hover:bg-rust/80 text-paperwhite px-2 py-1 rounded transition-colors"
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
                  <Users className="h-12 w-12 text-teallight mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-paperwhite mb-2">No Students Found</h3>
                  <p className="text-teallight">
                    {searchTerm ? 'No students match your search criteria.' : 'No students have been added yet.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        {/* Remove submissions tab content */}
      </div>

      {/* Student Detail/Edit Modal */}
      {showStudentModal && (selectedStudent || editingStudent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-paperwhite dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-paperwhite">
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editingStudent.email}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editingStudent.location}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Department
                      </label>
                      <select
                        value={editingStudent.department}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Career Track
                      </label>
                      <select
                        value={editingStudent.careerTrack}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, careerTrack: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      >
                        <option value="fullstack">Full Stack Development</option>
                        <option value="ai-ml">AI/ML Engineering</option>
                        <option value="ui-ux">UI/UX Design</option>
                        <option value="data-science">Data Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        College
                      </label>
                      <input
                        type="text"
                        value={editingStudent.college}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, college: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={editingStudent.gpa}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, gpa: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
                        placeholder="e.g., 3.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-label">
                        Password {showAddStudent && <span className="text-red-500 font-label">*</span>}
                      </label>
                      <input
                        type="password"
                        value={editingStudent.password || ''}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite"
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
                      className="h-4 w-4 text-trueturquoise focus:ring-trueturquoise border-paperwhite rounded"
                    />
                    <label htmlFor="profileComplete" className="ml-2 block text-sm text-paperwhite font-label">
                      Profile Complete
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveStudent}
                      className="flex-1 bg-trueturquoise text-offblack py-3 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {showAddStudent ? 'Add Student' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-paperwhite/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-paperwhite/10 dark:hover:bg-paperwhite/5 transition-colors font-medium flex items-center"
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
                    <div className="bg-trueturquoise/20 p-3 rounded-full">
                      <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-paperwhite font-heading">{selectedStudent?.name}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-teallight">
                          <Mail className="h-4 w-4 mr-2" />
                          {selectedStudent?.email}
                        </div>
                        <div className="flex items-center text-teallight">
                          <Phone className="h-4 w-4 mr-2" />
                          {selectedStudent?.phone}
                        </div>
                        <div className="flex items-center text-teallight">
                          <FileText className="h-4 w-4 mr-2" />
                          {selectedStudent?.location}
                        </div>
                        <div className="flex items-center text-teallight">
                          <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
                          {selectedStudent?.department} • {selectedStudent?.college}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-trueturquoise/20 text-trueturquoise">
                      {getStatusIcon(selectedStudent?.status || 'active')}
                      <span className="ml-1 capitalize">{(selectedStudent?.status || 'active') ? (selectedStudent?.status || 'active').replace('-', ' ') : 'Active'}</span>
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-paperwhite/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-paperwhite">{selectedStudent?.progress}%</p>
                      <p className="text-sm text-teallight">Progress</p>
                    </div>
                    <div className="bg-paperwhite/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-paperwhite">{selectedStudent?.tasksCompleted}</p>
                      <p className="text-sm text-teallight">Tasks Done</p>
                    </div>
                    <div className="bg-paperwhite/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-paperwhite">{selectedStudent?.gpa}</p>
                      <p className="text-sm text-teallight">GPA</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="border-t border-trueturquoise my-8">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-teallight">Career Track</p>
                        <p className="font-medium text-paperwhite">
                          <span className="text-sm text-paperwhite capitalize">
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
                        <p className="text-teallight">Join Date</p>
                        <p className="font-medium text-paperwhite">{selectedStudent?.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-teallight">Last Active</p>
                        <p className="font-medium text-paperwhite">{selectedStudent?.lastActive}</p>
                      </div>
                      <div>
                        <p className="text-teallight">Profile Status</p>
                        <p className="font-medium text-paperwhite">
                          {selectedStudent?.profileComplete ? 'Complete' : 'Incomplete'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditStudent(selectedStudent)}
                      className="flex-1 bg-trueturquoise text-offblack py-3 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center justify-center"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Student
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-paperwhite/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-paperwhite/10 dark:hover:bg-paperwhite/5 transition-colors font-medium"
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