import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiSearch, FiUsers, FiMail, FiEye } from 'react-icons/fi';
import { LoadingSpinner, Card, Avatar, EmptyState, Button } from '../../../components/common';

const StudentsIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const { data: students, isLoading } = useQuery({
    queryKey: ['facultyStudents'],
    queryFn: facultyAPI.getStudents
  });

  const { data: courses } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyAPI.getCourses
  });

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || student.courses?.includes(courseFilter);
    return matchesSearch && matchesCourse;
  }) : [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">View and manage enrolled students</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(students) ? students.length : 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-indigo-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{(courses || []).length}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg per Course</p>
              <p className="text-2xl font-bold text-gray-900">
                {(courses || []).length ? Math.round((students || []).length / (courses || []).length) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {Array.isArray(courses) ? courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.title}
              </option>
            )) : []}
          </select>
        </div>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No students found"
          description="No students match your search criteria"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Avatar name={student.name} size="md" />
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.rollNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiMail className="h-4 w-4" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.enrolledCourses?.length || 0} courses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/faculty/students/${student._id}`}>
                        <Button variant="secondary" size="sm" icon={FiEye}>View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentsIndex;
