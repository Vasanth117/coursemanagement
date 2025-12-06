import React from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../components/layout';
import EnhancedLoginPage from '../pages/auth/EnhancedLoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

export const PublicRoutes = () => (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<EnhancedLoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Route>
);
