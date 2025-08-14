import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  GearIcon as Settings,
  FileTextIcon as Database,
  FileTextIcon as Save,
} from '@radix-ui/react-icons';
import apiService from '../services/api';
import { fetchSettings } from '../redux/slices/settingsSlice';
import { useAppDispatch } from '../redux/store';
import { motion } from 'framer-motion';
import syncnerLogo from '../assets/syncner-logo.png';


const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const dispatch = useAppDispatch();
  const settingsState = useSelector((state: any) => state.settings);
  const settings = settingsState.data;
  const settingsLoading = settingsState.loading;
  const settingsError = settingsState.error;

  useEffect(() => {
    if (!settings || settingsState.lastFetched === null) {
      dispatch(fetchSettings());
    }
  }, [settings, settingsState.lastFetched, dispatch]);

  // Gemini API Key management
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [settingsDraft, setSettingsDraft] = useState<any | null>(null);

  useEffect(() => {
    if (settings) {
      setSettingsDraft(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (settings?.integrations?.geminiApiKey !== undefined) {
      setGeminiKeyInput(settings.integrations.geminiApiKey);
    }
  }, [settings]);

  const handleGeminiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiKeyInput(e.target.value);
    setSettingsDraft((prev: any) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        geminiApiKey: e.target.value
      }
    }));
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettingsDraft((prev: any) => {
      if (category === 'integrations') {
        return {
          ...prev,
          integrations: {
            ...prev.integrations,
            [key]: value
          }
        };
      }
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await apiService.updatePlatformSettings(settingsDraft);
      if (response.success) {
        setSaveMessage('Settings saved successfully!');
        dispatch(fetchSettings());
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // User management functions



  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ];

  // Render loading/error for settings
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.img
            src={syncnerLogo}
            alt="Syncner Logo"
            className="w-8 h-8 mx-auto mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading settings...</p>
        </div>
      </div>
    );
  }
  if (settingsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--color-error)' }}>{settingsError}</p>
          <button
            onClick={() => dispatch(fetchSettings())}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-6 lg:space-y-8 p-4 lg:p-8 min-h-screen"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <div className="mb-8">
        <h1 
          className="text-3xl font-heading"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Admin Settings
        </h1>
        <p 
          className="font-label"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Manage your platform settings and content
        </p>
      </div>

      {/* Tabs */}
      <div 
        className="border-b mb-8"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-lg flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id ? 'border-b-2' : 'border-b-2 border-transparent'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--color-secondary-bg)' : 'var(--color-surface)',
                  color: activeTab === tab.id ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                  borderColor: activeTab === tab.id ? 'var(--color-accent-primary)' : 'transparent'
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h2 
              className="text-xl mb-6 font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
              General Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* All inputs now use theme-aware styling */}
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium font-label"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.platformName ?? ''}
                  onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium font-label"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Support Email
                </label>
                <input
                  type="email"
                  value={settingsDraft?.general?.supportEmail ?? ''}
                  onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium font-label"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Max Students per Admin
                </label>
                <input
                  type="number"
                  value={settingsDraft?.general?.maxStudentsPerAdmin ?? 0}
                  onChange={(e) => handleSettingChange('general', 'maxStudentsPerAdmin', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium font-label"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settingsDraft?.general?.sessionTimeout ?? 0}
                  onChange={(e) => handleSettingChange('general', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium font-label"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Site Name
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.siteName ?? ''}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium font-label"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Site Description
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.siteDescription ?? ''}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div 
            className="rounded-xl shadow p-6 space-y-8"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 
              className="text-lg mb-4 flex items-center gap-2 font-heading"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Integrations
            </h3>
            {/* Gemini API Key */}
            <div className="space-y-3 p-6 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              <label 
                className="block text-sm font-medium font-label"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Gemini API Key
              </label>
                              <input
                  type="text"
                  value={geminiKeyInput}
                  onChange={handleGeminiKeyChange}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Enter Gemini API Key"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Used for AI features (chat, feedback, resume).
              </p>
            </div>
            {/* Email Provider */}
            <div className="space-y-3 p-6 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              <label 
                className="block text-sm font-medium font-label"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Email Provider
              </label>
                              <input
                  type="text"
                  value={settingsDraft?.integrations?.emailProvider ?? ''}
                  onChange={e => handleSettingChange('integrations', 'emailProvider', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="e.g. SendGrid, Gmail, Mailgun"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                For reference. Not connected to any provider yet.
              </p>
            </div>
            {/* Analytics Enabled Toggle */}
            <div className="flex items-center justify-between p-6 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="space-y-1">
                <span 
                  className="font-medium block"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Analytics Enabled
                </span>
                <span 
                  className="text-sm"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Track user engagement and platform usage
                </span>
              </div>
              <button
                type="button"
                className="w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300"
                style={{
                  backgroundColor: settingsDraft?.integrations?.analyticsEnabled ? 'var(--color-accent-primary)' : 'var(--color-secondary-bg)'
                }}
                onClick={() => handleSettingChange('integrations', 'analyticsEnabled', !settingsDraft?.integrations?.analyticsEnabled)}
              >
                <span 
                  className={`h-4 w-4 rounded-full shadow transform transition-transform duration-300 ${settingsDraft?.integrations?.analyticsEnabled ? 'translate-x-6' : ''}`}
                  style={{ backgroundColor: 'var(--color-text-inverse)' }}
                ></span>
              </button>
            </div>
            {/* Backup Enabled Toggle */}
            <div className="flex items-center justify-between p-6 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="space-y-1">
                <span 
                  className="font-medium block"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Backup Enabled
                </span>
                <span 
                  className="text-sm"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Automatically backup platform data
                </span>
              </div>
              <button
                type="button"
                className="w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300"
                style={{
                  backgroundColor: settingsDraft?.integrations?.backupEnabled ? 'var(--color-accent-primary)' : 'var(--color-secondary-bg)'
                }}
                onClick={() => handleSettingChange('integrations', 'backupEnabled', !settingsDraft?.integrations?.backupEnabled)}
              >
                <span 
                  className={`h-4 w-4 rounded-full shadow transform transition-transform duration-300 ${settingsDraft?.integrations?.backupEnabled ? 'translate-x-6' : ''}`}
                  style={{ backgroundColor: 'var(--color-text-inverse)' }}
                ></span>
              </button>
            </div>
            <button
              className="mt-4 px-6 py-2 rounded-lg transition-all font-medium"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Integrations'}
            </button>
            {saveMessage && 
              <div 
                className="mt-2"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {saveMessage}
              </div>
            }
          </div>
        )}
      </div>

      {/* Save Button */}
      {activeTab === 'general' && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg transition-colors font-medium flex items-center disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)'
            }}
          >
            {isSaving ? (
              <>
                <motion.img
                  src={syncnerLogo}
                  alt="Syncner Logo"
                  className="w-4 h-4 mr-2"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
                  <div 
            className="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg"
            style={{ 
              backgroundColor: saveMessage.includes('successfully') 
                ? 'var(--color-success)' 
                : 'var(--color-error)',
              color: 'var(--color-text-inverse)'
            }}
          >
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;