import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FiUsers, FiBook, FiClock } from 'react-icons/fi';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../api/axiosConfig';
import { facultyAPI } from '../../api/faculty';

const FacultyEnrollmentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Initialize WebSocket for real-time updates
  useWebSocket();

  const { data: courses } = useQuery({
    queryKey: ['facultyCourses', user?.id],
    queryFn: () => facultyAPI.getCourses(),
    refetchInterval: 5000
  });

  const { data: courseEnrollments } = useQuery({
    queryKey: ['facultyEnrollments', user?.id],
    queryFn: async () => {
      const response = await api.get(`/faculty/${user.id}/enrollments`);
      return response.data;
    },
    refetchInterval: 5000
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiBook className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">My Courses</p>
              <p className="text-2xl font-bold">{courses?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiUsers className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold">{courseEnrollments?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Today's Enrollments</p>
              <p className="text-2xl font-bold">{courseEnrollments?.today || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Enrollments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Recent Student Enrollments</h3>
          <p className="text-sm text-gray-500">Real-time updates when students enroll in your courses</p>
        </div>
        <div className="p-6">
          {courseEnrollments?.enrollments?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No enrollments yet</p>
          ) : (
            <div className="space-y-4">
              {courseEnrollments?.enrollments?.map((enrollment) => (
                <div key={enrollment._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {enrollment.student?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {enrollment.student?.email} • {enrollment.student?.studentId}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
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
                        {new Date(enrollment.enrolledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Enrolled {Math.floor((new Date() - new Date(enrollment.enrolledAt)) / (1000 * 60))} minutes ago
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