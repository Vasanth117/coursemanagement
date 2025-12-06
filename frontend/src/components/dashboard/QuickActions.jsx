import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = ({ actions = [] }) => {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`block p-4 rounded-xl transition-all border ${colorClasses[action.color || 'blue']} animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
