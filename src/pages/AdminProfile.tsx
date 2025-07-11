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
      <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-8 mb-8 transition-shadow duration-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-trueturquoise p-3 rounded-full flex items-center justify-center shadow-md">
            <PersonIcon className="h-8 w-8 text-paperwhite" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-paperwhite">{profile?.name || ''}</h2>
            <p className="text-sm text-teallight">{profile?.email || ''}</p>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-4 text-trueturquoise flex items-center gap-2">
          <PersonIcon className="w-5 h-5" /> Admin Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="mt-8 flex gap-4">
          {editMode ? (
            <>
              <button className="bg-trueturquoise hover:bg-teallight text-offblack px-6 py-2 rounded-lg shadow transition-all font-semibold" onClick={handleSave}>Save</button>
              <button className="bg-paperwhite/10 hover:bg-paperwhite/20 text-paperwhite px-6 py-2 rounded-lg shadow transition-all font-semibold" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button className="bg-trueturquoise hover:bg-teallight text-offblack px-6 py-2 rounded-lg shadow transition-all font-semibold" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>
        {success && <div className="text-trueturquoise mt-4">{success}</div>}
      </div>
      <div className="border-t border-trueturquoise my-8" />
      <div className="bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-8 transition-shadow duration-200">
        <h3 className="font-semibold text-lg mb-4 text-trueturquoise flex items-center gap-2">
          <PersonIcon className="w-5 h-5" /> Admin Quick Links
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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