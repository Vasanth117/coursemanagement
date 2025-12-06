import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { InputField, PrimaryButton, ErrorMessage, SuccessMessage } from '../common';
import { FiLock } from 'react-icons/fi';
import { authAPI } from '../../api';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await authAPI.resetPassword({ token, password: formData.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({ general: error.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && <ErrorMessage message={errors.general} />}
      {success && (
        <SuccessMessage message="Password reset successful! Redirecting to login..." />
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
        <p className="text-sm text-gray-600 mt-2">Enter your new password</p>
      </div>

      <InputField
        label="New Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter new password"
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
        placeholder="Confirm new password"
        icon={FiLock}
        error={errors.confirmPassword}
        required
      />

      <PrimaryButton type="submit" loading={loading} fullWidth>
        Reset Password
      </PrimaryButton>
    </form>
  );
};

export default ResetPasswordForm;
