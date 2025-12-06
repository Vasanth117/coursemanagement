import React from 'react';
import { FiUser, FiUsers, FiShield } from 'react-icons/fi';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    { id: 'student', label: 'Student', icon: FiUser, color: 'from-blue-600 to-blue-700' },
    { id: 'faculty', label: 'Faculty', icon: FiUsers, color: 'from-indigo-600 to-indigo-700' },
    { id: 'admin', label: 'Admin', icon: FiShield, color: 'from-purple-600 to-purple-700' }
  ];

  return (
    <div className="flex space-x-4 mb-8">
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = selectedRole === role.id;
        
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            className={`
              flex-1 py-3 px-4 rounded-xl font-semibold
              transition-all duration-300 transform
              ${isActive 
                ? `bg-gradient-to-r ${role.color} text-white shadow-lg scale-105` 
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon className="w-5 h-5" />
              <span>{role.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
