import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiBook, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { Card, SelectField, Tabs, LoadingSpinner } from '../../../components/common';
import { adminAPI } from '../../../api/admin';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');

  // Fetch analytics data based on active tab
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics', activeTab, timeRange],
    queryFn: () => {
      switch(activeTab) {
        case 'users':
          return adminAPI.getUserAnalytics({ timeRange });
        case 'courses':
          return adminAPI.getCourseAnalytics({ timeRange });
        case 'system':
          return adminAPI.getSystemAnalytics({ timeRange });
        default:
          return adminAPI.getSystemAnalytics({ timeRange });
      }
    },
  });

  const stats = data?.stats || { totalUsers: 0, activeCourses: 0, engagementRate: 0, growthRate: 0 };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading analytics..." />;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'courses', label: 'Courses' },
    { id: 'system', label: 'System' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor system performance and user activity</p>
        </div>
        <SelectField
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={[
            { value: 'week', label: 'Last Week' },
            { value: 'month', label: 'Last Month' },
            { value: 'quarter', label: 'Last Quarter' },
            { value: 'year', label: 'Last Year' }
          ]}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers || 1245}</p>
              <p className="text-sm mt-2 opacity-75">↑ 12% from last month</p>
            </div>
            <FiUsers className="w-12 h-12 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Courses</p>
              <p className="text-3xl font-bold mt-2">{stats.activeCourses || 45}</p>
              <p className="text-sm mt-2 opacity-75">↑ 8% from last month</p>
            </div>
            <FiBook className="w-12 h-12 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Engagement Rate</p>
              <p className="text-3xl font-bold mt-2">{stats.engagementRate || 87}%</p>
              <p className="text-sm mt-2 opacity-75">↑ 5% from last month</p>
            </div>
            <FiActivity className="w-12 h-12 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Growth Rate</p>
              <p className="text-3xl font-bold mt-2">+{stats.growthRate || 15}%</p>
              <p className="text-sm mt-2 opacity-75">↑ 3% from last month</p>
            </div>
            <FiTrendingUp className="w-12 h-12 opacity-50" />
          </div>
        </Card>
      </div>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">User Growth Chart</p>
              </div>
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Course Enrollment Chart</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">New Users</p>
                  <p className="text-2xl font-bold text-blue-800 mt-2">156</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-green-800 mt-2">1,089</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">Inactive Users</p>
                  <p className="text-2xl font-bold text-red-800 mt-2">156</p>
                </div>
              </div>
              <Link to="/admin/analytics/users" className="text-blue-600 hover:text-blue-800 font-medium">
                View Detailed User Analytics →
              </Link>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-purple-800 mt-2">45</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-800 mt-2">38</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800 mt-2">7</p>
                </div>
              </div>
              <Link to="/admin/analytics/courses" className="text-blue-600 hover:text-blue-800 font-medium">
                View Detailed Course Analytics →
              </Link>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">System Health</p>
                  <p className="text-2xl font-bold text-green-800 mt-2">98%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Uptime</p>
                  <p className="text-2xl font-bold text-blue-800 mt-2">99.9%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">Response Time</p>
                  <p className="text-2xl font-bold text-purple-800 mt-2">120ms</p>
                </div>
              </div>
              <Link to="/admin/analytics/system" className="text-blue-600 hover:text-blue-800 font-medium">
                View Detailed System Analytics →
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
