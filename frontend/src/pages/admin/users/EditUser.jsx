import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { Card, InputField, SelectField, PrimaryButton, SecondaryButton, LoadingSpinner } from '../../../components/common';
import { adminAPI } from '../../../api/admin';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => adminAPI.getUserById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        department: user.department || '',
        phone: user.phone || '',
        status: user.status || 'active'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateMutation = useMutation({
    mutationFn: (userData) => adminAPI.updateUser(id, userData),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries(['user', id]);
      queryClient.invalidateQueries(['admin-users']);
      navigate(`/admin/users/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading user data..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(`/admin/users/${id}`)} className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-2">Update user information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
        </Card>

        <Card title="Role & Department">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' },
                { value: 'admin', label: 'Admin' }
              ]}
            />
            <SelectField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={[
                { value: 'cse', label: 'Computer Science' },
                { value: 'ece', label: 'Electronics' },
                { value: 'eee', label: 'Electrical' },
                { value: 'me', label: 'Mechanical' }
              ]}
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <SecondaryButton type="button" onClick={() => navigate(`/admin/users/${id}`)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={updateMutation.isLoading}>
            <FiSave className="w-5 h-5 mr-2" />
            Save Changes
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
