// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

  const stats = [
    { label: 'Total Users', value: '1,234', icon: UserGroupIcon, color: 'blue', change: '+45', percentage: '+12%' },
    { label: 'Active Courses', value: '87', icon: BookOpenIcon, color: 'green', change: '+8', percentage: '+10%' },
    { label: 'Faculty Members', value: '156', icon: AcademicCapIcon, color: 'purple', change: '+12', percentage: '+8%' },
    { label: 'System Health', value: '98%', icon: ShieldCheckIcon, color: 'emerald', change: '+2%', percentage: 'Excellent' }
  ];

  const recentActivities = [
    { action: 'New user registered', user: 'Rahul Kumar', role: 'Student', time: '5 minutes ago', type: 'user' },
    { action: 'Course created', user: 'Dr. Sharma', role: 'Faculty', time: '1 hour ago', type: 'course' },
    { action: 'Assignment submitted', user: 'Priya Patel', role: 'Student', time: '2 hours ago', type: 'assignment' },
    { action: 'Grade updated', user: 'Prof. Kumar', role: 'Faculty', time: '3 hours ago', type: 'grade' }
  ];

  const systemMetrics = [
    { label: 'Server Uptime', value: '99.9%', status: 'excellent' },
    { label: 'API Response Time', value: '45ms', status: 'good' },
    { label: 'Database Load', value: '23%', status: 'excellent' },
    { label: 'Active Sessions', value: '342', status: 'good' }
  ];

  const userDistribution = [
    { role: 'Students', count: 892, percentage: 72, color: 'blue' },
    { role: 'Faculty', count: 156, percentage: 13, color: 'green' },
    { role: 'Admin', count: 12, percentage: 1, color: 'purple' },
    { role: 'Staff', count: 174, percentage: 14, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/images/sece-logo.png" alt="SECE" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-600">Sri Eshwar College of Engineering</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <Link to="/admin/settings" className="p-2 text-gray-600 hover:text-blue-600 transition">
                <Cog6ToothIcon className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-600">System Administrator</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            System Overview 🎯
          </h2>
          <p className="text-gray-600">Monitor and manage the entire course management system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-600">{stat.percentage}</span>
                  <div className="flex items-center text-green-600 text-sm font-semibold">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
              <Link to="/admin/activities" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'course' ? 'bg-green-100' :
                      activity.type === 'assignment' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'user' && <UserGroupIcon className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'course' && <BookOpenIcon className="h-5 w-5 text-green-600" />}
                      {activity.type === 'assignment' && <ChartBarIcon className="h-5 w-5 text-orange-600" />}
                      {activity.type === 'grade' && <AcademicCapIcon className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{activity.action}</h4>
                      <p className="text-xs text-gray-600">{activity.user} • {activity.role}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">User Distribution</h3>
            <div className="space-y-4">
              {userDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{item.role}</span>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${item.color}-600 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">System Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/users" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center group">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-semibold text-gray-900">Manage Users</p>
            </Link>
            <Link to="/admin/courses" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-center group">
              <BookOpenIcon className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-semibold text-gray-900">Manage Courses</p>
            </Link>
            <Link to="/admin/reports" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center group">
              <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-semibold text-gray-900">Reports</p>
            </Link>
            <Link to="/admin/settings" className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition text-center group">
              <Cog6ToothIcon className="h-8 w-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-semibold text-gray-900">Settings</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
