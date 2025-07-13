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
    <div className="min-h-screen bg-offblack flex flex-col items-center justify-center p-8">
      <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-heading text-paperwhite mb-4">Staff Dashboard</h1>
        <p className="text-teallight font-label mb-6">Welcome to your staff dashboard. Here you will find tools and resources for staff members.</p>
        <div className="bg-paperwhite/5 rounded-lg p-6 text-paperwhite mb-6">
          <p className="text-lg">Staff features coming soon!</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 bg-rust text-paperwhite px-6 py-2 rounded-lg hover:bg-rust/90 transition-colors font-medium shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard; 