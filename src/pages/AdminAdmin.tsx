import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../redux/slices/adminSlice';
import {
  PlusIcon,
  Pencil1Icon as Edit3,
  TrashIcon,
  Cross1Icon as X,
  CheckCircledIcon
} from '@radix-ui/react-icons';

const defaultAdminForm = {
  name: '',
  email: '',
  role: 'admin',
  isActive: true,
  password: '',
};

const AdminAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: admins, loading, error } = useAppSelector((state) => state.admins);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [formError, setFormError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');

  useEffect(() => {
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  const filteredAdmins = admins.filter((a: any) =>
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

  const handleEdit = (admin: any) => {
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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      dispatch(deleteAdmin(id));
    }
  };

  const handleSave = async () => {
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
      await dispatch(updateAdmin({ id: editingAdmin._id, adminData: updateData }));
      setShowModal(false);
      setEditingAdmin(null);
      setAdminForm(defaultAdminForm);
    } else {
      await dispatch(createAdmin(adminForm));
      setCreatedPassword(adminForm.password);
      setShowModal(false);
      setShowPasswordModal(true);
      setEditingAdmin(null);
      setAdminForm(defaultAdminForm);
    }
  };

  return (
    <div className="min-h-screen bg-offblack p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-paperwhite font-heading">Admin Management</h1>
          <p className="text-teallight mt-1 font-label">Manage admins</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-trueturquoise text-offblack px-5 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-medium flex items-center gap-2 shadow"
        >
          <PlusIcon className="h-5 w-5" />
          Add Admin
        </button>
      </div>
      <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search admins..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teallight uppercase tracking-wider bg-offblack">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6 text-teallight">Loading...</td></tr>
            ) : filteredAdmins.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-teallight">No admins found.</td></tr>
            ) : filteredAdmins.map((a: any) => (
              <tr key={a._id} className="hover:bg-paperwhite/5">
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite font-medium">{a.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-paperwhite">{a.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize text-paperwhite">{a.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${a.isActive ? 'bg-teallight text-offblack' : 'bg-rust text-paperwhite'}`}>
                    <CheckCircledIcon className="h-4 w-4 mr-1" />
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack px-2 py-1 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
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
      {/* Modal for Add/Edit Admin */}
      {showModal && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50">
          <div className="bg-offblack rounded-xl shadow-2xl p-8 w-full max-w-md border border-paperwhite/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-paperwhite">{editingAdmin ? 'Edit Admin' : 'Add Admin'}</h3>
              <button onClick={() => setShowModal(false)} className="text-teallight hover:text-trueturquoise"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <input type="email" placeholder="Email" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight" />
              <select value={adminForm.role} onChange={e => setAdminForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition">
                <option value="admin">Admin</option>
              </select>
              {/* Password field only for new admins */}
              {!editingAdmin && (
                <input
                  type="text"
                  placeholder="Password"
                  value={adminForm.password}
                  onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
                />
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={adminForm.isActive} onChange={e => setAdminForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                <label htmlFor="isActive" className="text-paperwhite">Active</label>
              </div>
              {formError && <div className="text-rust text-sm font-medium">{formError}</div>}
              <button onClick={handleSave} className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold mt-2">{editingAdmin ? 'Save Changes' : 'Add Admin'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Password shown-once modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-offblack/60 flex items-center justify-center z-50">
          <div className="bg-offblack rounded-xl shadow-2xl p-8 w-full max-w-md border border-paperwhite/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-paperwhite">Admin Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setCreatedPassword(''); }} className="text-teallight hover:text-trueturquoise"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="text-paperwhite text-center">
                <p className="mb-2">Copy and share this password with the admin. It will not be shown again.</p>
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

export default AdminAdmin; 