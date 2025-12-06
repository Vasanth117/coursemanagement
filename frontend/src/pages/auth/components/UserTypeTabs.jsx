// src/pages/auth/components/UserTypeTabs.jsx
import React from 'react';
import {
  AcademicCapIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const UserTypeTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'student',
      label: 'Student Login',
      icon: AcademicCapIcon,
      description: 'Access courses, assignments, and grades',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'faculty',
      label: 'Faculty Login',
      icon: UserGroupIcon,
      description: 'Manage courses, students, and resources',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'admin',
      label: 'Admin Login',
      icon: ShieldCheckIcon,
      description: 'System administration and analytics',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex space-x-2 bg-white/5 rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 py-3 px-4 rounded-lg transition-all duration-300 transform
              ${activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-2">
              <tab.icon
                className={`h-6 w-6 ${activeTab === tab.id ? 'text-white' : ''}`}
              />
              <span className="text-sm font-semibold">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Tab Description */}
      {active && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${active.color}`}>
              {React.createElement(active.icon, {
                className: 'h-5 w-5 text-white',
              })}
            </div>
            <div>
              <p className="text-white font-medium">{active.label}</p>
              <p className="text-gray-400 text-sm mt-1">{active.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTypeTabs;
