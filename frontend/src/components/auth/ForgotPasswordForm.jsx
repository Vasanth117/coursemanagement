import React, { useState } from 'react';
import { InputField, PrimaryButton, SecondaryButton, ErrorMessage, SuccessMessage } from '../common';
import { FiMail } from 'react-icons/fi';
import { authAPI } from '../../api';

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}
      {success && (
        <SuccessMessage message="Password reset link sent to your email!" />
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Forgot Password?</h3>
        <p className="text-sm text-gray-600 mt-2">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <InputField
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        icon={FiMail}
        required
      />

      <div className="flex space-x-4">
        <PrimaryButton type="submit" loading={loading} fullWidth>
          Send Reset Link
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onBack} fullWidth>
          Back to Login
        </SecondaryButton>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
