import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { PersonIcon } from '@radix-ui/react-icons';

interface StudentProfileData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  college?: string;
  department?: string;
  careerTrack?: string;
  gpa?: string;
  graduationYear?: string;
}

interface StudentProgressData {
  overallProgress: number;
  streakDays: number;
  totalPoints: number;
  completedModulesCount: number;
  completedTasksCount: number;
}

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [progress, setProgress] = useState<StudentProgressData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<StudentProfileData>({ name: '', email: '' });
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
        const progressRes = await ApiService.getUserProgress();
        setProgress(progressRes.data);
        setError(null);
      } catch (err) {
        setError((err as any)?.message || 'Failed to load profile');
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
    } catch (err) {
      setError((err as any)?.message || 'Failed to update profile');
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
                  Student
                </span>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-6 text-trueturquoise flex items-center gap-2">
              <PersonIcon className="w-5 h-5" /> Personal Information
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
                <label className="block text-sm text-teallight mb-2 font-medium">College</label>
                <input 
                  name="college" 
                  value={form.college || ''} 
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
                <label className="block text-sm text-teallight mb-2 font-medium">Department</label>
                <input 
                  name="department" 
                  value={form.department || ''} 
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
                <label className="block text-sm text-teallight mb-2 font-medium">Career Track</label>
                <input 
                  name="careerTrack" 
                  value={form.careerTrack || ''} 
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
              <div>
                <label className="block text-sm text-teallight mb-2 font-medium">GPA</label>
                <input 
                  name="gpa" 
                  value={form.gpa || ''} 
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
                <label className="block text-sm text-teallight mb-2 font-medium">Graduation Year</label>
                <input 
                  name="graduationYear" 
                  value={form.graduationYear || ''} 
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

        {/* Progress Overview Card */}
        <div className="lg:col-span-1">
          <div className="bg-offblack border border-paperwhite/10 rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-6 text-trueturquoise flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Progress Overview
            </h3>
            
            {progress ? (
              <div className="space-y-4">
                <div className="bg-paperwhite/5 border border-paperwhite/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-teallight font-medium">Overall Progress</span>
                    <span className="text-2xl font-bold text-trueturquoise">{progress.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-paperwhite/10 rounded-full h-2">
                    <div 
                      className="bg-trueturquoise h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-paperwhite/5 border border-paperwhite/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-trueturquoise mb-1">{progress.streakDays}</div>
                    <div className="text-xs text-teallight">Streak Days</div>
                  </div>
                  
                  <div className="bg-paperwhite/5 border border-paperwhite/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-trueturquoise mb-1">{progress.totalPoints}</div>
                    <div className="text-xs text-teallight">Total Points</div>
                  </div>
                  
                  <div className="bg-paperwhite/5 border border-paperwhite/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-trueturquoise mb-1">{progress.completedModulesCount}</div>
                    <div className="text-xs text-teallight">Modules Completed</div>
                  </div>
                  
                  <div className="bg-paperwhite/5 border border-paperwhite/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-trueturquoise mb-1">{progress.completedTasksCount}</div>
                    <div className="text-xs text-teallight">Tasks Completed</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-teallight text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-paperwhite/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No progress data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;