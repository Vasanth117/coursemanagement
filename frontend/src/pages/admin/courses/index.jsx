import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiSearch, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Card, Table, InputField, SelectField, Badge, PrimaryButton, SecondaryButton, LoadingSpinner, EmptyState } from '../../../components/common';
import { adminAPI } from '../../../api/admin';

const CoursesManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch courses
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-courses', statusFilter, searchTerm],
    queryFn: () => adminAPI.getAllCourses({ 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    }),
  });

  // Approve course mutation
  const approveMutation = useMutation({
    mutationFn: (courseId) => adminAPI.approveCourse(courseId),
    onSuccess: () => {
      toast.success('Course approved successfully');
      queryClient.invalidateQueries(['admin-courses']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve course');
    },
  });

  // Reject course mutation
  const rejectMutation = useMutation({
    mutationFn: ({ courseId, reason }) => adminAPI.rejectCourse(courseId, reason),
    onSuccess: () => {
      toast.success('Course rejected');
      queryClient.invalidateQueries(['admin-courses']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject course');
    },
  });

  const courses = data?.data || [];
  const stats = data?.stats || { total: 0, active: 0, pending: 0, totalStudents: 0 };

  const handleApprove = (courseId) => {
    if (window.confirm('Approve this course?')) {
      approveMutation.mutate(courseId);
    }
  };

  const handleReject = (courseId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectMutation.mutate({ courseId, reason });
    }
  };

  const columns = [
    { header: 'Course Code', accessor: 'code' },
    { header: 'Title', accessor: 'title' },
    { header: 'Faculty', accessor: 'faculty' },
    { header: 'Students', accessor: 'students' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => <Badge variant={value === 'active' ? 'success' : 'gray'}>{value}</Badge>
    },
    {
      header: 'Approval',
      accessor: 'approvalStatus',
      render: (value) => (
        <Badge variant={value === 'approved' ? 'success' : value === 'pending' ? 'warning' : 'danger'}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button onClick={() => navigate(`/admin/courses/${value}`)} className="text-blue-600 hover:text-blue-800">
            <FiEye className="w-5 h-5" />
          </button>
          {row.approvalStatus === 'pending' && (
            <>
              <button onClick={() => handleApprove(value)} className="text-green-600 hover:text-green-800">
                <FiCheckCircle className="w-5 h-5" />
              </button>
              <button onClick={() => handleReject(value)} className="text-red-600 hover:text-red-800">
                <FiXCircle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage and approve courses</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/courses/approve')}>
          Pending Approvals
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Courses</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-2">{stats.active}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-2">{stats.pending}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Total Students</p>
          <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InputField
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <SelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <LoadingSpinner text="Loading courses..." />
        ) : courses.length === 0 ? (
          <EmptyState title="No courses found" description="No courses match your filters" />
        ) : (
          <Table columns={columns} data={courses} />
        )}
      </Card>
    </div>
  );
};

export default CoursesManagement;
