import React from 'react';

const StaffDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-offblack flex flex-col items-center justify-center p-8">
      <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-heading text-paperwhite mb-4">Staff Dashboard</h1>
        <p className="text-teallight font-label mb-6">Welcome to your staff dashboard. Here you will find tools and resources for staff members.</p>
        <div className="bg-paperwhite/5 rounded-lg p-6 text-paperwhite">
          <p className="text-lg">Staff features coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 