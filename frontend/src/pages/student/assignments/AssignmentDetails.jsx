import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiDownload, FiUpload, FiClock, FiCheckCircle } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button } from '../../../components/common';

const AssignmentDetails = () => {
  const { id } = useParams();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignmentDetails', id],
    queryFn: () => studentAPI.getAssignmentDetails(id)
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <Badge variant={assignment.submitted ? 'success' : new Date(assignment.dueDate) > new Date() ? 'warning' : 'danger'}>
              {assignment.submitted ? 'Submitted' : new Date(assignment.dueDate) > new Date() ? 'Pending' : 'Overdue'}
            </Badge>
          </div>
          <p className="text-gray-600">{assignment.course?.title}</p>
        </div>
        {!assignment.submitted && (
          <Link to={`/student/assignments/${id}/submit`}>
            <Button variant="primary" icon={FiUpload}>Submit Assignment</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>

          {assignment.attachments?.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {assignment.attachments.map((file, idx) => (
                  <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <FiDownload className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <div className="flex items-center space-x-2 mt-1">
                  <FiClock className="h-4 w-4 text-gray-500" />
                  <p className="text-base text-gray-900">{new Date(assignment.dueDate).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{assignment.totalMarks}</p>
              </div>
              {assignment.grade !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Grade</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{assignment.grade}/{assignment.totalMarks}</p>
                </div>
              )}
            </div>
          </Card>

          {assignment.submitted && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Status</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-green-600">
                  <FiCheckCircle className="h-5 w-5" />
                  <span className="font-medium">Submitted</span>
                </div>
                <p className="text-sm text-gray-600">Submitted on: {new Date(assignment.submittedAt).toLocaleString()}</p>
                {assignment.feedback && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 mb-2">Feedback:</p>
                    <p className="text-sm text-gray-700">{assignment.feedback}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
