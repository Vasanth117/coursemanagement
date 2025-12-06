import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiSave, FiSettings, FiMail, FiShield, FiDatabase } from 'react-icons/fi';
import { Card, InputField, SelectField, Checkbox, PrimaryButton, Tabs, LoadingSpinner } from '../../components/common';
import { adminAPI } from '../../api/admin';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({});

  // Fetch settings
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminAPI.getSettings(),
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'database', label: 'Database', icon: FiDatabase }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateMutation = useMutation({
    mutationFn: (settingsData) => adminAPI.updateSettings(settingsData),
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries(['admin-settings']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading settings..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings</p>
      </div>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <InputField
                label="Site Name"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                required
              />
              <InputField
                label="Site Email"
                name="siteEmail"
                type="email"
                value={settings.siteEmail}
                onChange={handleChange}
                required
              />
              <Checkbox
                label="Allow new user registration"
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleChange}
              />
              <Checkbox
                label="Maintenance Mode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
              />
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <InputField label="SMTP Host" name="smtpHost" placeholder="smtp.gmail.com" />
              <InputField label="SMTP Port" name="smtpPort" placeholder="587" />
              <InputField label="SMTP Username" name="smtpUser" />
              <InputField label="SMTP Password" name="smtpPass" type="password" />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Checkbox
                label="Require email verification"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleChange}
              />
              <SelectField
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                options={[
                  { value: '15', label: '15 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '1 hour' },
                  { value: '120', label: '2 hours' }
                ]}
              />
              <SelectField
                label="Max Upload Size (MB)"
                name="maxUploadSize"
                value={settings.maxUploadSize}
                onChange={handleChange}
                options={[
                  { value: '5', label: '5 MB' },
                  { value: '10', label: '10 MB' },
                  { value: '20', label: '20 MB' },
                  { value: '50', label: '50 MB' }
                ]}
              />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Database operations should be performed with caution.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PrimaryButton type="button">Backup Database</PrimaryButton>
                <PrimaryButton type="button">Restore Database</PrimaryButton>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t">
            <PrimaryButton type="submit" loading={updateMutation.isLoading}>
              <FiSave className="w-5 h-5 mr-2" />
              Save Settings
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;
