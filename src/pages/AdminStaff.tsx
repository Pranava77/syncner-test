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
            <div className="mt-2 p-2 rounded-lg text-sm" style={{
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)'
            }}>
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-2 p-2 rounded-lg text-sm" style={{
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)'
            }}>
              {error}
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="px-5 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 shadow"
          style={{ 
            backgroundColor: 'var(--color-accent-primary)',
            color: 'var(--color-text-inverse)' 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
          }}
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
              className="pl-4 pr-4 py-2 w-full border rounded-lg transition-colors"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
              <tr><td colSpan={6} className="text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>Loading...</td></tr>
            ) : filteredStaff.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>No staff found.</td></tr>
            ) : filteredStaff.map((s: any) => (
              <tr key={s._id} style={{
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <td 
                  className="px-6 py-4 whitespace-nowrap font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {s.name}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {s.email}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {s.department}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap capitalize"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {s.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: s.isActive ? 'var(--color-success)' : 'var(--color-error)',
                      color: 'var(--color-text-inverse)' 
                    }}
                  >
                    <CheckCircledIcon className="h-4 w-4 mr-1" />
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-2 py-1 rounded transition-colors"
                      style={{ 
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-text-inverse)' 
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                      }}
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-2 py-1 rounded transition-colors"
                      style={{ 
                        backgroundColor: 'var(--color-error)',
                        color: 'var(--color-text-inverse)' 
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-error)';
                      }}
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
                      className="px-2 py-1 rounded transition-colors flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-tertiary-bg)',
                        color: 'var(--color-accent-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-secondary-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-tertiary-bg)';
                      }}
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
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div 
            className="rounded-xl shadow-2xl p-8 w-full max-w-md border"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h3>
              <button onClick={() => setShowModal(false)} className="transition-colors" style={{ color: 'var(--color-text-tertiary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Name" 
                value={staffForm.name} 
                onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg transition-colors" 
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={staffForm.email} 
                onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg transition-colors" 
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <input 
                type="text" 
                placeholder="Department" 
                value={staffForm.department} 
                onChange={e => setStaffForm(f => ({ ...f, department: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg transition-colors" 
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <input 
                type="text" 
                placeholder="College" 
                value={staffForm.college} 
                onChange={e => setStaffForm(f => ({ ...f, college: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg transition-colors" 
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <select 
                value={staffForm.role} 
                onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg transition-colors"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="staff">Staff</option>
              </select>
              {/* Password field only for new staff */}
              {!editingStaff && (
                <input
                  type="text"
                  placeholder="Password"
                  value={staffForm.password}
                  onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg transition-colors"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  style={{ 
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-secondary-bg)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={staffForm.isActive} onChange={e => setStaffForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                <label 
                  htmlFor="isActive" 
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Active
                </label>
              </div>
              {formError && <div className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>{formError}</div>}
              <button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg transition-colors font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)' 
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                  }
                }}
              >
                {isSubmitting ? 'Saving...' : (editingStaff ? 'Save Changes' : 'Add Staff')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password shown-once modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div 
            className="rounded-xl shadow-2xl p-8 w-full max-w-md border"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Staff Password
              </h3>
              <button onClick={() => { setShowPasswordModal(false); setCreatedPassword(''); }} className="transition-colors" style={{ color: 'var(--color-text-tertiary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div 
                className="text-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <p className="mb-2">Copy and share this password with the staff member. It will not be shown again.</p>
                <div className="rounded-lg px-4 py-3 text-lg font-mono select-all break-all text-center" style={{
                  backgroundColor: 'var(--color-tertiary-bg)',
                  color: 'var(--color-accent-primary)'
                }}>{createdPassword}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(createdPassword); }}
                className="w-full py-2 rounded-lg transition-colors font-semibold"
                style={{ 
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                }}
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