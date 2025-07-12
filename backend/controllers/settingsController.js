import Settings from '../models/Settings.js';

const defaultSettings = {
  general: {
    platformName: '',
    supportEmail: '',
    maxStudentsPerAdmin: 100,
    sessionTimeout: 60,
    maintenanceMode: false,
    siteName: '',
    siteDescription: '',
    allowRegistration: true
  },
  notifications: {
    emailNotifications: true,
    progressUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    pushNotifications: false
  },
  security: {
    passwordMinLength: 6,
    requireTwoFactor: false,
    sessionSecurity: '',
    apiRateLimit: 100,
    dataRetentionDays: 30,
    requireEmailVerification: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5
  },
  integrations: {
    geminiApiKey: '',
    emailProvider: '',
    analyticsEnabled: false,
    backupEnabled: false
  }
};

// Get settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(defaultSettings);
    } else {
      // Ensure all sub-objects exist
      Object.keys(defaultSettings).forEach(key => {
        if (!settings[key]) settings[key] = defaultSettings[key];
      });
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(defaultSettings);
    }
    Object.assign(settings, req.body);
    // Ensure all sub-objects exist after update
    Object.keys(defaultSettings).forEach(key => {
      if (!settings[key]) settings[key] = defaultSettings[key];
    });
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 