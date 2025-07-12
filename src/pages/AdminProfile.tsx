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
  if (error) return <div className="text-rust p-4">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Card */}
        <div className="lg:col-span-2">
          <div className="bg-offblack border border-paperwhite/10 rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-trueturquoise p-4 rounded-full flex items-center justify-center shadow-lg">
                <PersonIcon className="h-10 w-10 text-offblack" />
          </div>
          <div>
                <h2 className="text-2xl font-bold text-paperwhite">{profile?.name || ''}</h2>
                <p className="text-teallight">{profile?.email || ''}</p>
                <span className="inline-block bg-trueturquoise/20 text-trueturquoise px-3 py-1 rounded-full text-sm font-medium mt-2">
                  {profile?.role || 'Administrator'}
                </span>
          </div>
        </div>
            
            <h3 className="font-semibold text-lg mb-6 text-trueturquoise flex items-center gap-2">
              <PersonIcon className="w-5 h-5" /> Profile Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                <label className="block text-sm text-teallight mb-2 font-medium">Full Name</label>
                <input 
                  name="name" 
                  value={form.name || ''} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    editMode 
                      ? 'border-trueturquoise bg-offblack text-paperwhite focus:ring-2 focus:ring-trueturquoise/50' 
                      : 'border-paperwhite/20 bg-offblack/50 text-paperwhite/70'
                  } focus:outline-none`} 
                />
          </div>
          <div>
                <label className="block text-sm text-teallight mb-2 font-medium">Role</label>
                <input 
                  name="role" 
                  value={form.role || ''} 
                  disabled 
                  className="w-full px-4 py-3 rounded-lg border border-paperwhite/20 bg-offblack/50 text-paperwhite/70" 
                />
          </div>
          <div>
                <label className="block text-sm text-teallight mb-2 font-medium">Phone Number</label>
                <input 
                  name="phone" 
                  value={form.phone || ''} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    editMode 
                      ? 'border-trueturquoise bg-offblack text-paperwhite focus:ring-2 focus:ring-trueturquoise/50' 
                      : 'border-paperwhite/20 bg-offblack/50 text-paperwhite/70'
                  } focus:outline-none`} 
                />
          </div>
          <div>
                <label className="block text-sm text-teallight mb-2 font-medium">Location</label>
                <input 
                  name="location" 
                  value={form.location || ''} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    editMode 
                      ? 'border-trueturquoise bg-offblack text-paperwhite focus:ring-2 focus:ring-trueturquoise/50' 
                      : 'border-paperwhite/20 bg-offblack/50 text-paperwhite/70'
                  } focus:outline-none`} 
                />
          </div>
        </div>
            
            <div className="mt-8 flex gap-4">
          {editMode ? (
            <>
                  <button 
                    className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack px-8 py-3 rounded-lg shadow-lg transition-all duration-200 font-semibold flex items-center gap-2" 
                    onClick={handleSave}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                  <button 
                    className="bg-paperwhite/10 hover:bg-paperwhite/20 text-paperwhite px-8 py-3 rounded-lg shadow-lg transition-all duration-200 font-semibold" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
            </>
          ) : (
                <button 
                  className="bg-trueturquoise hover:bg-trueturquoise/90 text-offblack px-8 py-3 rounded-lg shadow-lg transition-all duration-200 font-semibold flex items-center gap-2" 
                  onClick={() => setEditMode(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
          )}
            </div>
            
            {success && (
              <div className="mt-4 p-4 bg-trueturquoise/20 border border-trueturquoise/30 rounded-lg text-trueturquoise">
                {success}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-1">
          <div className="bg-offblack border border-paperwhite/10 rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-6 text-trueturquoise flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>
            
            <div className="space-y-4">
              <Link 
                to="/admin/dashboard" 
                className="group bg-paperwhite/5 hover:bg-paperwhite/10 border border-paperwhite/10 hover:border-trueturquoise/30 rounded-lg p-4 flex items-center gap-4 transition-all duration-200"
              >
                <div className="bg-trueturquoise p-3 rounded-lg">
                  <svg className="w-6 h-6 text-offblack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-paperwhite group-hover:text-trueturquoise transition-colors">Dashboard</span>
                  <p className="text-sm text-teallight">View system overview</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/analytics" 
                className="group bg-paperwhite/5 hover:bg-paperwhite/10 border border-paperwhite/10 hover:border-trueturquoise/30 rounded-lg p-4 flex items-center gap-4 transition-all duration-200"
              >
                <div className="bg-trueturquoise p-3 rounded-lg">
                  <svg className="w-6 h-6 text-offblack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-paperwhite group-hover:text-trueturquoise transition-colors">Analytics</span>
                  <p className="text-sm text-teallight">Performance insights</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/diagnostics" 
                className="group bg-paperwhite/5 hover:bg-paperwhite/10 border border-paperwhite/10 hover:border-trueturquoise/30 rounded-lg p-4 flex items-center gap-4 transition-all duration-200"
              >
                <div className="bg-trueturquoise p-3 rounded-lg">
                  <svg className="w-6 h-6 text-offblack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-paperwhite group-hover:text-trueturquoise transition-colors">Diagnostics</span>
                  <p className="text-sm text-teallight">System health check</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/settings" 
                className="group bg-paperwhite/5 hover:bg-paperwhite/10 border border-paperwhite/10 hover:border-trueturquoise/30 rounded-lg p-4 flex items-center gap-4 transition-all duration-200"
              >
                <div className="bg-trueturquoise p-3 rounded-lg">
                  <svg className="w-6 h-6 text-offblack" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-paperwhite group-hover:text-trueturquoise transition-colors">Settings</span>
                  <p className="text-sm text-teallight">Configure system</p>
                </div>
              </Link>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
};

export default AdminProfile;