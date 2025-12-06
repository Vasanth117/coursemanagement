import React, { useState } from 'react';
import { FiLock, FiBell, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import { Card, InputField, Checkbox, PrimaryButton, Tabs } from '../../components/common';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    announcements: true
  });

  const tabs = [
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    toast.success('Notification preferences saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
              <InputField
                label="Current Password"
                name="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              <InputField
                label="New Password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <InputField
                label="Confirm New Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              <Checkbox
                label="Show passwords"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <div className="flex justify-end pt-4 border-t">
                <PrimaryButton type="submit" icon={FiSave}>
                  Update Password
                </PrimaryButton>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <Checkbox
                  label="Email Notifications"
                  name="emailNotifications"
                  checked={notifications.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <Checkbox
                  label="Assignment Reminders"
                  name="assignmentReminders"
                  checked={notifications.assignmentReminders}
                  onChange={handleNotificationChange}
                />
                <Checkbox
                  label="Grade Updates"
                  name="gradeUpdates"
                  checked={notifications.gradeUpdates}
                  onChange={handleNotificationChange}
                />
                <Checkbox
                  label="Course Announcements"
                  name="announcements"
                  checked={notifications.announcements}
                  onChange={handleNotificationChange}
                />
              </div>
              <div className="flex justify-end pt-4 border-t">
                <PrimaryButton type="submit" icon={FiSave}>
                  Save Preferences
                </PrimaryButton>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
