import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { Card, InputField, SelectField, PrimaryButton, SecondaryButton, Checkbox } from '../../../components/common';
import { adminAPI } from '../../../api/admin';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    phone: '',
    sendWelcomeEmail: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const createMutation = useMutation({
    mutationFn: (userData) => adminAPI.createUser(userData),
    onSuccess: () => {
      toast.success('User created successfully');
      navigate('/admin/users');
    },
    onError: (error) => {
      setErrors({ general: error.response?.data?.message || 'Failed to create user' });
      toast.error('Failed to create user');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/admin/users')} className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-2">Add a new user to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
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
              required
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
                { value: 'me', label: 'Mechanical' },
                { value: 'ce', label: 'Civil' }
              ]}
              required
            />
          </div>
        </Card>

        <Card title="Additional Options">
          <Checkbox
            label="Send welcome email to user"
            name="sendWelcomeEmail"
            checked={formData.sendWelcomeEmail}
            onChange={handleChange}
          />
        </Card>

        <div className="flex justify-end space-x-4">
          <SecondaryButton type="button" onClick={() => navigate('/admin/users')}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={createMutation.isLoading}>
            <FiSave className="w-5 h-5 mr-2" />
            Create User
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
