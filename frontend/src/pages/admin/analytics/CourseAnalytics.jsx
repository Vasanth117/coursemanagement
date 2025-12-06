import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../../api/admin';
import { FiBook, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { LoadingSpinner, Card } from '../../../components/common';
import { AnalyticsChart } from '../../../components/features/admin';

const CourseAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['courseAnalytics'],
    queryFn: adminAPI.getCourseAnalytics
  });

  if (isLoading) return <LoadingSpinner />;

  const enrollmentData = [
    { label: 'CSE', value: 320 },
    { label: 'ECE', value: 280 },
    { label: 'EEE', value: 240 },
    { label: 'MECH', value: 200 },
    { label: 'CIVIL', value: 180 }
  ];

  const courseStatusData = [
    { label: 'Active', value: analytics?.active || 87 },
    { label: 'Pending', value: analytics?.pending || 12 },
    { label: 'Archived', value: analytics?.archived || 45 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">Course Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiBook className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.total || 144}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.enrollments || 1220}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Enrollment</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.avgEnrollment || 42}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart data={enrollmentData} title="Enrollment by Department" type="bar" />
        <AnalyticsChart data={courseStatusData} title="Course Status" type="bar" />
      </div>
    </div>
  );
};

export default CourseAnalytics;
