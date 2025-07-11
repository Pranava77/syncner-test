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
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-offblack min-h-[80vh] rounded-xl shadow-xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="flex-1 bg-paperwhite/10 rounded-lg shadow p-6 mb-6 md:mb-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-trueturquoise p-3 rounded-full flex items-center justify-center">
              <PersonIcon className="h-8 w-8 text-offblack" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-paperwhite">{profile ? profile.name : ''}</h2>
              <p className="text-sm text-teallight">{profile ? profile.email : ''}</p>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-trueturquoise">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All labels and inputs use palette */}
            <div>
              <label className="block text-xs text-teallight mb-1">Name</label>
              <input name="name" value={form.name || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">College</label>
              <input name="college" value={form.college || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">Department</label>
              <input name="department" value={form.department || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">Career Track</label>
              <input name="careerTrack" value={form.careerTrack || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">Location</label>
              <input name="location" value={form.location || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">GPA</label>
              <input name="gpa" value={form.gpa || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
            <div>
              <label className="block text-xs text-teallight mb-1">Graduation Year</label>
              <input name="graduationYear" value={form.graduationYear || ''} onChange={handleChange} disabled={!editMode} className={`w-full px-3 py-2 rounded border ${editMode ? 'border-trueturquoise bg-offblack text-paperwhite' : 'border-paperwhite/10 bg-paperwhite/5 text-paperwhite'} focus:outline-none focus:ring-2 focus:ring-trueturquoise placeholder:text-teallight`} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            {editMode ? (
              <>
                <button className="bg-trueturquoise hover:bg-trueturquoise/90 text-paperwhite px-5 py-2 rounded shadow transition" onClick={handleSave}>Save</button>
                <button className="border border-teallight text-teallight px-5 py-2 rounded shadow transition hover:bg-paperwhite/10" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="bg-trueturquoise hover:bg-trueturquoise/90 text-paperwhite px-5 py-2 rounded shadow transition" onClick={() => setEditMode(true)}>Edit Profile</button>
            )}
          </div>
          {success && <div className="text-teallight mt-3">{success}</div>}
        </div>
        {/* Progress Card */}
        <div className="flex-1 bg-paperwhite/10 rounded-lg shadow p-6">
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