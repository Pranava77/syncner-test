import React, { useState } from 'react';
import TaskReview from '../components/TaskReview';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  AlertTriangle,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Edit3,
  Eye,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
} from 'lucide-react';
import { useStudents, useSubmissions } from '../hooks/useAdmin';
import logo from '../assets/syncner-logo.png';
import { useAppSelector } from '../redux/store';
import { useSelector } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';

const AdminDashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Use real API data instead of mock data
  const { students, loading: studentsLoading, updateStudent, deleteStudent, addStudent, refetch } = useStudents();
  const { submissions, loading: submissionsLoading, error: submissionsError, reviewSubmission } = useSubmissions();
  const analyticsState = useSelector((state: any) => state.analytics);
  const analytics = analyticsState.data;
  const analyticsLoading = analyticsState.loading;
  const analyticsError = analyticsState.error;

  const settingsState = useSelector((state: any) => state.settings);
  const settings = settingsState.data;
  const settingsLoading = settingsState.loading;
  const settingsError = settingsState.error;

  const { user } = useAppSelector((state) => state.auth);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-[var(--brand-success-bg)] text-[var(--brand-success)] dark:bg-[var(--brand-success-dark-bg)] dark:text-[var(--brand-success-dark)]';
      case 'active': return 'bg-[var(--brand-info-bg)] text-[var(--brand-info)] dark:bg-[var(--brand-info-dark-bg)] dark:text-[var(--brand-info-dark)]';
      case 'at-risk': return 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)] dark:bg-[var(--brand-warning-dark-bg)] dark:text-[var(--brand-warning-dark)]';
      case 'inactive': return 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)] dark:bg-[var(--brand-danger-dark-bg)] dark:text-[var(--brand-danger-dark)]';
      default: return 'bg-[var(--brand-bg-alt)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-alt)] dark:text-[var(--brand-text)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  // Loading states
  if (studentsLoading && activeTab === 'students') {
    return (
      <LoadingScreen 
        message="Loading students..."
        showProgress={true}
        progressDuration={1600}
      />
    );
  }

  if (analyticsLoading && activeTab === 'overview') {
    return (
      <LoadingScreen 
        message="Loading analytics..."
        showProgress={true}
        progressDuration={1600}
      />
    );
  }

  if (submissionsLoading && activeTab === 'submissions') {
    return (
      <LoadingScreen 
        message="Loading submissions..."
        showProgress={true}
        progressDuration={1600}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--brand-text)]">Admin Dashboard</h1>
          <p className="text-[var(--brand-primary)] mt-1">Monitor student progress and performance</p>
        </div>
        <button
          onClick={exportData}
          className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--brand-bg-alt)]">
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
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center rounded-t-md ${
                  activeTab === tab.id
                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-bg-alt)]'
                    : 'border-transparent text-[var(--brand-text)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-bg-alt)]'
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
            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--brand-primary)] text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-[var(--brand-text)]">{analytics?.totalStudents || 0}</p>
                </div>
                <div className="bg-[var(--brand-primary)]/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--brand-primary)] text-sm">Active Students</p>
                  <p className="text-3xl font-bold text-[var(--brand-text)]">{analytics?.activeStudents || 0}</p>
                </div>
                <div className="bg-[var(--brand-secondary)]/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[var(--brand-secondary)]" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--brand-primary)] text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-[var(--brand-text)]">{analytics?.completionRate || 0}%</p>
                </div>
                <div className="bg-[var(--brand-accent)]/20 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-[var(--brand-accent)]" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--brand-primary)] text-sm">Avg Progress</p>
                  <p className="text-3xl font-bold text-[var(--brand-text)]">{analytics?.avgProgress || 0}%</p>
                </div>
                <div className="bg-[var(--brand-primary)]/20 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[var(--brand-text)] mb-6">Weekly Attendance</h2>
            <div className="flex items-end space-x-4 h-40">
              {analytics?.attendanceData?.map((data: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-gradient-to-t from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-t w-full"
                    style={{ height: `${(data.students / 350) * 100}%` }}
                  ></div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-[var(--brand-text)]">{data.students}</p>
                    <p className="text-xs text-[var(--brand-primary)]">{data.day}</p>
                  </div>
                </div>
              )) || (
                <div className="flex-1 flex items-center justify-center text-[var(--brand-primary)]">
                  No attendance data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-sm">
          <div className="p-6 border-b border-[var(--brand-bg-alt)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--brand-text)]">Student Management</h2>
              <button
                onClick={handleAddStudent}
                className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="h-5 w-5 text-[var(--brand-primary)] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)]"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-[var(--brand-primary)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)]"
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
              <thead className="bg-[var(--brand-bg)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--brand-primary)] uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--brand-primary)] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--brand-primary)] uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--brand-primary)] uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--brand-primary)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--brand-primary)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--brand-bg-alt)] divide-y divide-[var(--brand-bg-alt)]">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-[var(--brand-bg)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[var(--brand-text)]">{student.name}</div>
                        <div className="text-sm text-[var(--brand-primary)]">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--brand-text)]">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--brand-text)]">
                      <span className="text-sm text-[var(--brand-text)] capitalize">
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
                        <div className="w-16 bg-[var(--brand-bg)] rounded-full h-2 mr-2">
                          <div
                            className="bg-[var(--brand-primary)] h-2 rounded-full"
                            style={{ width: `${student.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-[var(--brand-text)]">{student.progress || 0}%</span>
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
                          className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-accent)] text-white px-2 py-1 rounded transition-colors"
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
              <Users className="h-12 w-12 text-[var(--brand-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--brand-text)] mb-2">No Students Found</h3>
              <p className="text-[var(--brand-primary)]">
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
          <div className="bg-[var(--brand-bg-alt)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--brand-text)]">
                  {editingStudent ? (showAddStudent ? 'Add New Student' : 'Edit Student') : 'Student Details'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-[var(--brand-text)] hover:text-[var(--brand-primary)] dark:hover:text-[var(--brand-accent)] text-2xl"
                >
                  ×
                </button>
              </div>

              {editingStudent ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editingStudent.email}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editingStudent.location}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Department
                      </label>
                      <select
                        value={editingStudent.department}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
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
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Career Track
                      </label>
                      <select
                        value={editingStudent.careerTrack}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, careerTrack: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                      >
                        <option value="fullstack">Full Stack Development</option>
                        <option value="ai-ml">AI/ML Engineering</option>
                        <option value="ui-ux">UI/UX Design</option>
                        <option value="data-science">Data Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        College
                      </label>
                      <input
                        type="text"
                        value={editingStudent.college}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, college: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={editingStudent.gpa}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, gpa: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
                        placeholder="e.g., 3.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-text)] dark:text-[var(--brand-primary)] mb-2">
                        Password {showAddStudent && <span className="text-[var(--brand-danger)]">*</span>}
                      </label>
                      <input
                        type="password"
                        value={editingStudent.password || ''}
                        onChange={(e) => setEditingStudent((prev: any) => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--brand-primary)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent bg-[var(--brand-bg)] text-[var(--brand-text)] dark:bg-[var(--brand-bg-dark)] dark:text-[var(--brand-text-dark)]"
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
                      className="h-4 w-4 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] border-[var(--brand-primary)] rounded"
                    />
                    <label htmlFor="profileComplete" className="ml-2 block text-sm text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">
                      Profile Complete
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveStudent}
                      className="flex-1 bg-[var(--brand-primary)] text-white py-3 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {showAddStudent ? 'Add Student' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors font-medium flex items-center"
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
                    <div className="bg-[var(--brand-primary)]/20 p-3 rounded-full">
                      <img src={logo} alt="Syncner Logo" className="h-6 w-6 object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">{selectedStudent?.name}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">
                          <Mail className="h-4 w-4 mr-2" />
                          {selectedStudent?.email}
                        </div>
                        <div className="flex items-center text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">
                          <Phone className="h-4 w-4 mr-2" />
                          {selectedStudent?.phone}
                        </div>
                        <div className="flex items-center text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">
                          <MapPin className="h-4 w-4 mr-2" />
                          {selectedStudent?.location}
                        </div>
                        <div className="flex items-center text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">
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
                    <div className="bg-[var(--brand-bg)] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">{selectedStudent?.progress}%</p>
                      <p className="text-sm text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">Progress</p>
                    </div>
                    <div className="bg-[var(--brand-bg)] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">{selectedStudent?.tasksCompleted}</p>
                      <p className="text-sm text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">Tasks Done</p>
                    </div>
                    <div className="bg-[var(--brand-bg)] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">{selectedStudent?.gpa}</p>
                      <p className="text-sm text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">GPA</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="border-t border-[var(--brand-primary)]/20 pt-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">Career Track</p>
                        <p className="font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">
                          <span className="text-sm text-[var(--brand-text)] dark:text-[var(--brand-text-dark)] capitalize">
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
                        <p className="text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">Join Date</p>
                        <p className="font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">{selectedStudent?.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">Last Active</p>
                        <p className="font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">{selectedStudent?.lastActive}</p>
                      </div>
                      <div>
                        <p className="text-[var(--brand-primary)] dark:text-[var(--brand-primary)]">Profile Status</p>
                        <p className="font-medium text-[var(--brand-text)] dark:text-[var(--brand-text-dark)]">
                          {selectedStudent?.profileComplete ? 'Complete' : 'Incomplete'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditStudent(selectedStudent)}
                      className="flex-1 bg-[var(--brand-primary)] text-white py-3 rounded-lg hover:bg-[var(--brand-accent)] transition-colors font-medium flex items-center justify-center"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Student
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-bg)] transition-colors font-medium"
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