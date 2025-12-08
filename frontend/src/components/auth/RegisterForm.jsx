import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/slices/authSlice';
import { authAPI } from '../../api/auth';
import { InputField, SelectField, PrimaryButton, SecondaryButton, ErrorMessage, SuccessMessage } from '../common';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';

const RegisterForm = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await authAPI.register({ ...formData, role });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMsg = error?.error || error?.message || error?.response?.data?.error || 'Registration failed';
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && <ErrorMessage message={errors.general} />}
      {success && <SuccessMessage message="Registration successful! Redirecting..." />}

      <InputField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your full name"
        icon={FiUser}
        error={errors.name}
        required
      />

      <InputField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={`Enter your ${role} email`}
        icon={FiMail}
        error={errors.email}
        required
      />

      <InputField
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Enter your phone number"
        icon={FiPhone}
        error={errors.phone}
      />

      {(role === 'faculty' || role === 'student') && (
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
          error={errors.department}
          required
        />
      )}

      <InputField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Create a password"
        icon={FiLock}
        error={errors.password}
        required
      />

      <InputField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
        icon={FiLock}
        error={errors.confirmPassword}
        required
      />

      <div className="flex space-x-4 pt-2">
        <PrimaryButton type="submit" loading={loading} fullWidth>
          Register
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => navigate('/login')} fullWidth>
          Back to Login
        </SecondaryButton>
      </div>
    </form>
  );
};

export default RegisterForm;
