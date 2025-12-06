import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiPlus, FiSearch, FiBook, FiUsers, FiEdit, FiEye } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, EmptyState, ErrorMessage, Button } from '../../../components/common';

const CoursesIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyAPI.getCourses
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load courses" />;

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage your courses and content</p>
        </div>
        <Link to="/faculty/courses/create">
          <Button variant="primary" icon={FiPlus}>Create Course</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses?.length === 0 ? (
        <EmptyState
          icon={FiBook}
          title="No courses found"
          description="Create your first course to get started"
          action={<Link to="/faculty/courses/create"><Button variant="primary" icon={FiPlus}>Create Course</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course, index) => (
            <Card key={course._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex justify-between items-start mb-4">
                <Badge variant={course.status === 'active' ? 'success' : course.status === 'pending' ? 'warning' : 'default'}>
                  {course.status}
                </Badge>
                <span className="text-sm font-semibold text-blue-600">{course.courseCode}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <FiUsers className="h-4 w-4" />
                  <span>{course.enrolledStudents || 0} students</span>
                </div>
                <span className="font-medium">{course.credits} Credits</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Link to={`/faculty/courses/${course._id}`} className="flex-1">
                  <Button variant="secondary" icon={FiEye} className="w-full">View</Button>
                </Link>
                <Link to={`/faculty/courses/${course._id}/edit`} className="flex-1">
                  <Button variant="primary" icon={FiEdit} className="w-full">Edit</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesIndex;
