import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tantml:react-query';
import { FiUser, FiMail, FiPhone, FiSave } from 'react-icons/fi';
import { Card, InputField, PrimaryButton, Avatar } from '../../components/common';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const updateMutation = useMutation({
    mutationFn: (data) => fetch('/api/v1/profile', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['profile']);
    },
    onError: () => toast.error('Failed to update profile')
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <Avatar name={user?.name} size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600 mt-1">{user?.role}</p>
            <p className="text-sm text-gray-500 mt-2">{user?.email}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={FiUser}
              required
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={FiMail}
              required
              disabled
            />
            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={FiPhone}
            />
            <InputField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
            <div className="flex justify-end">
              <PrimaryButton type="submit" icon={FiSave} disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
