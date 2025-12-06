import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiBook, FiUsers, FiFileText, FiEye, FiCalendar } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, EmptyState, Button, ProgressBar } from '../../../components/common';

const MyCourses = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['myEnrolledCourses'],
    queryFn: studentAPI.getEnrolledCourses
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Your enrolled courses and progress</p>
        </div>
        <Link to="/student/courses">
          <Button variant="primary" icon={FiBook}>Browse Courses</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiBook className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses?.reduce((sum, c) => sum + (c.credits || 0), 0) || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses?.filter(c => c.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiCalendar className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses?.filter(c => c.status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Courses List */}
      {courses?.length === 0 ? (
        <EmptyState
          icon={FiBook}
          title="No enrolled courses"
          description="Browse and enroll in courses to get started"
          action={<Link to="/student/courses"><Button variant="primary" icon={FiBook}>Browse Courses</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses?.map((course, index) => (
            <Card key={course._id} className="hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{course.courseCode} • {course.department}</p>
                </div>
                <Badge variant={course.status === 'active' ? 'success' : 'default'}>
                  {course.status}
                </Badge>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                  <span className="text-sm font-bold text-gray-900">{course.progress || 0}%</span>
                </div>
                <ProgressBar value={course.progress || 0} color="blue" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{course.credits}</p>
                  <p className="text-xs text-gray-600">Credits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{course.assignments || 0}</p>
                  <p className="text-xs text-gray-600">Assignments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{course.grade || 'N/A'}</p>
                  <p className="text-xs text-gray-600">Grade</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <FiCalendar className="h-4 w-4" />
                <span>{course.schedule?.days?.join(', ')} • {course.schedule?.time}</span>
              </div>

              <Link to={`/student/courses/${course._id}`}>
                <Button variant="primary" icon={FiEye} className="w-full">View Course</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
