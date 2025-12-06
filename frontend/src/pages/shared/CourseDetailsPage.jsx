import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiBook, FiUsers, FiCalendar, FiUser } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button } from '../../components/common';
import axios from 'axios';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/courses/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition">
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="light" className="mb-3">{course?.courseCode}</Badge>
              <h1 className="text-4xl font-bold mb-2">{course?.title}</h1>
              <p className="text-blue-100 text-lg">{course?.department} • {course?.credits} Credits</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Semester</p>
              <p className="text-2xl font-bold">{course?.semester}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{course?.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{course?.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits</p>
                <p className="font-semibold text-gray-900">{course?.credits}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Students</p>
                <p className="font-semibold text-gray-900">{course?.maxStudents}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={course?.status === 'active' ? 'success' : 'warning'}>{course?.status}</Badge>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiUser className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="font-semibold text-gray-900">{course?.faculty?.name}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiUsers className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrollment</p>
                  <p className="font-semibold text-gray-900">{course?.enrolledStudents?.length || 0} / {course?.maxStudents}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FiCalendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Schedule</p>
                  <p className="font-semibold text-gray-900">{course?.schedule?.days?.join(', ')}</p>
                  <p className="text-sm text-gray-600">{course?.schedule?.time}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
