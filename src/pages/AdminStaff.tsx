import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchAllStaff,
  createStaff,
  updateStaff,
  deleteStaff
} from '../redux/slices/staffSlice';
import {
  PlusIcon,
  Pencil1Icon as Edit3,
  TrashIcon,
  Cross1Icon as X,
  CheckCircledIcon
} from '@radix-ui/react-icons';

const defaultStaffForm = {
  name: '',
  email: '',
  department: '',
  college: '',
  role: 'staff',
  isActive: true,
  password: '', // Add password field
};

const AdminStaff: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: staff, loading, error } = useAppSelector((state) => state.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffForm, setStaffForm] = useState(defaultStaffForm);
  const [formError, setFormError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');

  useEffect(() => {
    dispatch(fetchAllStaff());
  }, [dispatch]);

  const filteredStaff = staff.filter((s: any) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
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
      isActive: staff.isActive !== false,
      password: '', // Always blank for editing
    });
    setShowModal(true);
    setFormError('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      dispatch(deleteStaff(id));
    }
  };

  const handleSave = async () => {
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
      await dispatch(updateStaff({ id: editingStaff._id, staffData: updateData }));
      setShowModal(false);
      setEditingStaff(null);
      setStaffForm(defaultStaffForm);
    } else {
      await dispatch(createStaff(staffForm));
      setCreatedPassword(staffForm.password); // Store password for modal
      setShowModal(false);
      setShowPasswordModal(true);
      setEditingStaff(null);
      setStaffForm(defaultStaffForm);
    }
  };

  return (
    <div className="min-h-screen bg-offblack p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-paperwhite font-heading">Staff Management</h1>
          <p className="text-teallight mt-1 font-label">Manage staff members, roles, and departments</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-trueturquoise text-offblack px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
        >
          <PlusIcon className="h-5 w-5" />
          Add Staff
        </button>
      </div>
      <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search staff..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Actions</th>
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-teallight text-offblack' : 'bg-rust text-paperwhite'}`}>
                    <CheckCircledIcon className="h-4 w-4 mr-1" />
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack px-2 py-1 rounded transition-colors"
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
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
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
              <button onClick={handleSave} className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold mt-2">{editingStaff ? 'Save Changes' : 'Add Staff'}</button>
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
                className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold"
              >Copy Password</button>
            </div>
          </div>
        </div>
      )}
      {error && <div className="text-rust text-center mt-4">{error}</div>}
    </div>
  );
};

export default AdminStaff; 