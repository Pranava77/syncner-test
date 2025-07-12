import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  general: {
    platformName: String,
    supportEmail: String,
    maxStudentsPerAdmin: Number,
    sessionTimeout: Number,
    maintenanceMode: Boolean,
    siteName: String,
    siteDescription: String,
    allowRegistration: Boolean
  },
  notifications: {
    emailNotifications: Boolean,
    progressUpdates: Boolean,
    systemAlerts: Boolean,
    weeklyReports: Boolean,
    pushNotifications: Boolean
  },
  security: {
    passwordMinLength: Number,
    requireTwoFactor: Boolean,
    sessionSecurity: String,
    apiRateLimit: Number,
    dataRetentionDays: Number,
    requireEmailVerification: Boolean,
    sessionTimeout: Number,
    maxLoginAttempts: Number
  },
  integrations: {
    geminiApiKey: String,
    emailProvider: String,
    analyticsEnabled: Boolean,
    backupEnabled: Boolean
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema); 