import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  StarIcon,
  ArrowLeftIcon,
  HeartIcon
} from '@radix-ui/react-icons';

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  // Mock student data for demonstration
  const mockStudent = {
    _id: studentId || 'Unknown',
    name: 'Student Name',
    email: 'student@example.com',
    college: 'Example College',
    careerTrack: 'full-stack',
    level: 'beginner',
    isActive: true,
    profileComplete: true,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    interests: ['Programming', 'Web Development']
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      {/* Top Header/Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/students')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-accent-tertiary)]"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Students
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Portfolio functionality has been removed
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Student Basic Information */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {mockStudent.name}
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Student ID: {mockStudent._id}
            </p>
          </div>

          {/* Basic Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <PersonIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{mockStudent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>College:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{mockStudent.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Career Track:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>{mockStudent.careerTrack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Level:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{mockStudent.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enrolled:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {new Date(mockStudent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <StarIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Active:</span>
                  <span className={`font-semibold ${mockStudent.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {mockStudent.isActive ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Profile:</span>
                  <span className={`font-semibold ${mockStudent.profileComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                    {mockStudent.profileComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Last Active:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {new Date(mockStudent.lastActive).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <HeartIcon className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
                Interests
              </h3>
              <div className="space-y-3">
                {mockStudent.interests && mockStudent.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mockStudent.interests.map((interest: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: 'var(--color-accent-primary)',
                          color: 'var(--color-text-inverse)'
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No interests specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Note about Portfolio Removal */}
          <div className="p-6 rounded-xl shadow-sm text-center" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Portfolio Functionality Removed
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              The student portfolio, attendance tracking, and performance metrics have been removed from this system.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDetails;
