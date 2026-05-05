import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FiUsers, FiBook, FiClock } from 'react-icons/fi';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../api/axiosConfig';

const FacultyEnrollmentDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  useWebSocket();

  const { data: coursesData } = useQuery({
    queryKey: ['facultyCourses', user?.id],
    queryFn: async () => {
      const res = await api.get(`/courses?faculty=${user.id}`);
      return res;
    },
    enabled: !!user?.id,
    refetchInterval: 3000
  });

  const { data: enrollmentData } = useQuery({
    queryKey: ['facultyEnrollments', user?.id],
    queryFn: async () => {
      const res = await api.get(`/enrollments?faculty=${user.id}&sort=-enrolledAt&limit=50`);
      return res;
    },
    enabled: !!user?.id,
    refetchInterval: 3000,
    refetchOnWindowFocus: true
  });

  const courses = coursesData?.data || [];
  const enrollments = enrollmentData?.data || [];
  const total = enrollmentData?.count || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = enrollments.filter(e => new Date(e.enrolledAt) >= today).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiBook className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">My Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiUsers className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Today's Enrollments</p>
              <p className="text-2xl font-bold">{todayCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Student Enrollments</h3>
            <p className="text-sm text-gray-500">Real-time updates every 3 seconds</p>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live
          </div>
        </div>

        <div className="p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No enrollments yet</p>
              <div className="flex items-center justify-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Watching for new enrollments...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{enrollment.student?.name}</h4>
                      <p className="text-sm text-gray-600">{enrollment.student?.email} • {enrollment.student?.studentId}</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        {enrollment.course?.title} ({enrollment.course?.code})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleTimeString()}
                      </p>
                    </div>
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

export default FacultyEnrollmentDashboard;
