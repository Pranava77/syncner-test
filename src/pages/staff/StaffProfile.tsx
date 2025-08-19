import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  EnvelopeClosedIcon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircledIcon,
  StarIcon,
  BarChartIcon
} from '@radix-ui/react-icons';
import syncnerLogo from '../../assets/syncner-logo.png';

const StaffProfile: React.FC = () => {
  const [staffData, setStaffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStaffData({
        id: 1,
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@syncner.edu',
        department: 'Computer Science',
        college: 'Engineering & Technology',
        role: 'Staff',
        careerTrack: 'Full Stack Development',
        isActive: true,
        joinDate: '2023-01-15',
        lastActive: '2 hours ago',
        totalStudents: 45,
        avgStudentProgress: 78,
        completedSessions: 156,
        rating: 4.8,
        bio: 'Experienced computer science educator with expertise in full-stack development, web technologies, and software engineering principles. Passionate about helping students develop practical skills for the modern tech industry.',
        expertise: [
          'JavaScript/TypeScript',
          'React & Node.js',
          'Database Design',
          'API Development',
          'DevOps & Deployment',
          'Software Architecture'
        ],
        achievements: [
          'Excellence in Teaching Award 2023',
          'Best Student Outcomes 2023',
          'Innovation in Curriculum Award 2022'
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <motion.img
              src={syncnerLogo}
              alt="Syncner Logo"
              className="w-8 h-8"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <span className="text-lg" style={{ color: 'var(--color-text-tertiary)' }}>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-heading font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Staff Profile
          </h1>
          <p 
            className="font-label text-lg"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            View your staff profile and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <motion.div
              className="rounded-xl shadow-lg p-6 mb-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-tertiary)' }}>
                  <PersonIcon className="w-12 h-12" style={{ color: 'var(--color-accent-primary)' }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {staffData.name}
                </h2>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                  {staffData.role} • {staffData.department}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <StarIcon className="w-4 h-4" style={{ color: '#FFD700' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.rating}/5.0
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EnvelopeClosedIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <BuildingIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.college}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.department}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Joined {new Date(staffData.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircledIcon className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              className="rounded-xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total Students</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.totalStudents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Avg Student Progress</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.avgStudentProgress}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Completed Sessions</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.completedSessions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Last Active</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.lastActive}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <motion.div
              className="rounded-xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Biography
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {staffData.bio}
              </p>
            </motion.div>

            {/* Expertise Section */}
            <motion.div
              className="rounded-xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {staffData.expertise.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--color-accent-tertiary)',
                      color: 'var(--color-accent-primary)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Achievements Section */}
            <motion.div
              className="rounded-xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Achievements & Recognition
              </h3>
              <div className="space-y-3">
                {staffData.achievements.map((achievement: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Career Track Section */}
            <motion.div
              className="rounded-xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Career Track Focus
              </h3>
              <div className="flex items-center gap-3">
                <BarChartIcon className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
                <div>
                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {staffData.careerTrack}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Specialized track for student development
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffProfile;
