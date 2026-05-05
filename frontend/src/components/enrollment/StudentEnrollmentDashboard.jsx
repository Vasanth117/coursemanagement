import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FiBook, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../api/axiosConfig';

const StudentEnrollmentDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  useWebSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['studentEnrollments', user?.id],
    queryFn: async () => {
      const res = await api.get(`/enrollments/student/${user.id}`);
      return res;
    },
    enabled: !!user?.id,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const enrollments = data?.data?.enrollments || [];
  const statistics = data?.data?.statistics || {};

  const getStatusBadge = (status) => {
    const colors = {
      enrolled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      dropped: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></span>
      <span className="text-gray-600">Loading your courses...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiBook className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold">{statistics.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Current</p>
              <p className="text-2xl font-bold">{statistics.current || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiCheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{statistics.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiCalendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold">{statistics.completionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">My Enrolled Courses</h3>
            <p className="text-sm text-gray-500">Updates every 3 seconds</p>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live
          </div>
        </div>

        <div className="p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No courses enrolled yet</p>
              <div className="flex items-center justify-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Watching for new enrollments...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {enrollment.course?.title}
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                      </h4>
                      <p className="text-sm text-gray-600">
                        {enrollment.course?.code} • {enrollment.course?.credits} Credits
                      </p>
                      <p className="text-xs text-gray-500">
                        Faculty: {enrollment.course?.faculty?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                    <div>
                      <p className="text-gray-500">Enrolled Date</p>
                      <p className="font-medium">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Enrolled Time</p>
                      <p className="font-medium">{new Date(enrollment.enrolledAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days Enrolled</p>
                      <p className="font-medium">
                        {Math.floor((new Date() - new Date(enrollment.enrolledAt)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                    {enrollment.status === 'completed' && enrollment.completedAt && (
                      <div>
                        <p className="text-gray-500">Completed On</p>
                        <p className="font-medium">{new Date(enrollment.completedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {enrollment.grade && (
                      <div>
                        <p className="text-gray-500">Final Grade</p>
                        <p className="font-medium text-green-600">{enrollment.grade}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollmentDashboard;
