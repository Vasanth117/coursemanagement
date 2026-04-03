import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiEdit, FiTrash, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { Card, Badge, Avatar, SecondaryButton, Tabs, LoadingSpinner } from '../../../components/common';
import { adminAPI } from '../../../api/admin';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');

  // Fetch user details
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => adminAPI.getUserById(id),
    enabled: !!id,
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: () => adminAPI.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully');
      navigate('/admin/users');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading user details..." />;
  if (error) return <div className="text-center text-red-600">Failed to load user details</div>;
  if (!user) return <div className="text-center">User not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses', count: user.enrolledCourses },
    { id: 'activity', label: 'Activity' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/users')} className="text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-2">View and manage user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <SecondaryButton onClick={() => navigate(`/admin/users/${id}/edit`)}>
            <FiEdit className="w-5 h-5 mr-2" />
            Edit
          </SecondaryButton>
          <SecondaryButton onClick={handleDelete} disabled={deleteMutation.isLoading}>
            <FiTrash className="w-5 h-5 mr-2" />
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </SecondaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <Avatar name={user.name} size="xl" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <div className="mt-4">
              <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'info' : 'primary'}>
                {user.role.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t pt-6">
            <div className="flex items-center text-gray-600">
              <FiMail className="w-5 h-5 mr-3" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiPhone className="w-5 h-5 mr-3" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiCalendar className="w-5 h-5 mr-3" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-blue-800 mt-2">{user.enrolledCourses}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-800 mt-2">{user.completedAssignments}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-purple-600 font-medium">Avg Grade</p>
                    <p className="text-2xl font-bold text-purple-800 mt-2">{user.averageGrade}%</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold text-gray-900">{user.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={user.status === 'active' ? 'success' : 'gray'}>{user.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="text-center py-12">
                <p className="text-gray-600">Course list will be displayed here</p>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <p className="text-gray-600">Activity log will be displayed here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetails;
