import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiMail, FiPhone, FiBook, FiFileText, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { LoadingSpinner, Card, Avatar, Badge, Tabs, ProgressBar } from '../../../components/common';

const StudentDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => facultyAPI.getStudentById(id)
  });

  const { data: performance } = useQuery({
    queryKey: ['studentPerformance', id],
    queryFn: () => facultyAPI.getStudentPerformance(id),
    enabled: !!id
  });

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'attendance', label: 'Attendance' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar name={student.name} size="xl" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-600 mt-1">{student.email}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <Badge variant="primary">{student.rollNumber}</Badge>
              <Badge variant="success">{student.department}</Badge>
              <Badge variant="default">{student.semester} Semester</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiBook className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{student.enrolledCourses?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{performance?.averageGrade || 'N/A'}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{performance?.totalAssignments || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiCalendar className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{performance?.attendanceRate || 0}%</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-6">Academic Performance</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-gray-900">{performance?.overallProgress || 0}%</span>
                </div>
                <ProgressBar value={performance?.overallProgress || 0} color="blue" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Assignment Completion</span>
                  <span className="text-sm font-bold text-gray-900">{performance?.assignmentCompletion || 0}%</span>
                </div>
                <ProgressBar value={performance?.assignmentCompletion || 0} color="green" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                  <span className="text-sm font-bold text-gray-900">{performance?.attendanceRate || 0}%</span>
                </div>
                <ProgressBar value={performance?.attendanceRate || 0} color="purple" />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiMail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiPhone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{student.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiBook className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">{student.department}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {student.enrolledCourses?.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.courseCode}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Grade: {course.grade || 'Pending'}</span>
                <Badge variant="success">{course.credits} Credits</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performance?.assignments?.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{assignment.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{assignment.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'Not submitted'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.grade ? `${assignment.grade}/${assignment.totalMarks}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={assignment.grade ? 'success' : 'warning'}>
                        {assignment.grade ? 'Graded' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Attendance Records</h2>
          <div className="space-y-4">
            {performance?.attendance?.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{record.course}</p>
                  <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                </div>
                <Badge variant={record.status === 'present' ? 'success' : 'danger'}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentDetails;
