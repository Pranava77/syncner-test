import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { User as UserIcon } from 'lucide-react';

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
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
        const progressRes = await ApiService.getUserProgress();
        setProgress(progressRes.data);
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
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-[80vh] rounded-xl shadow-xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6 md:mb-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full flex items-center justify-center">
            <PersonIcon className="h-8 w-8 text-white" />
          </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        {/* Progress Card */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4 text-purple-700 dark:text-purple-300">Progress Overview</h3>
          {progress ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">{progress.overallProgress}%</span>
                <span className="text-xs text-gray-500">Overall Progress</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">{progress.streakDays}</span>
                <span className="text-xs text-gray-500">Streak Days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600 dark:text-green-300">{progress.totalPoints}</span>
                <span className="text-xs text-gray-500">Total Points</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-pink-600 dark:text-pink-300">{progress.completedModulesCount}</span>
                <span className="text-xs text-gray-500">Completed Modules</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{progress.completedTasksCount}</span>
                <span className="text-xs text-gray-500">Completed Tasks</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No progress data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;