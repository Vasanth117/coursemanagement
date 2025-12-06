import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiUpload, FiX } from 'react-icons/fi';
import { LoadingSpinner, Card, Button } from '../../../components/common';
import { toast } from 'react-hot-toast';

const SubmitAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState('');

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignmentDetails', id],
    queryFn: () => studentAPI.getAssignmentDetails(id)
  });

  const submitMutation = useMutation({
    mutationFn: (formData) => studentAPI.submitAssignment(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignmentDetails', id]);
      queryClient.invalidateQueries(['studentAssignments']);
      toast.success('Assignment submitted successfully!');
      navigate(`/student/assignments/${id}`);
    },
    onError: () => toast.error('Failed to submit assignment')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('comments', comments);
    submitMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Assignment</h1>
        <p className="text-gray-600 mt-1">{assignment.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Files</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium text-lg">Choose files to upload</span>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="hidden"
                accept=".pdf,.doc,.docx,.zip"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX, ZIP up to 10MB each</p>
            {files.length > 0 && (
              <div className="mt-4 text-left bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Selected files ({files.length}):</p>
                {files.map((file, index) => (
                  <p key={index} className="text-sm text-gray-700">• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comments (Optional)</h2>
          <textarea
            rows="6"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments about your submission..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="secondary" icon={FiX} onClick={() => navigate(`/student/assignments/${id}`)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={FiUpload} disabled={submitMutation.isLoading} className="flex-1">
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitAssignment;
