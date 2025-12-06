import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../../api/admin';
import { FiUsers, FiTrendingUp } from 'react-icons/fi';
import { LoadingSpinner, Card } from '../../../components/common';
import { AnalyticsChart } from '../../../components/features/admin';

const UserAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: adminAPI.getUserAnalytics
  });

  if (isLoading) return <LoadingSpinner />;

  const userGrowthData = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 180 },
    { label: 'Apr', value: 220 },
    { label: 'May', value: 280 },
    { label: 'Jun', value: 350 }
  ];

  const roleDistribution = [
    { label: 'Students', value: analytics?.students || 892 },
    { label: 'Faculty', value: analytics?.faculty || 156 },
    { label: 'Admins', value: analytics?.admins || 12 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.total || 1060}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.active || 987}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.newThisMonth || 45}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart data={userGrowthData} title="User Growth" type="line" />
        <AnalyticsChart data={roleDistribution} title="Role Distribution" type="bar" />
      </div>
    </div>
  );
};

export default UserAnalytics;
