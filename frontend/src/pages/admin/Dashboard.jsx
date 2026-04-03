// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EnrollmentDashboard from '../../components/enrollment/EnrollmentDashboard';
import {
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-600">Real-time Enrollment Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnrollmentDashboard userRole="admin" />
      </main>
    </div>
  );
};

export default AdminDashboard;
