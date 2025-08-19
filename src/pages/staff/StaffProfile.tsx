import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAppSelector } from '../../redux/store';

interface StaffProfileData {
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  department?: string;
  college?: string;
}

const StaffProfile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [profileData, setProfileData] = useState<StaffProfileData>({
    name: '',
    email: '',
    role: '',
    phone: '',
    location: '',
    department: '',
    college: ''
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
            role: userData.role || '',
            phone: userData.phone || '',
            location: userData.location || '',
            department: userData.department || '',
            college: userData.college || ''
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

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const allowedFields = ['name', 'phone', 'location', 'department', 'college'];
      const updateData: any = {};
      allowedFields.forEach(field => {
        if (profileData[field as keyof StaffProfileData] !== undefined) {
          updateData[field] = profileData[field as keyof StaffProfileData];
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
      className="min-h-screen p-4"
      style={{ 
        backgroundColor: 'var(--color-primary-bg)',
        color: 'var(--color-text-primary)'
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h1 
          className="text-3xl font-heading mb-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Staff Profile
        </h1>
        
        <div 
          className="border rounded-lg p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div>
            <label className="block text-sm font-label mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-label mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              disabled
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-label mb-2">Role</label>
            <input
              type="text"
              name="role"
              value={profileData.role}
              disabled
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-label mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={profileData.department}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-label mb-2">College</label>
            <input
              type="text"
              name="college"
              value={profileData.college}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-label mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-label mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              style={{ 
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          {message && (
            <div className="p-3 rounded" style={{
              backgroundColor: message.includes('success') ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              color: message.includes('success') ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {message}
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-2 px-4 rounded transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)' 
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              }
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
