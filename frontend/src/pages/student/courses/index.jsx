import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiSearch, FiBook, FiUsers, FiEye, FiPlus } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, EmptyState, Button } from '../../../components/common';

const CoursesIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['availableCourses'],
    queryFn: studentAPI.getAvailableCourses
  });

  const courses = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.courses && Array.isArray(data.courses)) return data.courses;
    return [];
  }, [data]);

  const filteredCourses = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];
    return courses.filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === 'all' || course.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [courses, searchTerm, departmentFilter]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
          <p className="text-gray-600 mt-1">Explore and enroll in available courses</p>
        </div>
        <Link to="/student/courses/my-courses">
          <Button variant="primary" icon={FiBook}>My Courses</Button>
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
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="EEE">Electrical</option>
            <option value="MECH">Mechanical</option>
            <option value="CIVIL">Civil</option>
          </select>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={FiBook}
          title="No courses found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <Card key={course._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex justify-between items-start mb-4">
                <Badge variant="primary">{course.courseCode}</Badge>
                <span className="text-sm font-semibold text-blue-600">{course.credits} Credits</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <FiUsers className="h-4 w-4" />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
                <span className="font-medium">{course.department}</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Link to={`/student/courses/${course._id}`} className="flex-1">
                  <Button variant="secondary" icon={FiEye} className="w-full">View Details</Button>
                </Link>
                <Link to={`/student/courses/${course._id}/enroll`} className="flex-1">
                  <Button variant="primary" icon={FiPlus} className="w-full">Enroll</Button>
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
