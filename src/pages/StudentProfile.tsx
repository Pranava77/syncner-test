import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAppSelector } from '../redux/store';

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

const StudentProfile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [profileData, setProfileData] = useState<StudentProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    college: '',
    department: '',
    careerTrack: '',
    gpa: '',
    graduationYear: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await apiService.getMe();
        if (profileRes.success && profileRes.data.user) {
          const userData = profileRes.data.user;
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            college: userData.college || '',
            department: userData.department || '',
            careerTrack: userData.careerTrack || '',
            gpa: userData.gpa || '',
            graduationYear: userData.graduationYear || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const formatCareerTrack = (track: string) => {
    switch (track) {
      case 'full-stack':
        return 'Full Stack Development';
      case 'ai-ml':
        return 'AI & Machine Learning';
      case 'ui-ux':
        return 'UI/UX Design';
      case 'data-science':
        return 'Data Science';
      default:
        return track || 'Not assigned';
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const allowedFields = ['name', 'phone', 'location', 'college', 'department', 'gpa', 'graduationYear'];
      const updateData: any = {};
      allowedFields.forEach(field => {
        if (profileData[field as keyof StudentProfileData] !== undefined) {
          updateData[field] = profileData[field as keyof StudentProfileData];
        }
      });
      await apiService.updateProfile(updateData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Page Header */}
          <div 
            className="w-full rounded-xl border shadow-lg p-6 mb-8"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Student Profile
                </h1>
                <p 
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Manage your personal information and account settings
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-sm">
                  {user?.role || 'Student'}
                </span>
                <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-sm">
                  {formatCareerTrack(user?.careerTrack || '')}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="w-full bg-paperwhite/10 rounded-xl border border-paperwhite/20 shadow-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Name
            </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)'
                  }}
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  placeholder="Enter your location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">College</label>
                <input
                  type="text"
                  name="college"
                  value={profileData.college}
                  onChange={handleChange}
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  placeholder="Enter your college name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleChange}
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  placeholder="Enter your department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">Career Track</label>
                <input
                  type="text"
                  name="careerTrack"
                  value={formatCareerTrack(profileData.careerTrack || '')}
                  disabled
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite/50 cursor-not-allowed"
                  placeholder="Career track"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">GPA</label>
                <input
                  type="text"
                  name="gpa"
                  value={profileData.gpa}
                  onChange={handleChange}
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  placeholder="Enter your GPA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-paperwhite mb-2">Graduation Year</label>
                <input
                  type="text"
                  name="graduationYear"
                  value={profileData.graduationYear}
                  onChange={handleChange}
                  className="w-full bg-offblack/60 border border-paperwhite/20 rounded-lg px-4 py-3 text-paperwhite focus:ring-2 focus:ring-trueturquoise focus:border-transparent transition-colors"
                  placeholder="Enter graduation year"
                />
              </div>
            </div>
            
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.includes('success') 
                  ? 'bg-trueturquoise/10 border-trueturquoise/20 text-trueturquoise' 
                  : 'bg-rust/10 border-rust/20 text-rust'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg font-semibold hover:bg-teallight transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;