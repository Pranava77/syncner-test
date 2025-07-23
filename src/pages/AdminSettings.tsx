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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-true-turquoise mx-auto mb-4" />
          <p className="text-teallight">Loading settings...</p>
        </div>
      </div>
    );
  }
  if (settingsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-rust mb-4">{settingsError}</p>
          <button
            onClick={() => dispatch(fetchSettings())}
            className="bg-[#00B8D9] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#00B8D9]/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-offblack min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl  text-paperwhite font-heading">Admin Settings</h1>
        <p className="text-teallight font-label">Manage your platform settings and content</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-paperwhite/10 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-lg flex items-center space-x-2 transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'text-[#00B8D9] border-b-2 border-[#00B8D9] bg-offblack'
                    : 'text-paperwhite/60 hover:text-[#00B8D9] border-b-2 border-transparent bg-offblack/80'}`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-paperwhite/10 rounded-xl shadow-lg p-6">
            <h2 className="text-xl text-paperwhite mb-6 font-heading">General Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* All inputs use bg-offblack, border-paperwhite/20, text-paperwhite */}
              <div>
                <label className="block text-sm text-teallight mb-2 font-label">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.platformName ?? ''}
                  onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-[#00B8D9]/40 focus:border-[#00B8D9] bg-offblack text-paperwhite placeholder:text-teallight"
                />
              </div>
              <div>
                <label className="block text-sm text-teallight mb-2 font-label">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settingsDraft?.general?.supportEmail ?? ''}
                  onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-[#00B8D9]/40 focus:border-[#00B8D9] bg-offblack text-paperwhite placeholder:text-teallight"
                />
              </div>
              <div>
                <label className="block text-sm text-teallight mb-2 font-label">
                  Max Students per Admin
                </label>
                <input
                  type="number"
                  value={settingsDraft?.general?.maxStudentsPerAdmin ?? 0}
                  onChange={(e) => handleSettingChange('general', 'maxStudentsPerAdmin', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-[#00B8D9]/40 focus:border-[#00B8D9] bg-offblack text-paperwhite placeholder:text-teallight"
                />
              </div>
              <div>
                <label className="block text-sm text-teallight mb-2 font-label">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settingsDraft?.general?.sessionTimeout ?? 0}
                  onChange={(e) => handleSettingChange('general', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-[#00B8D9]/40 focus:border-[#00B8D9] bg-offblack text-paperwhite placeholder:text-teallight"
                />
              </div>
              <div>
                <label className="block text-sm text-teallight mb-2 font-label">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.siteName ?? ''}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-[#00B8D9]/40 focus:border-[#00B8D9] bg-offblack text-paperwhite placeholder:text-teallight"
                />
              </div>
              <div>
                <label className="block text-sm text-teallight mb-2 font-label">
                  Site Description
                </label>
                <input
                  type="text"
                  value={settingsDraft?.general?.siteDescription ?? ''}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-paperwhite/20 rounded-lg focus:ring-2 focus:ring-[#00B8D9]/40 focus:border-[#00B8D9] bg-offblack text-paperwhite placeholder:text-teallight"
                />
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="bg-paperwhite/10 rounded-xl shadow p-6 space-y-8">
            <h3 className="text-lg mb-4 flex items-center gap-2 text-paperwhite font-heading">
              Integrations
            </h3>
            {/* Gemini API Key */}
            <div>
              <label className="block text-sm text-paperwhite mb-2 font-label">Gemini API Key</label>
              <input
                type="text"
                value={geminiKeyInput}
                onChange={handleGeminiKeyChange}
                className="w-full px-4 py-2 border rounded-lg bg-offblack border-paperwhite/20 text-paperwhite placeholder:text-teallight"
                placeholder="Enter Gemini API Key"
              />
              <p className="text-xs text-teallight">Used for AI features (chat, feedback, resume).</p>
            </div>
            {/* Email Provider */}
            <div>
              <label className="block text-sm text-paperwhite mb-2 font-label">Email Provider</label>
              <input
                type="text"
                value={settingsDraft?.integrations?.emailProvider ?? ''}
                onChange={e => handleSettingChange('integrations', 'emailProvider', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-offblack border-paperwhite/20 text-paperwhite placeholder:text-teallight"
                placeholder="e.g. SendGrid, Gmail, Mailgun"
              />
              <p className="text-xs text-teallight">For reference. Not connected to any provider yet.</p>
            </div>
            {/* Analytics Enabled Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-paperwhite font-medium">Analytics Enabled</span>
              <button
                type="button"
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settingsDraft?.integrations?.analyticsEnabled ? 'bg-[#00B8D9]' : 'bg-offblack'}`}
                onClick={() => handleSettingChange('integrations', 'analyticsEnabled', !settingsDraft?.integrations?.analyticsEnabled)}
              >
                <span className={`h-4 w-4 bg-paperwhite rounded-full shadow transform transition-transform duration-300 ${settingsDraft?.integrations?.analyticsEnabled ? 'translate-x-6' : ''}`}></span>
              </button>
            </div>
            {/* Backup Enabled Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-paperwhite font-medium">Backup Enabled</span>
              <button
                type="button"
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settingsDraft?.integrations?.backupEnabled ? 'bg-[#00B8D9]' : 'bg-offblack'}`}
                onClick={() => handleSettingChange('integrations', 'backupEnabled', !settingsDraft?.integrations?.backupEnabled)}
              >
                <span className={`h-4 w-4 bg-paperwhite rounded-full shadow transform transition-transform duration-300 ${settingsDraft?.integrations?.backupEnabled ? 'translate-x-6' : ''}`}></span>
              </button>
            </div>
            <button
              className="mt-4 bg-[#00B8D9] text-[#121212] px-6 py-2 rounded-lg hover:bg-[#00B8D9]/90 transition-all font-medium"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Integrations'}
            </button>
            {saveMessage && <div className="mt-2 text-teallight">{saveMessage}</div>}
          </div>
        )}
      </div>

      {/* Save Button */}
      {activeTab === 'general' && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[#00B8D9] text-[#121212] px-6 py-2 rounded-lg hover:bg-[#00B8D9]/90 transition-colors font-medium flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-paperwhite mr-2"></div>
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
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          saveMessage.includes('successfully') 
            ? 'bg-teallight text-offblack' 
            : 'bg-rust text-paperwhite'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;