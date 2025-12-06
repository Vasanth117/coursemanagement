import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiDownload, FiEye, FiCheckCircle, FiClock } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button, EmptyState } from '../../../components/common';

const Submissions = () => {
  const { id } = useParams();
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => facultyAPI.getAssignmentById(id)
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['assignmentSubmissions', id],
    queryFn: () => facultyAPI.getSubmissions(id)
  });

  const filteredSubmissions = submissions?.filter(submission => {
    if (filterStatus === 'graded') return submission.grade !== undefined;
    if (filterStatus === 'pending') return submission.grade === undefined;
    return true;
  });

  if (assignmentLoading || submissionsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600 mt-1">{assignment.title}</p>
        </div>
        <Link to={`/faculty/assignments/${id}`}>
          <Button variant="secondary">Back to Assignment</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
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

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Grading</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions?.length === 0 ? (
        <EmptyState
          icon={FiCheckCircle}
          title="No submissions found"
          description="No submissions match the selected filter"
        />
      ) : (
        <div className="space-y-4">
          {filteredSubmissions?.map((submission, index) => (
            <Card key={submission._id} className="hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{submission.student?.name}</h3>
                      <p className="text-sm text-gray-600">{submission.student?.email}</p>
                    </div>
                    <Badge variant={submission.grade !== undefined ? 'success' : 'warning'}>
                      {submission.grade !== undefined ? 'Graded' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">
                        {new Date(submission.submittedAt) > new Date(assignment.dueDate) ? (
                          <span className="text-red-600">Late</span>
                        ) : (
                          <span className="text-green-600">On Time</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Grade</p>
                      <p className="font-medium text-gray-900">
                        {submission.grade !== undefined 
                          ? `${submission.grade}/${assignment.totalMarks}`
                          : 'Not graded'
                        }
                      </p>
                    </div>
                  </div>

                  {submission.files?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <FiDownload className="h-4 w-4" />
                            <span>{file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/faculty/assignments/${id}/grade/${submission._id}`}>
                    <Button variant="primary" icon={submission.grade !== undefined ? FiEye : FiCheckCircle}>
                      {submission.grade !== undefined ? 'View Grade' : 'Grade Now'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
