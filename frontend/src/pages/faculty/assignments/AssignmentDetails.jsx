import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiEdit, FiUsers, FiCheckCircle, FiClock, FiFileText, FiDownload } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button, ProgressBar } from '../../../components/common';

const AssignmentDetails = () => {
  const { id } = useParams();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => facultyAPI.getAssignmentById(id)
  });

  const { data: submissions } = useQuery({
    queryKey: ['assignmentSubmissions', id],
    queryFn: () => facultyAPI.getSubmissions(id),
    enabled: !!id
  });

  if (isLoading) return <LoadingSpinner />;

  const submissionRate = assignment?.totalStudents 
    ? ((submissions?.length || 0) / assignment.totalStudents * 100).toFixed(0)
    : 0;

  const gradingRate = submissions?.length
    ? ((submissions.filter(s => s.grade !== undefined).length / submissions.length) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <Badge variant={new Date(assignment.dueDate) > new Date() ? 'success' : 'danger'}>
              {new Date(assignment.dueDate) > new Date() ? 'Active' : 'Overdue'}
            </Badge>
          </div>
          <p className="text-gray-600">{assignment.course?.title}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/faculty/assignments/${id}/edit`}>
            <Button variant="secondary" icon={FiEdit}>Edit</Button>
          </Link>
          <Link to={`/faculty/assignments/${id}/submissions`}>
            <Button variant="primary" icon={FiCheckCircle}>Grade Submissions</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{assignment.totalStudents || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions?.filter(s => s.grade !== undefined).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiClock className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions?.filter(s => s.grade === undefined).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Submission Progress</h3>
          <ProgressBar value={submissionRate} color="blue" />
          <p className="text-sm text-gray-600 mt-2">{submissionRate}% of students submitted</p>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Grading Progress</h3>
          <ProgressBar value={gradingRate} color="green" />
          <p className="text-sm text-gray-600 mt-2">{gradingRate}% of submissions graded</p>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
          
          {assignment.attachments?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {assignment.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <FiDownload className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Date</p>
              <p className="text-base text-gray-900 mt-1">
                {new Date(assignment.dueDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Marks</p>
              <p className="text-base text-gray-900 mt-1">{assignment.totalMarks}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Created On</p>
              <p className="text-base text-gray-900 mt-1">
                {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
          <Link to={`/faculty/assignments/${id}/submissions`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions?.slice(0, 5).map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{submission.student?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={submission.grade !== undefined ? 'success' : 'warning'}>
                      {submission.grade !== undefined ? 'Graded' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {submission.grade !== undefined ? `${submission.grade}/${assignment.totalMarks}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
