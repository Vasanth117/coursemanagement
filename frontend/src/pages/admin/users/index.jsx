import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit, FiTrash, FiEye, FiRefreshCw } from 'react-icons/fi';
import { Card, Table, PrimaryButton, SecondaryButton, InputField, SelectField, Badge, Avatar, LoadingSpinner, EmptyState } from '../../../components/common';
import { adminAPI } from '../../../api/admin';

const UsersManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch users from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', roleFilter, statusFilter, searchTerm],
    queryFn: () => adminAPI.getUsers({ 
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    }),
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => adminAPI.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const users = data?.data || [];
  const stats = data?.stats || { total: 0, students: 0, faculty: 0, admins: 0 };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <Avatar name={value} size="sm" />
          <div>
            <p className="font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <Badge variant={value === 'admin' ? 'danger' : value === 'faculty' ? 'info' : 'primary'}>
          {value.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'gray'}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value) => (
        <div className="flex space-x-2">
          <button onClick={() => navigate(`/admin/users/${value}`)} className="text-blue-600 hover:text-blue-800">
            <FiEye className="w-5 h-5" />
          </button>
          <button onClick={() => navigate(`/admin/users/${value}/edit`)} className="text-green-600 hover:text-green-800">
            <FiEdit className="w-5 h-5" />
          </button>
          <button onClick={() => handleDelete(value)} className="text-red-600 hover:text-red-800">
            <FiTrash className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load users</p>
          <PrimaryButton onClick={refetch}>Retry</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <SecondaryButton onClick={refetch} disabled={isLoading}>
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </SecondaryButton>
          <PrimaryButton onClick={() => navigate('/admin/users/create')}>
            <FiPlus className="w-5 h-5 mr-2" />
            Add User
          </PrimaryButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiEye className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Students</p>
              <p className="text-3xl font-bold mt-2">{stats.students}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiEye className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Faculty</p>
              <p className="text-3xl font-bold mt-2">{stats.faculty}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiEye className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Admins</p>
              <p className="text-3xl font-bold mt-2">{stats.admins}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiEye className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <InputField
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <SelectField
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'student', label: 'Students' },
              { value: 'faculty', label: 'Faculty' },
              { value: 'admin', label: 'Admins' }
            ]}
          />
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

      {/* Users Table */}
      <Card>
        {isLoading ? (
          <LoadingSpinner text="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Get started by adding your first user"
            action={<PrimaryButton onClick={() => navigate('/admin/users/create')}>Add User</PrimaryButton>}
          />
        ) : (
          <Table columns={columns} data={users} />
        )}
      </Card>
    </div>
  );
};

export default UsersManagement;
