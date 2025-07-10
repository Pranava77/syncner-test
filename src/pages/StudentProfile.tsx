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
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-[var(--brand-bg)] min-h-[80vh] rounded-xl shadow-xl transition-colors">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="flex-1 bg-[var(--brand-bg-alt)] rounded-lg shadow p-6 mb-6 md:mb-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-3 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-text)]">{profile.name}</h2>
              <p className="text-sm text-[var(--brand-primary)]">{profile.email}</p>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-[var(--brand-primary)]">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs */}
            {[
              { label: 'Name', name: 'name' },
              { label: 'College', name: 'college' },
              { label: 'Department', name: 'department' },
              { label: 'Career Track', name: 'careerTrack' },
              { label: 'Phone', name: 'phone' },
              { label: 'Location', name: 'location' },
              { label: 'GPA', name: 'gpa' },
              { label: 'Graduation Year', name: 'graduationYear' },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-xs text-[var(--brand-primary)] mb-1">{label}</label>
                <input
                  name={name}
                  value={form[name] || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 rounded border transition-colors ${editMode ? 'border-[var(--brand-primary)] bg-[var(--brand-bg)]' : 'border-[var(--brand-bg-alt)] bg-[var(--brand-bg-alt)]'} focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--brand-text)]`}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            {editMode ? (
              <>
                <button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-accent)] text-white px-5 py-2 rounded shadow transition" onClick={handleSave}>Save</button>
                <button className="bg-[var(--brand-bg-alt)] hover:bg-[var(--brand-bg)] text-[var(--brand-text)] px-5 py-2 rounded shadow transition" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-accent)] text-white px-5 py-2 rounded shadow transition" onClick={() => setEditMode(true)}>Edit Profile</button>
            )}
          </div>
          {success && <div className="text-[var(--brand-success)] mt-3">{success}</div>}
        </div>
        {/* Progress Card */}
        <div className="flex-1 bg-[var(--brand-bg-alt)] rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4 text-[var(--brand-secondary)]">Progress Overview</h3>
          {progress ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[var(--brand-primary)]">{progress.overallProgress}%</span>
                <span className="text-xs text-[var(--brand-text)]">Overall Progress</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[var(--brand-secondary)]">{progress.streakDays}</span>
                <span className="text-xs text-[var(--brand-text)]">Streak Days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[var(--brand-success)]">{progress.totalPoints}</span>
                <span className="text-xs text-[var(--brand-text)]">Total Points</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[var(--brand-accent)]">{progress.completedModulesCount}</span>
                <span className="text-xs text-[var(--brand-text)]">Completed Modules</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-yellow-500 dark:text-yellow-300">{progress.completedTasksCount}</span>
                <span className="text-xs text-[var(--brand-text)]">Completed Tasks</span>
              </div>
            </div>
          ) : (
            <div className="text-[var(--brand-text)]">No progress data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 