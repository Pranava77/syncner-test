import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../redux/slices/userSlice';
import {
  PlusIcon,
  Pencil1Icon as Edit3,
  TrashIcon,
  Cross1Icon as X,
  CheckCircledIcon,
  LockClosedIcon
} from '@radix-ui/react-icons';
import ResetPasswordModal from '../components/ResetPasswordModal';
import apiService from '../services/api';

const defaultUserForm = {
  name: '',
  email: '',
  college: '',
  role: 'student',
  isActive: true,
  password: '',
};

const AdminUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading } = useAppSelector((state) => state.users);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [formError, setFormError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError(null);
        await dispatch(fetchAllUsers({ role: 'student' })).unwrap();
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
        console.error('User load error:', err);
      }
    };
    loadUsers();
  }, [dispatch]);

  const filteredUsers = users.filter((u: any) =>
    u.role === 'student' && (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAdd = () => {
    setEditingUser(null);
    setUserForm(defaultUserForm);
    setShowModal(true);
    setFormError('');
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      college: user.college || '',
      role: user.role || 'student',
      isActive: user.isActive !== false,
      password: '',
    });
    setShowModal(true);
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError(null);
        await dispatch(deleteUser(id)).unwrap();
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting user');
        console.error('User delete error:', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (!userForm.name || !userForm.email || !userForm.role || !userForm.college) {
        setFormError('Name, Email, Role, and College are required.');
        return;
      }
      if (!editingUser && !userForm.password) {
        setFormError('Password is required for new users.');
        return;
      }
      setFormError('');
      
      if (editingUser && editingUser._id) {
        const { password, ...updateData } = userForm;
        await dispatch(updateUser({ id: editingUser._id, userData: updateData })).unwrap();
        setShowModal(false);
        setEditingUser(null);
        setUserForm(defaultUserForm);
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        await dispatch(createUser(userForm)).unwrap();
        setCreatedPassword(userForm.password);
        setShowModal(false);
        setShowPasswordModal(true);
        setEditingUser(null);
        setUserForm(defaultUserForm);
        setSuccessMessage('User created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving user');
      console.error('User save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-offblack p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-paperwhite font-heading">User Management</h1>
          <p className="text-teallight mt-1 font-label">Manage students</p>
          {successMessage && (
            <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="bg-trueturquoise text-offblack px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
        >
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>
      <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-2 w-full border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise bg-offblack text-paperwhite placeholder-teallight"
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Track</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6 text-teallight">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6 text-teallight">No users found.</td></tr>
            ) : filteredUsers.map((u: any, idx: number) => (
              <tr key={u._id || idx} className="hover:bg-paperwhite/5">
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite font-medium">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite">{u.college || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite">{u.careerTrack || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize text-paperwhite">{u.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-teallight text-offblack' : 'bg-rust text-paperwhite'}`}>
                    <CheckCircledIcon className="h-4 w-4 mr-1" />
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack px-2 py-1 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="bg-rust hover:bg-rust/80 text-paperwhite px-2 py-1 rounded transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    {/* Reset Password Button */}
                    <button
                      onClick={() => {
                        setResetUser({ name: u.name, email: u.email });
                        setResetModalOpen(true);
                      }}
                      className="bg-paperwhite/20 hover:bg-trueturquoise/30 text-trueturquoise px-2 py-1 rounded transition-colors flex items-center justify-center"
                      title="Reset Password"
                    >
                      <LockClosedIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50">
          <div className="bg-offblack rounded-xl shadow-2xl p-8 w-full max-w-md border border-paperwhite/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-paperwhite">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-teallight hover:text-trueturquoise"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <input type="text" placeholder="College" value={userForm.college} onChange={e => setUserForm(f => ({ ...f, college: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition">
                <option value="student">Student</option>
              </select>
              {/* Password field only for new users */}
              {!editingUser && (
                <input
                  type="text"
                  placeholder="Password"
                  value={userForm.password}
                  onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
                />
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={userForm.isActive} onChange={e => setUserForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                <label htmlFor="isActive" className="text-paperwhite">Active</label>
              </div>
              {formError && <div className="text-rust text-sm font-medium">{formError}</div>}
              <button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (editingUser ? 'Save Changes' : 'Add User')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password shown-once modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50">
          <div className="bg-offblack rounded-xl shadow-2xl p-8 w-full max-w-md border border-paperwhite/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-paperwhite">User Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setCreatedPassword(''); }} className="text-teallight hover:text-trueturquoise"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="text-paperwhite text-center">
                <p className="mb-2">Copy and share this password with the user. It will not be shown again.</p>
                <div className="bg-paperwhite/10 rounded-lg px-4 py-3 text-lg font-mono text-trueturquoise select-all break-all text-center">{createdPassword}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(createdPassword); }}
                className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold"
              >Copy Password</button>
            </div>
          </div>
        </div>
      )}
      <ResetPasswordModal
        open={resetModalOpen}
        onClose={() => { setResetModalOpen(false); setResetUser(null); }}
        user={resetUser}
        onReset={async (password) => {
          try {
            setError(null);
            // Find the user ID from the users list
            const userObj = users.find(u => u.email === resetUser?.email && u.name === resetUser?.name);
            if (!userObj) throw new Error('User not found');
            await apiService.resetUserPassword(userObj._id || userObj.id, password);
            setSuccessMessage('Password reset successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
          } catch (err: any) {
            setError(err.message || 'Failed to reset password');
            console.error('Password reset error:', err);
            throw err; // Re-throw so the modal can handle it
          }
        }}
      />
      </div>
  );
};

export default AdminUsers; 