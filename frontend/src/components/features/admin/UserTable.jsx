import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { Badge, Avatar } from '../../common';

const UserTable = ({ users = [], onDelete }) => {
  const getRoleBadgeVariant = (role) => {
    const variants = { admin: 'danger', faculty: 'primary', student: 'success' };
    return variants[role] || 'default';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={user._id} className="hover:bg-gray-50 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <Avatar name={user.name} size="md" />
                  <div className="font-medium text-gray-900">{user.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.isActive ? 'success' : 'default'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <Link to={`/admin/users/${user._id}`} className="text-blue-600 hover:text-blue-700">
                    <FiEye className="h-5 w-5" />
                  </Link>
                  <Link to={`/admin/users/${user._id}/edit`} className="text-green-600 hover:text-green-700">
                    <FiEdit className="h-5 w-5" />
                  </Link>
                  <button onClick={() => onDelete(user._id)} className="text-red-600 hover:text-red-700">
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
