import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '../../api/student';
import { FiUser, FiBook, FiSave } from 'react-icons/fi';
import { LoadingSpinner, Card, Button, Avatar } from '../../components/common';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentAPI.getProfile
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: studentAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentProfile']);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="text-center">
          <Avatar name={profile.name} size="2xl" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-gray-600 mt-1">{profile.rollNumber}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <FiBook className="h-4 w-4" />
              <span>{profile.department}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <FiUser className="h-4 w-4" />
              <span>{profile.semester} Semester</span>
            </div>
          </div>
        </Card>

        {/* Details Form */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                <input
                  type="text"
                  disabled
                  value={profile.rollNumber || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  rows="3"
                  disabled={!isEditing}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={FiSave} disabled={updateMutation.isLoading} className="flex-1">
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>

      {/* Academic Info */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Academic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Department</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{profile.department}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Semester</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{profile.semester}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{profile.enrolledCourses || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">GPA</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{profile.gpa || 'N/A'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
