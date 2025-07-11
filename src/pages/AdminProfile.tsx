import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';
import { PersonIcon } from '@radix-ui/react-icons';

interface AdminProfileData {
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
}

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<AdminProfileData>({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await ApiService.getMe();
        setProfile(profileRes.data.user);
        setForm(profileRes.data.user);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(null);
    try {
      await ApiService.updateProfile(form);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setProfile({ ...profile, ...form });
      setError(null);
    } catch (err: Error) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading profile..." />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-[80vh] rounded-xl shadow-xl">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full flex items-center justify-center">
            <PersonIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name || ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email || ''}</p>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">Admin Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input name="name" value={form.name || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Role</label>
            <input name="role" value={form.role || ''} disabled className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Location</label>
            <input name="location" value={form.location || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {editMode ? (
            <>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition" onClick={handleSave}>Save</button>
              <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded shadow transition" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>
        {success && <div className="text-green-600 mt-3">{success}</div>}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 my-6" />
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h1a2 2 0 002-2v-5a2 2 0 00-2-2h-1.5a1.5 1.5 0 01-3 0H7a2 2 0 00-2 2v5a2 2 0 002 2h1" /></svg>
          Admin Quick Links
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/dashboard" className="group bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 flex items-center gap-4 shadow hover:scale-105 hover:shadow-lg transition-transform duration-200">
            <span className="bg-blue-500 text-white rounded-full p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg></span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-700">Dashboard</span>
          </Link>
          <Link to="/admin/analytics" className="group bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 flex items-center gap-4 shadow hover:scale-105 hover:shadow-lg transition-transform duration-200">
            <span className="bg-purple-500 text-white rounded-full p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v10zm-6 0a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10z" /></svg></span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-purple-700">Analytics</span>
          </Link>
          <Link to="/admin/students" className="group bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 flex items-center gap-4 shadow hover:scale-105 hover:shadow-lg transition-transform duration-200">
            <span className="bg-green-500 text-white rounded-full p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75" /></svg></span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-green-700">Manage Students</span>
          </Link>
          <Link to="/admin/settings" className="group bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 flex items-center gap-4 shadow hover:scale-105 hover:shadow-lg transition-transform duration-200">
            <span className="bg-yellow-500 text-white rounded-full p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-yellow-700">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;