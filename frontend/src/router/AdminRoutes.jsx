import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth';
import { DashboardLayout } from '../components/layout';
import { UsersManagement, CreateUser, EditUser, UserDetails, CoursesManagement, Analytics, Settings, Reports } from '../pages/admin';
import AdminDashboard from '../pages/admin/Dashboard';

export const AdminRoutes = () => (
  <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UsersManagement />} />
    <Route path="/admin/users/create" element={<CreateUser />} />
    <Route path="/admin/users/:id" element={<UserDetails />} />
    <Route path="/admin/users/:id/edit" element={<EditUser />} />
    <Route path="/admin/courses" element={<CoursesManagement />} />
    <Route path="/admin/analytics" element={<Analytics />} />
    <Route path="/admin/settings" element={<Settings />} />
    <Route path="/admin/reports" element={<Reports />} />
  </Route>
);
