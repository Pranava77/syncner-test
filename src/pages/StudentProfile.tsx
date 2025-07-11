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
      } catch (err: Error) {
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
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-offblack min-h-[80vh] rounded-xl shadow-xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="flex-1 bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-8 mb-6 md:mb-0 transition-shadow duration-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-trueturquoise p-3 rounded-full flex items-center justify-center shadow-md">
            <PersonIcon className="h-8 w-8 text-paperwhite" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-paperwhite">{profile.name}</h2>
              <p className="text-sm text-teallight">{profile.email}</p>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-4 text-trueturquoise">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input name="name" value={form.name || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">College</label>
              <input name="college" value={form.college || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Department</label>
              <input name="department" value={form.department || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Career Track</label>
              <input name="careerTrack" value={form.careerTrack || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Location</label>
              <input name="location" value={form.location || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">GPA</label>
              <input name="gpa" value={form.gpa || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Graduation Year</label>
              <input name="graduationYear" value={form.graduationYear || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`} />
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
        {/* Progress Card */}
        <div className="flex-1 bg-paperwhite/10 dark:bg-offblack rounded-xl shadow-lg p-8 transition-shadow duration-200">
          <h3 className="font-semibold text-lg mb-4 text-trueturquoise">Progress Overview</h3>
          {progress ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-trueturquoise">{progress.overallProgress}%</span>
                <span className="text-xs text-teallight">Overall Progress</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-trueturquoise">{progress.streakDays}</span>
                <span className="text-xs text-teallight">Streak Days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-trueturquoise">{progress.totalPoints}</span>
                <span className="text-xs text-teallight">Total Points</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-trueturquoise">{progress.completedModulesCount}</span>
                <span className="text-xs text-teallight">Completed Modules</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-trueturquoise">{progress.completedTasksCount}</span>
                <span className="text-xs text-teallight">Completed Tasks</span>
              </div>
            </div>
          ) : (
            <div className="text-teallight">No progress data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;