import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../../api/admin';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button, EmptyState } from '../../../components/common';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ApproveCourses = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['adminCourses', filter],
    queryFn: () => adminAPI.getCourses({ status: filter })
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveCourse(id),
    onSuccess: () => {
      toast.success('Course approved successfully');
      queryClient.invalidateQueries(['adminCourses']);
    },
    onError: () => toast.error('Failed to approve course')
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminAPI.rejectCourse(id),
    onSuccess: () => {
      toast.success('Course rejected');
      queryClient.invalidateQueries(['adminCourses']);
    },
    onError: () => toast.error('Failed to reject course')
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Approval</h1>
        <p className="text-gray-600 mt-1">Review and approve course requests</p>
      </div>

      <Card>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {courses?.length === 0 ? (
        <EmptyState title="No courses found" description="No courses match the selected filter" />
      ) : (
        <div className="grid gap-6">
          {courses?.map((course, index) => (
            <Card key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.courseCode}</p>
                    </div>
                    <Badge variant={course.status === 'approved' ? 'success' : course.status === 'pending' ? 'warning' : 'danger'}>
                      {course.status}
                    </Badge>
                  </div>

                  <p className="text-gray-700 mb-4">{course.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Faculty</p>
                      <p className="font-medium text-gray-900">{course.faculty?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Department</p>
                      <p className="font-medium text-gray-900">{course.department}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Credits</p>
                      <p className="font-medium text-gray-900">{course.credits}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Max Students</p>
                      <p className="font-medium text-gray-900">{course.maxStudents}</p>
                    </div>
                  </div>
                </div>

                {course.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button variant="success" icon={FiCheckCircle} onClick={() => approveMutation.mutate(course._id)}>
                      Approve
                    </Button>
                    <Button variant="danger" icon={FiXCircle} onClick={() => rejectMutation.mutate(course._id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveCourses;
