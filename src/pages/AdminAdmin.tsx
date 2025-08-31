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
import { motion } from 'framer-motion';
import ResetPasswordModal from '../components/ResetPasswordModal';
import apiService from '../services/api';
import syncnerLogo from '../assets/syncner-logo.png';
import { User } from '../redux/slices/authSlice';

const defaultAdminForm = {
  name: '',
  email: '',
  role: 'admin',
  isActive: true,
  password: '',
};

const AdminAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading } = useAppSelector((state) => state.users);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [formError, setFormError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setError(null);
        await dispatch(fetchAllUsers({ role: 'admin' })).unwrap();
      } catch (err: any) {
        setError(err.message || 'Failed to load admins');
      }
    };
    loadAdmins();
  }, [dispatch]);

  const filteredAdmins = users.filter((a: User) =>
    a.role === 'admin' && (
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAdd = () => {
    setEditingAdmin(null);
    setAdminForm(defaultAdminForm);
    setShowModal(true);
    setFormError('');
  };

  const handleEdit = (admin: User) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name || '',
      email: admin.email || '',
      role: admin.role || 'admin',
      isActive: admin.isActive !== false,
      password: '',
    });
    setShowModal(true);
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        setError(null);
        await dispatch(deleteUser(id)).unwrap();
        setSuccessMessage('Admin deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting admin');
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (!adminForm.name || !adminForm.email || !adminForm.role) {
        setFormError('Name, Email, and Role are required.');
        return;
      }
      if (!editingAdmin && !adminForm.password) {
        setFormError('Password is required for new admins.');
        return;
      }
      setFormError('');
      
      if (editingAdmin && editingAdmin._id) {
        const { password, ...updateData } = adminForm;
        await dispatch(updateUser({ id: editingAdmin._id, userData: updateData })).unwrap();
        setShowModal(false);
        setEditingAdmin(null);
        setAdminForm(defaultAdminForm);
        setSuccessMessage('Admin updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        await dispatch(createUser(adminForm)).unwrap();
        setCreatedPassword(adminForm.password);
        setShowModal(false);
        setShowPasswordModal(true);
        setEditingAdmin(null);
        setAdminForm(defaultAdminForm);
        setSuccessMessage('Admin created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving admin');
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
            Admin Management
          </h1>
          <p 
            className="mt-1 font-label"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Manage admins
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
          Add Admin
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
              placeholder="Search admins..."
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
              <tr>
                <td 
                  colSpan={6} 
                  className="text-center py-6"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <motion.img
                      src={syncnerLogo}
                      alt="Syncner Logo"
                      className="w-6 h-6"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                    Loading admins...
                  </div>
                </td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>No admins found.</td></tr>
            ) : filteredAdmins.map((a: User) => (
              <tr key={a._id} style={{
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
                  {a.name}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {a.email}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap capitalize"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {a.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: a.isActive ? 'var(--color-success)' : 'var(--color-error)',
                      color: 'var(--color-text-inverse)' 
                    }}
                  >
                    <CheckCircledIcon className="h-4 w-4 mr-1" />
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
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
                      onClick={() => handleDelete(a._id || a.id)}
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
                        setResetUser({ name: a.name, email: a.email });
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
      {/* Modal for Add/Edit Admin */}
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
                {editingAdmin ? 'Edit Admin' : 'Add Admin'}
              </h3>
              <button onClick={() => setShowModal(false)} className="transition-colors" style={{ color: 'var(--color-text-tertiary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Name" 
                value={adminForm.name} 
                onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} 
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
                value={adminForm.email} 
                onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} 
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
                value={adminForm.role} 
                onChange={e => setAdminForm(f => ({ ...f, role: e.target.value }))} 
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
                <option value="admin">Admin</option>
              </select>
              {/* Password field only for new admins */}
              {!editingAdmin && (
                <input
                  type="text"
                  placeholder="Password"
                  value={adminForm.password}
                  onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
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
                <input type="checkbox" checked={adminForm.isActive} onChange={e => setAdminForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
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
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <motion.img
                      src={syncnerLogo}
                      alt="Syncner Logo"
                      className="w-4 h-4"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                    Saving...
                  </div>
                ) : (editingAdmin ? 'Save Changes' : 'Add Admin')}
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
                Admin Password
              </h3>
              <button onClick={() => { setShowPasswordModal(false); setCreatedPassword(''); }} className="transition-colors" style={{ color: 'var(--color-text-tertiary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div 
                className="text-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <p className="mb-2">Copy and share this password with the admin. It will not be shown again.</p>
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
            // Find the admin ID from the admins list
            const adminObj = users.find(a => a.email === resetUser?.email && a.name === resetUser?.name);
            if (!adminObj) throw new Error('Admin not found');
            await apiService.resetUserPassword(adminObj._id || adminObj.id, password);
            setSuccessMessage('Password reset successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
          } catch (err: any) {
            setError(err.message || 'Failed to reset password');
            throw err; // Re-throw so the modal can handle it
          }
        }}
      />
    </div>
  );
};

export default AdminAdmin; 