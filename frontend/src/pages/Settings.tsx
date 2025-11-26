import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { ImageUpload } from '../components/common/ImageUpload';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Loader2
} from 'lucide-react';
import api from '../api/client';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null); // Not needed with ImageUpload component
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    teamUpdates: false,
    weeklyReports: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: imageUrl }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Save profile data
      await api.put('/users/profile', {
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        location: profileData.location,
        bio: profileData.bio,
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="page-container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-title">
            <SettingsIcon size={32} className="page-icon" />
            <div>
              <h1>Settings</h1>
              <p>Manage your account and application preferences</p>
            </div>
          </div>
          <button 
            className="primary-button" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </motion.div>

        <motion.div 
          className="page-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="settings-layout">
            <div className="settings-sidebar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="settings-content">
              {activeTab === 'profile' && (
                <div className="settings-section">
                  <h2>Profile Information</h2>
                  <p>Update your personal information and profile details.</p>

                  <div className="profile-avatar">
                    <div className="avatar-preview">
                      {profileData.avatarUrl ? (
                        <img src={profileData.avatarUrl} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">
                          <User size={40} />
                        </div>
                      )}
                    </div>
                    <div className="avatar-upload">
                      <ImageUpload 
                        currentImage={profileData.avatarUrl} 
                        onImageUploaded={handleAvatarChange} 
                        className="profile-image-upload"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="settings-error">
                      {error}
                    </div>
                  )}
                  
                  {saveSuccess && (
                    <div className="settings-success">
                      Settings saved successfully!
                    </div>
                  )}

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        placeholder="Engineering, Marketing, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="New York, NY"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h2>Notification Preferences</h2>
                  <p>Choose how you want to be notified about updates and activities.</p>

                  <div className="notification-settings">
                    <div className="notification-item">
                      <div>
                        <h3>Email Notifications</h3>
                        <p>Receive notifications via email</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="notification-item">
                      <div>
                        <h3>Task Reminders</h3>
                        <p>Get reminded about upcoming task deadlines</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.taskReminders}
                          onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="notification-item">
                      <div>
                        <h3>Team Updates</h3>
                        <p>Notifications about team member activities</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.teamUpdates}
                          onChange={(e) => handleNotificationChange('teamUpdates', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="notification-item">
                      <div>
                        <h3>Weekly Reports</h3>
                        <p>Receive weekly summary reports</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.weeklyReports}
                          onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="settings-section">
                  <h2>Application Preferences</h2>
                  <p>Customize your application experience.</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Theme</label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="CST">Central Time</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date Format</label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2>Security Settings</h2>
                  <p>Manage your account security and privacy.</p>

                  <div className="security-section">
                    <h3>Password</h3>
                    <p>Change your account password</p>
                    <button className="secondary-button">Change Password</button>
                  </div>

                  <div className="security-section">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                    <button className="secondary-button">Enable 2FA</button>
                  </div>

                  <div className="security-section">
                    <h3>Active Sessions</h3>
                    <p>Manage your active login sessions</p>
                    <button className="secondary-button">View Sessions</button>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="settings-section">
                  <h2>Data & Privacy</h2>
                  <p>Control your data and privacy settings.</p>

                  <div className="data-section">
                    <h3>Export Data</h3>
                    <p>Download a copy of your data</p>
                    <button className="secondary-button">Export Data</button>
                  </div>

                  <div className="data-section">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all data</p>
                    <button className="danger-button">Delete Account</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Settings;

