import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiTrendingUp, FiClock, FiCheck } from 'react-icons/fi';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../api/axiosConfig';

const EnrollmentDashboard = ({ userRole }) => {
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds for real-time
  
  // Initialize WebSocket for real-time updates
  useWebSocket();

  const { data: enrollmentStats, isLoading } = useQuery({
    queryKey: ['enrollmentStats'],
    queryFn: async () => {
      const response = await api.get('/enrollments/stats');
      return response.data;
    },
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true
  });

  const { data: recentEnrollments } = useQuery({
    queryKey: ['recentEnrollments'],
    queryFn: async () => {
      const response = await api.get('/enrollments?limit=10&sort=-enrolledAt');
      return response.data;
    },
    refetchInterval: refreshInterval
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiUsers className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold">{enrollmentStats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">{enrollmentStats?.enrolled || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{enrollmentStats?.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiTrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold">{enrollmentStats?.today || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Enrollments</h3>
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Student</th>
                <th className="text-left py-2">Course</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentEnrollments?.data?.map((enrollment) => (
                <tr key={enrollment._id} className="border-b">
                  <td className="py-2">{enrollment.student?.name}</td>
                  <td className="py-2">{enrollment.course?.title}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-500">
                    {new Date(enrollment.enrolledAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDashboard;