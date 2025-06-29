import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  BookOpen, 
  Briefcase, 
  Bell, 
  Shield, 
  Database, 
  Mail,
  Save,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useCareerTrack } from '../hooks/useCareerTracks';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [loading, setLoading] = useState(false);

  // Use real API data instead of mock data
  // const { track, loading: trackLoading } = useCareerTrack('all');

  // Settings state - in a real app, this would come from API
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Syncner',
      supportEmail: 'support@syncner.com',
      maxStudentsPerAdmin: 500,
      sessionTimeout: 30,
      maintenanceMode: false
    },
    notifications: {
      emailNotifications: true,
      taskReminders: true,
      progressUpdates: true,
      systemAlerts: true,
      weeklyReports: false
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionSecurity: 'standard',
      apiRateLimit: 1000,
      dataRetentionDays: 365
    },
    integrations: {
      geminiApiKey: 'sk-...',
      emailProvider: 'sendgrid',
      analyticsEnabled: true,
      backupEnabled: true
    }
  });

  // Career tracks - in a real app, this would come from API
  const [careerTracks, setCareerTracks] = useState([
    { id: 'fullstack', name: 'Full Stack Development', students: 342, active: true },
    { id: 'ai-ml', name: 'AI/ML Engineering', students: 198, active: true },
    { id: 'ui-ux', name: 'UI/UX Design', students: 156, active: true },
    { id: 'data-science', name: 'Data Science', students: 124, active: true },
    { id: 'mobile', name: 'Mobile Development', students: 0, active: false }
  ]);

  // User roles - in a real app, this would come from API
  const [userRoles, setUserRoles] = useState([
    { id: 'student', name: 'Student', permissions: ['view_content', 'submit_tasks'], count: 820 },
    { id: 'admin', name: 'Administrator', permissions: ['manage_users', 'view_analytics', 'system_settings'], count: 12 },
    { id: 'instructor', name: 'Instructor', permissions: ['manage_content', 'grade_tasks', 'view_students'], count: 8 }
  ]);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCareerTrack = async () => {
    if (newTrackName.trim()) {
      setLoading(true);
      try {
        // In real app, this would save to backend
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const newTrack = {
          id: newTrackName.toLowerCase().replace(/\s+/g, '-'),
          name: newTrackName,
          students: 0,
          active: true
        };
        setCareerTracks(prev => [...prev, newTrack]);
        setNewTrackName('');
        alert('Career track added successfully!');
      } catch (error) {
        alert('Failed to add career track. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditTrack = async (trackId: string, newName: string) => {
    setLoading(true);
    try {
      // In real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setCareerTracks(prev => prev.map(track => 
        track.id === trackId ? { ...track, name: newName } : track
      ));
      setEditingTrack(null);
      alert('Career track updated successfully!');
    } catch (error) {
      alert('Failed to update career track. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (confirm('Are you sure you want to delete this career track?')) {
      setLoading(true);
      try {
        // In real app, this would save to backend
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        setCareerTracks(prev => prev.filter(track => track.id !== trackId));
        alert('Career track deleted successfully!');
      } catch (error) {
        alert('Failed to delete career track. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTrackStatus = async (trackId: string) => {
    setLoading(true);
    try {
      // In real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setCareerTracks(prev => prev.map(track => 
        track.id === trackId ? { ...track, active: !track.active } : track
      ));
    } catch (error) {
      alert('Failed to update track status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Management', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage platform configuration and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.general.platformName}
                  onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Students per Admin
                </label>
                <input
                  type="number"
                  value={settings.general.maxStudentsPerAdmin}
                  onChange={(e) => handleSettingChange('general', 'maxStudentsPerAdmin', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.general.sessionTimeout}
                  onChange={(e) => handleSettingChange('general', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Maintenance Mode</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Temporarily disable access for all users except admins</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Role Management</h2>
            
            <div className="space-y-4">
              {userRoles.map((role) => (
                <div key={role.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{role.count} users</p>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <span key={permission} className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-sm">
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Role
            </button>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Career Track Management</h2>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="New career track name"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAddCareerTrack}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {careerTracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={track.active}
                        onChange={() => toggleTrackStatus(track.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                    
                    <div>
                      {editingTrack === track.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            defaultValue={track.name}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditTrack(track.id, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingTrack(null)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900 dark:text-white">{track.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{track.students} students enrolled</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTrack(track.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      disabled={track.students > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {key === 'emailNotifications' && 'Send email notifications to users'}
                      {key === 'taskReminders' && 'Remind students about pending tasks'}
                      {key === 'progressUpdates' && 'Send progress updates to students'}
                      {key === 'systemAlerts' && 'Send system alerts and announcements'}
                      {key === 'weeklyReports' && 'Send weekly progress reports to admins'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Security Level
                </label>
                <select
                  value={settings.security.sessionSecurity}
                  onChange={(e) => handleSettingChange('security', 'sessionSecurity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={settings.security.apiRateLimit}
                  onChange={(e) => handleSettingChange('security', 'apiRateLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  value={settings.security.dataRetentionDays}
                  onChange={(e) => handleSettingChange('security', 'dataRetentionDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Require Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Require all users to enable 2FA for enhanced security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.requireTwoFactor}
                  onChange={(e) => handleSettingChange('security', 'requireTwoFactor', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Integration Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gemini AI API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.integrations.geminiApiKey}
                    onChange={(e) => handleSettingChange('integrations', 'geminiApiKey', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Provider
                </label>
                <select
                  value={settings.integrations.emailProvider}
                  onChange={(e) => handleSettingChange('integrations', 'emailProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                  <option value="smtp">Custom SMTP</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Analytics Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable detailed analytics and usage tracking</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.analyticsEnabled}
                      onChange={(e) => handleSettingChange('integrations', 'analyticsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Automatic Backups</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable daily automated backups of platform data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.backupEnabled}
                      onChange={(e) => handleSettingChange('integrations', 'backupEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;