import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/slices/authSlice';
import { InputField, PrimaryButton, ErrorMessage } from '../common';
import { FiMail, FiLock } from 'react-icons/fi';

const LoginForm = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await dispatch(loginUser({ ...formData, role })).unwrap();
      navigate(`/${role}/dashboard`);
    } catch (error) {
      setErrors({ general: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && <ErrorMessage message={errors.general} />}

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
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        icon={FiLock}
        error={errors.password}
        required
      />

      <PrimaryButton type="submit" loading={loading} fullWidth>
        Sign In
      </PrimaryButton>
    </form>
  );
};

export default LoginForm;
