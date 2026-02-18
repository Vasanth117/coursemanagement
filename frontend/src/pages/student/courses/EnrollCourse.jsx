import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiCheck, FiX } from 'react-icons/fi';
import { LoadingSpinner, Card, Button } from '../../../components/common';
import { toast } from 'react-hot-toast';

const EnrollCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['coursePreview', id],
    queryFn: () => studentAPI.getCoursePreview(id)
  });

  const course = data?.data || data;

  const enrollMutation = useMutation({
    mutationFn: () => studentAPI.enrollCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEnrolledCourses']);
      toast.success('Successfully enrolled in course!');
      navigate('/student/courses/my-courses');
    },
    onError: (error) => {
      console.error('Enrollment error:', error);
      const message = error?.message || error?.response?.data?.message || 'Failed to enroll in course';
      toast.error(message);
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Course not found or you don't have access to view this course.</p>
            <Button variant="secondary" onClick={() => navigate('/student/courses')}>Back to Courses</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">Enroll in Course</h1>

      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{course?.title || 'Course Title'}</h2>
        <p className="text-gray-600 mb-6">{course?.courseCode || course?.code || 'N/A'} • {course?.department || 'N/A'}</p>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b">
            <span className="font-medium text-gray-700">Credits</span>
            <span className="text-gray-900">{course?.credits || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="font-medium text-gray-700">Instructor</span>
            <span className="text-gray-900">{course?.faculty?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="font-medium text-gray-700">Schedule</span>
            <span className="text-gray-900">{course?.schedule?.days?.join(', ') || 'N/A'} • {course?.schedule?.time || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="font-medium text-gray-700">Room</span>
            <span className="text-gray-900">{course?.schedule?.room || 'N/A'}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            By enrolling, you agree to attend all classes and complete all assignments on time.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" icon={FiX} onClick={() => navigate('/student/courses')} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" icon={FiCheck} onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isLoading} className="flex-1">
            {enrollMutation.isLoading ? 'Enrolling...' : 'Confirm Enrollment'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EnrollCourse;
