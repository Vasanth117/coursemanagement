import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiBook, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../api/axiosConfig';

const StudentEnrollmentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Initialize WebSocket for real-time updates
  useWebSocket();

  const { data: enrollments, isLoading, refetch } = useQuery({
    queryKey: ['studentEnrollments', user?.id],
    queryFn: async () => {
      const response = await api.get(`/enrollments/student/${user.id}`);
      return response.data;
    },
    refetchInterval: 2000, // 2 seconds for real-time
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  if (isLoading) return <div>Loading...</div>;

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    const colors = {
      enrolled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      dropped: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiBook className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold">{enrollments?.statistics?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Current</p>
              <p className="text-2xl font-bold">{enrollments?.statistics?.current || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiCheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{enrollments?.statistics?.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiCalendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold">{enrollments?.statistics?.completionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">My Enrolled Courses</h3>
            <p className="text-sm text-gray-500">Real-time course enrollment tracking</p>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Auto-updating every 2s
          </div>
        </div>
        <div className="p-6">
          {enrollments?.enrollments?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No courses enrolled yet</p>
              <div className="flex items-center justify-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Waiting for enrollments...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments?.enrollments?.map((enrollment) => (
                <div key={enrollment._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center">
                        {enrollment.course?.title}
                        <span className="ml-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
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
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(enrollment.enrolledAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Enrolled On:</p>
                      <p className="font-medium">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>

                    {enrollment.status === 'completed' && enrollment.completedAt && (
                      <div>
                        <p className="text-gray-600">Completed On:</p>
                        <p className="font-medium">
                          {new Date(enrollment.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {enrollment.grade && (
                      <div>
                        <p className="text-gray-600">Final Grade:</p>
                        <p className="font-medium">{enrollment.grade}%</p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar (mock data - you can integrate with actual assignment completion) */}
                  {enrollment.status === 'enrolled' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Course Progress</span>
                        <span className="text-gray-600">
                          {Math.floor(Math.random() * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(Math.floor(Math.random() * 100))}`}
                          style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Duration: {Math.floor((new Date() - new Date(enrollment.enrolledAt)) / (1000 * 60 * 60 * 24))} days enrolled
                    </span>
                    <Link 
                      to={`/student/courses/${enrollment.course?._id}/learning`}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue Learning
                    </Link>
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