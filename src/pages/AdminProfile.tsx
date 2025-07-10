import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
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
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading profile..." />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="flex flex-col gap-2">
          <label>Name: {editMode ? <input name="name" value={form.name || ''} onChange={handleChange} className="border px-2 py-1" /> : profile.name}</label>
          <label>Email: {profile.email}</label>
          <label>Role: {profile.role}</label>
          <label>Phone: {editMode ? <input name="phone" value={form.phone || ''} onChange={handleChange} className="border px-2 py-1" /> : profile.phone}</label>
          <label>Location: {editMode ? <input name="location" value={form.location || ''} onChange={handleChange} className="border px-2 py-1" /> : profile.location}</label>
        </div>
        <div className="mt-4 flex gap-2">
          {editMode ? (
            <>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Admin Quick Links</h3>
        <ul className="list-disc ml-6">
          <li><Link to="/admin/dashboard" className="text-blue-600 underline">Dashboard</Link></li>
          <li><Link to="/admin/analytics" className="text-blue-600 underline">Analytics</Link></li>
          <li><Link to="/admin/students" className="text-blue-600 underline">Manage Students</Link></li>
          <li><Link to="/admin/settings" className="text-blue-600 underline">Settings</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminProfile; 