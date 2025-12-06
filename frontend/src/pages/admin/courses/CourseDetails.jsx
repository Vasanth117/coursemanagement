import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../api/admin';
import { FiArrowLeft, FiUsers, FiBook, FiCalendar } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button } from '../../../components/common';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ['adminCourse', id],
    queryFn: () => adminAPI.getCourseById(id)
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/admin/courses')} className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-gray-600 mt-1">{course?.courseCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-gray-900 mt-1">{course?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Department</p>
                <p className="text-gray-900 mt-1">{course?.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Credits</p>
                <p className="text-gray-900 mt-1">{course?.credits}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Semester</p>
                <p className="text-gray-900 mt-1">{course?.semester}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge variant={course?.status === 'active' ? 'success' : 'warning'}>{course?.status}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <FiUsers className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Enrollment</h3>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{course?.enrolledStudents?.length || 0}</p>
              <p className="text-sm text-gray-600 mt-1">out of {course?.maxStudents} students</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <FiBook className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Faculty</h3>
            </div>
            <p className="font-medium text-gray-900">{course?.faculty?.name}</p>
            <p className="text-sm text-gray-600">{course?.faculty?.email}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
