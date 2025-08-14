import React from 'react';
import { useAppDispatch } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
              style={{ backgroundColor: 'var(--color-secondary-bg)' }}
    >
      <div 
        className="rounded-xl shadow-lg p-8 max-w-xl w-full text-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <h1 
          className="text-3xl font-heading mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Staff Dashboard
        </h1>
        <p 
          className="font-label mb-6"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Welcome to your staff dashboard. Here you will find tools and resources for staff members.
        </p>
        <div 
          className="rounded-lg p-6 mb-6"
          style={{
            backgroundColor: 'var(--color-tertiary-bg)',
            color: 'var(--color-text-primary)'
          }}
        >
          <p className="text-lg">Staff features coming soon!</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-2 rounded-lg transition-colors font-medium shadow"
          style={{ 
            backgroundColor: 'var(--color-error)',
            color: 'var(--color-text-inverse)' 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error)';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard; 