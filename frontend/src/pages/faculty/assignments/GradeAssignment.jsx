import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiSave, FiX, FiDownload, FiUser } from 'react-icons/fi';
import { LoadingSpinner, Card, Button, Badge } from '../../../components/common';
import { toast } from 'react-hot-toast';

const GradeAssignment = () => {
  const { id, submissionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => facultyAPI.getAssignmentById(id)
  });

  const { data: submission, isLoading: submissionLoading } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => facultyAPI.getSubmissionById(submissionId)
  });

  React.useEffect(() => {
    if (submission) {
      setGrade(submission.grade || '');
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  const gradeMutation = useMutation({
    mutationFn: (data) => facultyAPI.gradeSubmission(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['submission', submissionId]);
      queryClient.invalidateQueries(['assignmentSubmissions', id]);
      toast.success('Grade submitted successfully');
      navigate(`/faculty/assignments/${id}/submissions`);
    },
    onError: () => toast.error('Failed to submit grade')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(grade) > assignment.totalMarks) {
      toast.error(`Grade cannot exceed ${assignment.totalMarks}`);
      return;
    }
    gradeMutation.mutate({ grade: parseFloat(grade), feedback });
  };

  if (assignmentLoading || submissionLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
          <p className="text-gray-600 mt-1">{assignment.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student & Submission Info */}
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Student Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{submission.student?.name}</p>
                <p className="text-sm text-gray-600">{submission.student?.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted On</p>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="mt-1">
                  <Badge variant={new Date(submission.submittedAt) <= new Date(assignment.dueDate) ? 'success' : 'danger'}>
                    {new Date(submission.submittedAt) <= new Date(assignment.dueDate) ? 'On Time' : 'Late'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{assignment.totalMarks}</p>
              </div>

              {submission.grade !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Grade</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {submission.grade}/{assignment.totalMarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Submission Content & Grading */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submitted Files */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Files</h2>
            {submission.files?.length > 0 ? (
              <div className="space-y-3">
                {submission.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FiDownload className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Download</Button>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No files submitted</p>
            )}
          </Card>

          {/* Submission Text */}
          {submission.text && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Text</h2>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.text}</p>
              </div>
            </Card>
          )}

          {/* Grading Form */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Grade Submission</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (out of {assignment.totalMarks}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={assignment.totalMarks}
                  step="0.5"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter grade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  rows="6"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  icon={FiX}
                  onClick={() => navigate(`/faculty/assignments/${id}/submissions`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={FiSave}
                  disabled={gradeMutation.isLoading}
                >
                  {gradeMutation.isLoading ? 'Saving...' : 'Submit Grade'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GradeAssignment;
