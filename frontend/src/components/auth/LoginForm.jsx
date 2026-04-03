import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/slices/authSlice';
import { InputField, PrimaryButton, ErrorMessage } from '../common';
import { FiMail, FiLock } from 'react-icons/fi';
import GoogleLoginButton from './GoogleLoginButton';

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

    console.log('Login attempt:', { email: formData.email, role });

    // Test direct API call
    try {
      const testResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: role
        })
      });
      const testData = await testResponse.text();
      console.log('Direct API test - Status:', testResponse.status);
      console.log('Direct API test - Response:', testData);
    } catch (testError) {
      console.log('Direct API test failed:', testError);
    }

    try {
      // Direct login without Redux
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: role
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Direct login success:', data);
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Navigating to:', `/${role}/dashboard`);
        
        // Force page reload to update auth state
        window.location.href = `/${role}/dashboard`;
        return;
      }
      
      const result = await dispatch(loginUser({ ...formData, role })).unwrap();
      console.log('Login success:', result);
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      const message = error?.message || error?.response?.data?.message || error || 'Login failed';
      setErrors({ general: message });
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
      
      {/* <GoogleLoginButton role={role} /> */}
    </form>
  );
};

export default LoginForm;
