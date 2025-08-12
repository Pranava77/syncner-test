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

const defaultStaffForm = {
  name: '',
  email: '',
  department: '',
  college: '',
  role: 'staff',
  careerTrack: 'full-stack',
  isActive: true,
  password: '', // Add password field
};

const AdminStaff: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading } = useAppSelector((state) => state.users);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffForm, setStaffForm] = useState(defaultStaffForm);
  const [formError, setFormError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        setError(null);
        await dispatch(fetchAllUsers({ role: 'staff' })).unwrap();
      } catch (err: any) {
        setError(err.message || 'Failed to load staff members');
        console.error('Staff load error:', err);
      }
    };
    loadStaff();
  }, [dispatch]);

  // Only show users with role 'staff'
  const filteredStaff = users.filter((s: any) =>
    s.role === 'staff' && (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAdd = () => {
    setEditingStaff(null);
    setStaffForm(defaultStaffForm);
    setShowModal(true);
    setFormError('');
  };

  const handleEdit = (staff: any) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name || '',
      email: staff.email || '',
      department: staff.department || '',
      college: staff.college || '',
      role: staff.role || 'staff',
      careerTrack: staff.careerTrack || 'full-stack',
      isActive: staff.isActive !== false,
      password: '', // Always blank for editing
    });
    setShowModal(true);
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        setError(null);
        await dispatch(deleteUser(id)).unwrap();
        setSuccessMessage('Staff member deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting staff member');
        console.error('Staff delete error:', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (!staffForm.name || !staffForm.email || !staffForm.role || !staffForm.college) {
        setFormError('Name, Email, Role, and College are required.');
        return;
      }
      if (!editingStaff && !staffForm.password) {
        setFormError('Password is required for new staff.');
        return;
      }
      setFormError('');
      
      if (editingStaff && editingStaff._id) {
        const { password, ...updateData } = staffForm; // Don't send password on edit
        const result = await dispatch(updateUser({ id: editingStaff._id, userData: updateData })).unwrap();
        setShowModal(false);
        setEditingStaff(null);
        setStaffForm(defaultStaffForm);
        setSuccessMessage('Staff member updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const result = await dispatch(createUser(staffForm)).unwrap();
        setCreatedPassword(staffForm.password); // Store password for modal
        setShowModal(false);
        setShowPasswordModal(true);
        setEditingStaff(null);
        setStaffForm(defaultStaffForm);
        setSuccessMessage('Staff member created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving staff member');
      console.error('Staff save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-4 lg:p-8"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 
            className="text-3xl font-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Staff Management
          </h1>
          <p 
            className="mt-1 font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Manage staff members, roles, and departments
          </p>
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
          className="bg-trueturquoise px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
          style={{ color: 'var(--color-text-inverse)' }}
        >
          <PlusIcon className="h-5 w-5" />
          Add Staff
        </button>
      </div>
      <div 
        className="rounded-xl shadow-lg p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-secondary-bg)'
                }}
              >Name</th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-secondary-bg)'
                }}
              >Email</th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-secondary-bg)'
                }}
              >Department</th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-secondary-bg)'
                }}
              >Role</th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-secondary-bg)'
                }}
              >Status</th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-secondary-bg)'
                }}
              >Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6 text-teallight">Loading...</td></tr>
            ) : filteredStaff.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-teallight">No staff found.</td></tr>
            ) : filteredStaff.map((s: any) => (
              <tr key={s._id} className="hover:bg-paperwhite/5">
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite font-medium">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite">{s.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite">{s.department}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize text-paperwhite">{s.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-teallight' : 'bg-rust'}`}
                    style={{ color: 'var(--color-text-inverse)' }}
                  >
                    <CheckCircledIcon className="h-4 w-4 mr-1" />
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-trueturquoise hover:bg-trueturquoise/90 px-2 py-1 rounded transition-colors"
                      style={{ color: 'var(--color-text-inverse)' }}
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="bg-rust hover:bg-rust/80 text-paperwhite px-2 py-1 rounded transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    {/* Reset Password Button */}
                    <button
                      onClick={() => {
                        setResetUser({ name: s.name, email: s.email });
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
      {/* Modal for Add/Edit Staff */}
      {showModal && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50">
          <div className="bg-offblack rounded-xl shadow-2xl p-8 w-full max-w-md border border-paperwhite/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-paperwhite">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setShowModal(false)} className="text-teallight hover:text-trueturquoise"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <input type="email" placeholder="Email" value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <input type="text" placeholder="Department" value={staffForm.department} onChange={e => setStaffForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <input type="text" placeholder="College" value={staffForm.college} onChange={e => setStaffForm(f => ({ ...f, college: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <select value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition">
                <option value="staff">Staff</option>
              </select>
              {/* Password field only for new staff */}
              {!editingStaff && (
                <input
                  type="text"
                  placeholder="Password"
                  value={staffForm.password}
                  onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
                />
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={staffForm.isActive} onChange={e => setStaffForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                <label htmlFor="isActive" className="text-paperwhite">Active</label>
              </div>
              {formError && <div className="text-rust text-sm font-medium">{formError}</div>}
              <button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="w-full bg-trueturquoise py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-text-inverse)' }}
              >
                {isSubmitting ? 'Saving...' : (editingStaff ? 'Save Changes' : 'Add Staff')}
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
              <h3 className="text-lg font-semibold text-paperwhite">Staff Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setCreatedPassword(''); }} className="text-teallight hover:text-trueturquoise"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="text-paperwhite text-center">
                <p className="mb-2">Copy and share this password with the staff member. It will not be shown again.</p>
                <div className="bg-paperwhite/10 rounded-lg px-4 py-3 text-lg font-mono text-trueturquoise select-all break-all text-center">{createdPassword}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(createdPassword); }}
                className="w-full bg-trueturquoise py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold"
                style={{ color: 'var(--color-text-inverse)' }}
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
            // Find the staff ID from the staff list
            const staffObj = users.find(s => s.email === resetUser?.email && s.name === resetUser?.name);
            if (!staffObj) throw new Error('Staff not found');
            await apiService.resetUserPassword(staffObj._id || staffObj.id, password);
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

export default AdminStaff; 