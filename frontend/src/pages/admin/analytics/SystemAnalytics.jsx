import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../../api/admin';
import { LoadingSpinner } from '../../../components/common';
import { SystemStats, AnalyticsChart } from '../../../components/features/admin';

const SystemAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['systemAnalytics'],
    queryFn: adminAPI.getSystemAnalytics
  });

  if (isLoading) return <LoadingSpinner />;

  const activityData = [
    { label: 'Mon', value: 450 },
    { label: 'Tue', value: 520 },
    { label: 'Wed', value: 480 },
    { label: 'Thu', value: 590 },
    { label: 'Fri', value: 610 },
    { label: 'Sat', value: 320 },
    { label: 'Sun', value: 280 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
      
      <SystemStats stats={analytics} />
      
      <AnalyticsChart data={activityData} title="Weekly Activity" type="line" />
    </div>
  );
};

export default SystemAnalytics;
