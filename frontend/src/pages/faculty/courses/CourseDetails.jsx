import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiEdit, FiUsers, FiFileText, FiCalendar, FiClock, FiMapPin, FiBook } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button, Tabs, ErrorMessage } from '../../../components/common';

const CourseDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => facultyAPI.getCourseById(id)
  });

  const { data: students } = useQuery({
    queryKey: ['courseStudents', id],
    queryFn: () => facultyAPI.getCourseStudents(id),
    enabled: !!id
  });

  const { data: assignments } = useQuery({
    queryKey: ['courseAssignments', id],
    queryFn: () => facultyAPI.getAssignmentsByCourse(id),
    enabled: !!id
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load course details" />;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: `Students (${students?.length || 0})` },
    { id: 'assignments', label: `Assignments (${assignments?.length || 0})` }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <Badge variant={course.status === 'active' ? 'success' : 'warning'}>{course.status}</Badge>
          </div>
          <p className="text-gray-600">{course.courseCode} • {course.department}</p>
        </div>
        <Link to={`/faculty/courses/${id}/edit`}>
          <Button variant="primary" icon={FiEdit}>Edit Course</Button>
        </Link>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-indigo-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiBook className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Credits</p>
              <p className="text-2xl font-bold text-gray-900">{course.credits}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiCalendar className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Semester</p>
              <p className="text-lg font-bold text-gray-900">{course.semester}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiCalendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Days</p>
                  <p className="text-sm text-gray-600">{course.schedule?.days?.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiClock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">{course.schedule?.time}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Room</p>
                  <p className="text-sm text-gray-600">{course.schedule?.room}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'students' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students?.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.rollNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/faculty/students/${student._id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments?.map((assignment) => (
            <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                <Badge variant={new Date(assignment.dueDate) > new Date() ? 'success' : 'danger'}>
                  {new Date(assignment.dueDate) > new Date() ? 'Active' : 'Overdue'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                <Link to={`/faculty/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                  View Details →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
